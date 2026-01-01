"use client";

import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  NodeTypes,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeProps,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { MousePointer2, Hand, Undo2, Redo2, ChevronDown } from "lucide-react";
import TextNode from "@/components/nodes/TextNode";
import ImageNode from "@/components/nodes/ImageNode";
import LLMNode from "@/components/nodes/LLMNode";
import {
  TextNodeData,
  ImageNodeData,
  LLMNodeData,
  NodeType,
} from "@/lib/types";
import { callGemini } from "@/lib/llm";
import { LLMRequestSchema } from "@/lib/validation";

// Node types will be created dynamically with callbacks

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

export default function WorkflowCanvas({
  initialNodes = [],
  initialEdges = [],
  onSave,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [panOnDrag, setPanOnDrag] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  
  // Undo/Redo history
  const historyRef = useRef<Array<{ nodes: Node[]; edges: Edge[] }>>([{ nodes: initialNodes, edges: initialEdges }]);
  const historyIndexRef = useRef(0);

  // Update nodes when initialNodes change (e.g., after loading)
  // Use a ref to track if we've initialized to avoid overwriting user changes
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && (initialNodes.length > 0 || initialEdges.length > 0)) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      hasInitialized.current = true;
    }
  }, []);

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const addNode = useCallback(
    (type: NodeType, position?: { x: number; y: number }) => {
      const id = `${type}-${Date.now()}`;
      const defaultPosition = position || { x: Math.random() * 400, y: Math.random() * 400 };

      let data: TextNodeData | ImageNodeData | LLMNodeData;
      switch (type) {
        case "text":
          data = { text: "" };
          break;
        case "image":
          data = { image: "" };
          break;
        case "llm":
          data = {};
          break;
      }

      const newNode: Node = {
        id,
        type,
        position: defaultPosition,
        data,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  // Expose addNode globally for sidebar to call
  useEffect(() => {
    (window as any).__workflowCanvasAddNode = addNode;
    return () => {
      delete (window as any).__workflowCanvasAddNode;
    };
  }, [addNode]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow") as NodeType;
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  const handleNodeUpdate = useCallback(
    (nodeId: string, newData: Partial<TextNodeData | ImageNodeData | LLMNodeData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        )
      );
    },
    [setNodes]
  );

  const handleRunLLM = useCallback(
    async (nodeId: string) => {
      const llmNode = nodes.find((n) => n.id === nodeId && n.type === "llm");
      if (!llmNode) {
        console.warn(`[WorkflowCanvas] LLM node ${nodeId} not found`);
        return;
      }

      // Set loading state
      handleNodeUpdate(nodeId, { isLoading: true, error: undefined });

      try {
        // Read connections directly from edges (more reliable than node data)
        const incomingEdges = edges.filter((e) => e.target === nodeId);
        let systemPrompt: string | undefined;
        let userMessage: string | undefined;
        const images: string[] = [];

        for (const edge of incomingEdges) {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          if (!sourceNode) continue;

          if (edge.targetHandle === "system_prompt" && sourceNode.type === "text") {
            const text = (sourceNode.data as TextNodeData).text;
            if (text) systemPrompt = text;
          } else if (edge.targetHandle === "user_message" && sourceNode.type === "text") {
            const text = (sourceNode.data as TextNodeData).text;
            if (text) userMessage = text;
          } else if (edge.targetHandle === "images" && sourceNode.type === "image") {
            const imageData = (sourceNode.data as ImageNodeData).image;
            if (imageData) {
              images.push(imageData);
            }
          }
        }

        if (!userMessage) {
          throw new Error("User message is required. Connect a Text Node to the 'user_message' input.");
        }

        const request = {
          system_prompt: systemPrompt,
          user_message: userMessage,
          images: images.length > 0 ? images : undefined,
        };

        const validated = LLMRequestSchema.parse(request);

        // Call Gemini API via API route
        const response = await fetch("/api/llm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validated),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const { output } = await response.json();

        // Update node with output
        handleNodeUpdate(nodeId, {
          output,
          isLoading: false,
          error: undefined,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        console.error(`[WorkflowCanvas] LLM node ${nodeId} error:`, errorMessage);
        handleNodeUpdate(nodeId, {
          isLoading: false,
          error: errorMessage,
        });
      }
    },
    [nodes, edges, handleNodeUpdate]
  );

  // Create stable node types - LLM node will receive onRun via props
  // Must be defined after handleRunLLM
  const nodeTypes: NodeTypes = useMemo(() => ({
    text: TextNode,
    image: ImageNode,
    llm: (props: NodeProps<LLMNodeData>) => <LLMNode {...props} onRun={handleRunLLM} />,
  }), [handleRunLLM]);

  // Update LLM node data when edges change (debounced to avoid infinite loops)
  useEffect(() => {
    const llmNodes = nodes.filter((n) => n.type === "llm");
    if (llmNodes.length === 0) return;

    const timeoutId = setTimeout(() => {
      llmNodes.forEach((llmNode) => {
        const incomingEdges = edges.filter((e) => e.target === llmNode.id);
        let systemPrompt: string | undefined;
        let userMessage: string | undefined;
        const images: string[] = [];

        for (const edge of incomingEdges) {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          if (!sourceNode) continue;

          if (edge.targetHandle === "system_prompt" && sourceNode.type === "text") {
            systemPrompt = (sourceNode.data as TextNodeData).text;
          } else if (edge.targetHandle === "user_message" && sourceNode.type === "text") {
            userMessage = (sourceNode.data as TextNodeData).text;
          } else if (edge.targetHandle === "images" && sourceNode.type === "image") {
            const imageData = (sourceNode.data as ImageNodeData).image;
            if (imageData) {
              images.push(imageData);
            }
          }
        }

        const currentData = llmNode.data as LLMNodeData;
        if (
          currentData.systemPrompt !== systemPrompt ||
          currentData.userMessage !== userMessage ||
          JSON.stringify(currentData.images || []) !== JSON.stringify(images)
        ) {
          handleNodeUpdate(llmNode.id, {
            systemPrompt,
            userMessage,
            images: images.length > 0 ? images : undefined,
          });
        }
      });
    }, 100); // Debounce to prevent infinite loops

    return () => clearTimeout(timeoutId);
  }, [edges, nodes, handleNodeUpdate]);

  // Pass through node changes directly - React Flow handles dragging
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  // Save workflow on changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSave) {
        onSave(nodes, edges);
      }
    }, 500); // Debounce saves by 500ms

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, onSave]);

  // Track zoom level
  const handleMove = useCallback(() => {
    if (reactFlowInstance) {
      const zoom = reactFlowInstance.getZoom();
      setZoomLevel(zoom);
    }
  }, [reactFlowInstance]);

  // Initialize zoom level
  useEffect(() => {
    if (reactFlowInstance) {
      const zoom = reactFlowInstance.getZoom();
      setZoomLevel(zoom);
    }
  }, [reactFlowInstance]);

  // Update cursor style based on pan mode
  useEffect(() => {
    const updateCursor = () => {
      const pane = document.querySelector('.react-flow__pane') as HTMLElement;
      if (pane) {
        if (panOnDrag) {
          pane.style.cursor = 'grab';
          pane.classList.add('pan-mode');
          pane.classList.remove('select-mode');
        } else {
          pane.style.cursor = 'default';
          pane.classList.add('select-mode');
          pane.classList.remove('pan-mode');
        }
      }
    };
    
    updateCursor();
    // Also update when React Flow instance is ready
    if (reactFlowInstance) {
      const timer = setTimeout(updateCursor, 100);
      return () => clearTimeout(timer);
    }
  }, [panOnDrag, reactFlowInstance]);

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const state = historyRef.current[historyIndexRef.current];
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [setNodes, setEdges]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const state = historyRef.current[historyIndexRef.current];
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [setNodes, setEdges]);

  // Save to history
  useEffect(() => {
    const currentState = { nodes, edges };
    const lastState = historyRef.current[historyRef.current.length - 1];
    
    // Only save if state actually changed
    if (JSON.stringify(currentState) !== JSON.stringify(lastState)) {
      // Remove any future history if we're not at the end
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push(currentState);
      historyIndexRef.current = historyRef.current.length - 1;
      
      // Limit history size
      if (historyRef.current.length > 50) {
        historyRef.current.shift();
        historyIndexRef.current--;
      }
    }
  }, [nodes, edges]);

  // Zoom presets
  const zoomPresets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
  const handleZoomChange = useCallback((zoom: number) => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomTo(zoom);
      setShowZoomMenu(false);
    }
  }, [reactFlowInstance]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        if (onSave) {
          onSave(nodes, edges);
        }
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        const selectedNodes = nodes.filter((n) => n.selected);
        if (selectedNodes.length > 0) {
          setNodes((nds) => nds.filter((n) => !n.selected));
          setEdges((eds) =>
            eds.filter(
              (e) => !selectedNodes.some((n) => n.id === e.source || n.id === e.target)
            )
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, edges, setNodes, setEdges, onSave]);

  return (
    <div 
      className="w-full h-screen relative" 
      ref={reactFlowWrapper}
      style={{
        cursor: panOnDrag ? 'grab' : 'default',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onMove={handleMove}
        onMoveStart={handleMove}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        maxZoom={3}
        panOnDrag={panOnDrag}
        nodesDraggable={!panOnDrag}
        nodesConnectable={!panOnDrag}
        elementsSelectable={!panOnDrag}
        zoomOnPinch={true}
        panOnScroll={true}
        zoomOnScroll={false}
        className={`bg-[#0e0e13] ${panOnDrag ? 'cursor-grab' : 'cursor-default'}`}
      >
        <Background 
          gap={24}
          size={1}
          color="#66616b"
        />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "text":
                return "#A5F3FC";
              case "image":
                return "#A5F3FC";
              case "llm":
                return "#F5D90A";
              default:
                return "#B0B3C0";
            }
          }}
          className="bg-dark-sidebar border border-dark-border rounded-md"
          maskColor="rgba(0, 0, 0, 0.6)"
        />
        
        {/* Custom Toolbar - Fixed at bottom center */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div 
            className="pointer-events-auto"
            style={{
              borderRadius: '8px',
              backgroundColor: '#212126',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 8px',
              height: '50px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Cursor Tool */}
            <button
              onClick={() => setPanOnDrag(false)}
              className="grid place-items-center transition-all duration-200 cursor-pointer"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                background: !panOnDrag ? '#F4F5A5' : 'transparent',
                opacity: !panOnDrag ? 1 : 0.875,
              }}
              onMouseEnter={(e) => {
                if (panOnDrag) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (panOnDrag) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              title="Select tool"
            >
              <MousePointer2 
                className="w-6 h-6" 
                strokeWidth={1.125}
                style={{ 
                  color: !panOnDrag ? '#0B0B0D' : '#C8CBD3',
                }}
              />
            </button>

            {/* Hand Tool */}
            <button
              onClick={() => setPanOnDrag(true)}
              className="grid place-items-center transition-all duration-200 cursor-pointer"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                background: panOnDrag ? '#F4F5A5' : 'transparent',
                opacity: panOnDrag ? 1 : 0.875,
              }}
              onMouseEnter={(e) => {
                if (!panOnDrag) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!panOnDrag) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              title="Pan tool"
            >
              <Hand 
                className="w-6 h-6" 
                strokeWidth={1.125}
                style={{ 
                  color: panOnDrag ? '#0B0B0D' : '#C8CBD3',
                }}
              />
            </button>

            {/* Divider */}
            <div 
              style={{
                height: '24px',
                width: '1px',
                backgroundColor: '#444448',
                marginLeft: '2px',
                opacity: 0.8,
                borderRadius: '999px',
              }}
            />

            {/* Undo */}
            <button
              onClick={handleUndo}
              disabled={historyIndexRef.current === 0}
              className="grid place-items-center transition-all duration-200 cursor-pointer disabled:pointer-events-none"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                background: 'transparent',
                marginRight: '-8px',
                opacity: historyIndexRef.current === 0 ? 0.5 : 0.875,
              }}
              onMouseEnter={(e) => {
                if (historyIndexRef.current > 0) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Undo"
            >
              <Undo2 
                className="w-6 h-6" 
                strokeWidth={1.125}
                style={{ color: '#C8CBD3' }}
              />
            </button>

            {/* Redo */}
            <button
              onClick={handleRedo}
              disabled={historyIndexRef.current >= historyRef.current.length - 1}
              className="grid place-items-center transition-all duration-200 cursor-pointer disabled:pointer-events-none"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                background: 'transparent',
                opacity: historyIndexRef.current >= historyRef.current.length - 1 ? 0.5 : 0.875,
              }}
              onMouseEnter={(e) => {
                if (historyIndexRef.current < historyRef.current.length - 1) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Redo"
            >
              <Redo2 
                className="w-6 h-6" 
                strokeWidth={1.125}
                style={{ color: '#C8CBD3' }}
              />
            </button>

            {/* Divider */}
            <div 
              style={{
                height: '24px',
                width: '1px',
                backgroundColor: '#2B2E36',
                marginRight: '1px',
                opacity: 0.8,
                borderRadius: '999px',
              }}
            />

            {/* Zoom Display */}
            <div className="relative">
              <button
                onClick={() => setShowZoomMenu(!showZoomMenu)}
                className="flex items-center transition-all duration-200 cursor-pointer"
                style={{
                  fontFamily: 'Inter, SF Pro Display, system-ui, -apple-system, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#E6E7EB',
                  background: '#212126',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  gap: '6px',
                  minWidth: '70px',
                }}
                title="Zoom level"
              >
                <span>{Math.round(zoomLevel * 100)}%</span>
                <ChevronDown 
                  className="w-4 h-4 flex-shrink-0" 
                  strokeWidth={1.125}
                  style={{ color: '#E6E7EB' }}
                />
              </button>
              
              {/* Zoom Menu */}
              {showZoomMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowZoomMenu(false)}
                  />
                  <div 
                    className="absolute bottom-full left-0 mb-2 rounded-lg shadow-lg min-w-[120px] py-1 z-20"
                    style={{
                      background: '#111216',
                      border: '1px solid #2A2D35',
                    }}
                  >
                    {zoomPresets.map((zoom) => (
                      <button
                        key={zoom}
                        onClick={() => handleZoomChange(zoom)}
                        className={`w-full px-3 py-1.5 text-left text-sm transition-colors duration-200 rounded ${
                          Math.abs(zoomLevel - zoom) < 0.01
                            ? ""
                            : "hover:bg-white/5"
                        }`}
                        style={{
                          color: Math.abs(zoomLevel - zoom) < 0.01 ? '#0A0A0D' : '#E6E7EB',
                          background: Math.abs(zoomLevel - zoom) < 0.01 ? '#F4F5A5' : 'transparent',
                          fontFamily: 'Inter, SF Pro Display, system-ui, -apple-system, sans-serif',
                          fontWeight: 500,
                        }}
                      >
                        {Math.round(zoom * 100)}%
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </ReactFlow>
    </div>
  );
}


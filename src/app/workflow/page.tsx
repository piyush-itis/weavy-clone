"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ReactFlowProvider } from "reactflow";
import Sidebar from "@/components/sidebar/Sidebar";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";
import { Node, Edge } from "reactflow";
import { NodeType } from "@/lib/types";
import { saveWorkflow, loadWorkflow } from "@/lib/workflow-storage";
import { Save, Download, Upload, Trash2 } from "lucide-react";

export default function WorkflowPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>("");

  // Load workflow on mount
  useEffect(() => {
    const saved = loadWorkflow();
    if (saved) {
      setNodes(saved.nodes);
      setEdges(saved.edges);
    }
  }, []);

  const canvasRef = useRef<{ addNode: (type: NodeType) => void } | null>(null);

  const handleAddNode = useCallback((type: NodeType) => {
    // Call addNode on the canvas via the exposed function
    const addNodeFn = (window as any).__workflowCanvasAddNode;
    if (addNodeFn) {
      addNodeFn(type);
    }
  }, []);

  const handleSave = useCallback((nds: Node[], eds: Edge[]) => {
    setNodes(nds);
    setEdges(eds);
    saveWorkflow(nds, eds);
    setSaveStatus("Saved!");
    setTimeout(() => setSaveStatus(""), 2000);
  }, []);

  const handleExport = useCallback(() => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            if (data.nodes && data.edges) {
              setNodes(data.nodes);
              setEdges(data.edges);
              saveWorkflow(data.nodes, data.edges);
              setSaveStatus("Imported!");
              setTimeout(() => setSaveStatus(""), 2000);
            }
          } catch (error) {
            alert("Failed to import workflow. Invalid file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const handleClear = useCallback(() => {
    if (confirm("Are you sure you want to clear the workflow?")) {
      setNodes([]);
      setEdges([]);
      saveWorkflow([], []);
    }
  }, []);

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar onAddNode={handleAddNode} />
      <div className="flex-1 flex flex-col relative">
        {/* Top Cards */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          {/* File Name Card - Top Left */}
          <div 
            className="pointer-events-auto"
            style={{
              background: '#212126',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '8px',
              padding: '10px 16px',
            }}
          >
            <input
              type="text"
              placeholder="untitled"
              defaultValue="untitled"
              className="bg-transparent border-none outline-none text-text-primary placeholder-text-secondary text-[14px] font-medium"
              style={{
                fontFamily: 'DM Sans, Inter, SF Pro Display, system-ui, -apple-system, sans-serif',
                minWidth: '220px',
              }}
            />
          </div>

          {/* Action Buttons Card - Top Right */}
          <div 
            className="pointer-events-auto flex items-center gap-2"
            style={{
              background: '#212126',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '8px',
              padding: '6px 8px',
            }}
          >
            {saveStatus && (
              <span className="text-sm text-accent-mint font-medium px-2">{saveStatus}</span>
            )}
            <button
              onClick={() => handleSave(nodes, edges)}
              className="px-3 py-1.5 bg-accent-yellow text-dark-bg rounded-md hover:opacity-90 transition-all duration-200 flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:ring-offset-2 focus:ring-offset-dark-sidebar"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-transparent text-text-secondary rounded-md hover:bg-dark-hover hover:text-text-primary transition-all duration-200 flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:ring-offset-2 focus:ring-offset-dark-sidebar"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleImport}
              className="px-3 py-1.5 bg-transparent text-text-secondary rounded-md hover:bg-dark-hover hover:text-text-primary transition-all duration-200 flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:ring-offset-2 focus:ring-offset-dark-sidebar"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 bg-transparent text-error rounded-md hover:bg-dark-hover transition-all duration-200 flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 focus:ring-offset-dark-sidebar"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
        {/* Canvas */}
        <ReactFlowProvider>
          <WorkflowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onSave={handleSave}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}


"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Image as ImageIcon, Bot, Search, History, Download, Upload, Eye, Type, ArrowUpDown, Settings, Image as ImageGallery, ChevronDown, Save, Trash2 } from "lucide-react";
import { NodeType } from "@/lib/types";
import { Node, Edge } from "reactflow";

interface SidebarProps {
  onAddNode: (type: NodeType) => void;
  onPanelStateChange?: (isOpen: boolean) => void;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onExport?: () => void;
  onImport?: () => void;
  onClear?: () => void;
  nodes?: Node[];
  edges?: Edge[];
  saveStatus?: string;
}

export default function Sidebar({ onAddNode, onPanelStateChange, onSave, onExport, onImport, onClear, nodes = [], edges = [], saveStatus }: SidebarProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<'search' | 'quick-access' | 'text' | 'image' | 'llm' | null>(null);
  const [recentNodes, setRecentNodes] = useState<NodeType[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Notify parent when panel state changes
  useEffect(() => {
    onPanelStateChange?.(isPanelOpen);
  }, [isPanelOpen, onPanelStateChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as HTMLElement)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSaveClick = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
    setIsDropdownOpen(false);
  };
  
  const panelRef = useRef<HTMLDivElement>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const quickAccessSectionRef = useRef<HTMLDivElement>(null);
  const textNodeSectionRef = useRef<HTMLDivElement>(null);
  const imageNodeSectionRef = useRef<HTMLDivElement>(null);
  const llmNodeSectionRef = useRef<HTMLDivElement>(null);

  const handleOpenPanel = (scrollTo?: 'search' | 'quick-access' | 'text' | 'image' | 'llm') => {
    if (scrollTo) {
      if (activeButton === scrollTo) {
        // If clicking the same button, close the panel
        setIsPanelOpen(false);
        setActiveButton(null);
        return;
      }
      setActiveButton(scrollTo);
    }
    setIsPanelOpen(true);
    
    // Scroll to the desired section after panel opens
    setTimeout(() => {
      let targetRef: React.RefObject<HTMLDivElement> | null = null;
      
      switch (scrollTo) {
        case 'search':
          targetRef = searchSectionRef as React.RefObject<HTMLDivElement>;
          break;
        case 'quick-access':
          targetRef = quickAccessSectionRef as React.RefObject<HTMLDivElement>;
          break;
        case 'text':
          targetRef = textNodeSectionRef as React.RefObject<HTMLDivElement>;
          break;
        case 'image':
          targetRef = imageNodeSectionRef as React.RefObject<HTMLDivElement>;
          break;
        case 'llm':
          targetRef = llmNodeSectionRef as React.RefObject<HTMLDivElement>;
          break;
      }
      
      if (targetRef && targetRef.current && panelRef.current) {
        const sectionTop = targetRef.current.offsetTop;
        panelRef.current.scrollTo({
          top: sectionTop - 20,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setActiveButton(null);
  };

  const handleAddNode = (type: NodeType) => {
    // Update recent nodes (keep last 3)
    setRecentNodes(prev => {
      const filtered = prev.filter(t => t !== type);
      return [type, ...filtered].slice(0, 3);
    });
    
    onAddNode(type);
    handleClosePanel();
  };

  const nodeTypes = [
    {
      type: "text" as NodeType,
      label: "Text Node",
      icon: FileText,
      color: "blue",
    },
    {
      type: "image" as NodeType,
      label: "Image Node",
      icon: ImageIcon,
      color: "green",
    },
    {
      type: "llm" as NodeType,
      label: "LLM Node",
      icon: Bot,
      color: "purple",
    },
  ];


  return (
    <>
    <div
      className="border-r border-dark-border h-screen sticky top-0 flex flex-col w-16 relative z-50"
      style={{
        backgroundColor: '#212126',
    }}
    >
      {/* Logo W with Dropdown */}
      <div className="p-4 flex items-center justify-center relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center text-accent-yellow font-bold text-xl">
            W
          </div>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-1 rounded-md hover:bg-dark-hover text-text-secondary hover:text-text-primary transition-all duration-200"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={1.125} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-2 w-48 bg-dark-node border border-dark-border rounded-lg shadow-lg z-50"
            style={{
              backgroundColor: '#1A1C22',
            }}
          >
            <div className="p-2">
              {saveStatus && (
                <div className="px-3 py-2 text-sm text-accent-mint font-medium mb-2">
                  {saveStatus}
                </div>
              )}
              <button
                onClick={handleSaveClick}
                className="w-full px-3 py-2 bg-accent-yellow text-dark-bg rounded-md hover:opacity-90 transition-all duration-200 flex items-center gap-2 text-sm font-medium mb-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => {
                  onExport?.();
                  setIsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 bg-transparent text-text-secondary rounded-md hover:bg-dark-hover hover:text-text-primary transition-all duration-200 flex items-center gap-2 text-sm font-medium mb-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => {
                  onImport?.();
                  setIsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 bg-transparent text-text-secondary rounded-md hover:bg-dark-hover hover:text-text-primary transition-all duration-200 flex items-center gap-2 text-sm font-medium mb-2"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={() => {
                  onClear?.();
                  setIsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 bg-transparent text-error rounded-md hover:bg-dark-hover transition-all duration-200 flex items-center gap-2 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-2 space-y-3">
        {/* Search Button */}
        <button
          onClick={() => handleOpenPanel('search')}
          className={`w-full p-2.5 rounded-md transition-all duration-200 flex items-center justify-center group cursor-pointer hover:bg-dark-hover relative ${activeButton === 'search' ? '' : ''}`}
          style={{
            backgroundColor: activeButton === 'search' ? '#f7ffa8' : 'transparent',
          }}
          title="Search"
        >
          <Search className={`w-5 h-5 transition-colors duration-200 ${activeButton === 'search' ? 'text-dark-bg' : 'text-text-secondary group-hover:text-text-primary'}`} strokeWidth={1.125} />
          <span 
            className="absolute left-full ml-3 px-2.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-[180ms] ease-in-out pointer-events-none z-50"
            style={{
              backgroundColor: '#2A2B32',
              color: '#EDEDEF',
            }}
          >
            Search
          </span>
        </button>

        {/* Quick Access Button */}
        <button
          onClick={() => handleOpenPanel('quick-access')}
          className={`w-full p-2.5 rounded-md transition-all duration-200 flex items-center justify-center group cursor-pointer hover:bg-dark-hover relative ${activeButton === 'quick-access' ? '' : ''}`}
          style={{
            backgroundColor: activeButton === 'quick-access' ? '#f7ffa8' : 'transparent',
          }}
          title="Quick Access"
        >
          <History className={`w-5 h-5 transition-colors duration-200 ${activeButton === 'quick-access' ? 'text-dark-bg' : 'text-text-secondary group-hover:text-text-primary'}`} strokeWidth={1.125} />
          <span 
            className="absolute left-full ml-3 px-2.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-[180ms] ease-in-out pointer-events-none z-50"
            style={{
              backgroundColor: '#2A2B32',
              color: '#EDEDEF',
            }}
          >
            Quick Access
          </span>
        </button>

        {/* Node Types */}
        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon;
          const isActive = activeButton === nodeType.type;
          return (
            <button
              key={nodeType.type}
              onClick={() => handleOpenPanel(nodeType.type as 'text' | 'image' | 'llm')}
              className={`w-full p-2.5 rounded-md transition-all duration-200 flex items-center justify-center group cursor-pointer hover:bg-dark-hover relative ${isActive ? '' : ''}`}
              style={{
                backgroundColor: isActive ? '#f7ffa8' : 'transparent',
              }}
              title={nodeType.label}
            >
              <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-dark-bg' : 'text-text-secondary group-hover:text-text-primary'}`} strokeWidth={1.125} />
              <span 
                className="absolute left-full ml-3 px-2.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-[180ms] ease-in-out pointer-events-none z-50"
                style={{
                  backgroundColor: '#2A2B32',
                  color: '#EDEDEF',
                }}
              >
                {nodeType.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>

    {/* Side Panel */}
    <div
      className={`fixed left-16 top-0 h-screen bg-dark-sidebar border-r border-dark-border transition-transform duration-300 ease-in-out z-40 ${
        isPanelOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{
        width: '263px',
        backgroundColor: '#212126',
      }}
    >
      <div ref={panelRef} className="h-full flex flex-col overflow-y-auto">
        {/* Untitled Card - Part of Panel */}
        <div 
          className="p-4 flex-shrink-0"
          style={{
            paddingTop: '16px',
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingBottom: '16px',
          }}
        >
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
              className="bg-transparent border-none outline-none text-text-primary placeholder-text-secondary text-[14px] font-medium w-full"
              style={{
                fontFamily: 'DM Sans, Inter, SF Pro Display, system-ui, -apple-system, sans-serif',
              }}
            />
          </div>
        </div>

        {/* Search Section */}
        <div ref={searchSectionRef} className="p-4 border-b border-dark-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" strokeWidth={1.125} />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-10 py-1 bg-[#1A1C22] border border-[#333336] rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-[#808082] focus:ring-offset-2 focus:ring-offset-dark-sidebar text-sm"
              style={{
                backgroundColor: '#1A1C22',
              }}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-dark-hover rounded transition-colors duration-200">
              <ArrowUpDown className="w-4 h-4 text-text-secondary" strokeWidth={1.125} />
            </button>
          </div>

          {/* Input/Output Pills */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-text-secondary text-sm">From</span>
            <button className="px-2 py-0 bg-[#2b2b2f] rounded-sm text-[#808082] text-sm hover:bg-dark-hover transition-colors duration-200">
              Input
            </button>
            <span className="text-text-secondary text-sm">to</span>
            <button className="px-2 py-0 bg-[#2b2b2f] rounded-sm text-[#808082] text-sm hover:bg-dark-hover transition-colors duration-200">
              Output
            </button>
          </div>
        </div>

        {/* Quick Access Section - Recent Nodes */}
        <div ref={quickAccessSectionRef} className="p-4 border-b border-dark-border">
          <h3 className="text-text-primary font-semibold text-base mb-4">Quick access</h3>
          {recentNodes.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {recentNodes.map((nodeType) => {
                const nodeTypeData = nodeTypes.find(nt => nt.type === nodeType);
                if (!nodeTypeData) return null;
                const Icon = nodeTypeData.icon;
                return (
                  <button
                    key={nodeType}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/reactflow", nodeType);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onClick={() => handleAddNode(nodeType)}
                    className="p-5 bg-[#212126] border border-[#333336] rounded-md hover:bg-[#333336] transition-all duration-200 flex flex-col items-center gap-1 group cursor-grab active:cursor-grabbing"
                  >
                    <div className="w-10 h-10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
                    </div>
                    <span className="text-text-primary text-sm font-medium">{nodeTypeData.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">No recently used nodes</p>
          )}
        </div>

        {/* Text Node Section */}
        <div ref={textNodeSectionRef} className="p-4 border-b border-dark-border">
          <h3 className="text-text-primary font-semibold text-base mb-4">Text Node</h3>
          <button
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("application/reactflow", "text");
              e.dataTransfer.effectAllowed = "move";
            }}
            onClick={() => handleAddNode('text')}
            className="p-5 bg-[#212126] border border-[#333336] rounded-md hover:bg-[#333336] transition-all duration-200 flex flex-col items-center gap-1 group cursor-grab active:cursor-grabbing"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
            </div>
            <span className="text-text-primary text-sm font-medium">Text Node</span>
          </button>
        </div>

        {/* Image Node Section */}
        <div ref={imageNodeSectionRef} className="p-4 border-b border-dark-border">
          <h3 className="text-text-primary font-semibold text-base mb-4">Image Node</h3>
          <button
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("application/reactflow", "image");
              e.dataTransfer.effectAllowed = "move";
            }}
            onClick={() => handleAddNode('image')}
            className="p-4 bg-[#212126] border border-[#333336] rounded-md hover:bg-[#333336] transition-all duration-200 flex flex-col items-center gap-1 group cursor-grab active:cursor-grabbing"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
            </div>
            <span className="text-text-primary text-sm font-medium">Image Node</span>
          </button>
        </div>

        {/* LLM Node Section */}
        <div ref={llmNodeSectionRef} className="p-4">
          <h3 className="text-text-primary font-semibold text-base mb-4">LLM Node</h3>
          <button
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("application/reactflow", "llm");
              e.dataTransfer.effectAllowed = "move";
            }}
            onClick={() => handleAddNode('llm')}
            className="p-5 bg-[#212126] border border-[#333336] rounded-md hover:bg-[#333336] transition-all duration-200 flex flex-col items-center gap-1 group cursor-grab active:cursor-grabbing"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
            </div>
            <span className="text-text-primary text-sm font-medium">LLM Node</span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}


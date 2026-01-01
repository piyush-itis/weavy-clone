"use client";

import { useState, useMemo } from "react";
import { FileText, Image as ImageIcon, Bot, Search, ChevronLeft, ChevronRight, History } from "lucide-react";
import { NodeType } from "@/lib/types";

interface SidebarProps {
  onAddNode: (type: NodeType) => void;
}

export default function Sidebar({ onAddNode }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredNodeTypes = useMemo(() => {
    if (!searchQuery.trim()) return nodeTypes;
    const query = searchQuery.toLowerCase();
    return nodeTypes.filter((nodeType) =>
      nodeType.label.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div
      className={`border-r border-dark-border h-screen sticky top-0 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
      style={{
        backgroundColor: '#212126',
    }}
  >
      {/* Logo W */}
      <div className="p-4 border-b border-dark-border flex items-center justify-between relative">
        {collapsed ? (
          <div className="w-full flex items-center justify-center">
            <div className="w-8 h-8 flex items-center justify-center text-accent-yellow font-bold text-xl">
              W
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center text-accent-yellow font-bold text-xl">
              W
            </div>
            <span className="text-text-primary font-semibold">Weavy</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-dark-hover text-text-secondary hover:text-text-primary transition-all duration-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {/* Search Button */}
        <button
          onClick={() => !collapsed && {}}
          className={`w-full ${collapsed ? 'p-2.5' : 'px-3 py-2.5'} rounded-md transition-all duration-200 flex items-center ${collapsed ? 'justify-center' : 'gap-3'} group cursor-pointer hover:bg-dark-hover`}
          title="Search"
        >
          <Search className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors duration-200" />
          {!collapsed && (
            <span className="font-medium text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-200">
              Search
            </span>
          )}
        </button>

        {/* Quick Access Button */}
        <button
          className={`w-full ${collapsed ? 'p-2.5' : 'px-3 py-2.5'} rounded-md transition-all duration-200 flex items-center ${collapsed ? 'justify-center' : 'gap-3'} group cursor-pointer hover:bg-dark-hover`}
          title="Quick Access"
        >
          <History className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors duration-200" />
          {!collapsed && (
            <span className="font-medium text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-200">
              Quick Access
            </span>
          )}
        </button>

        {/* Node Types */}
        {collapsed ? (
          // Collapsed view - icons only
          nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <button
                key={nodeType.type}
                onClick={() => onAddNode(nodeType.type)}
                className="w-full p-2.5 rounded-md transition-all duration-200 flex items-center justify-center group cursor-pointer hover:bg-dark-hover"
                title={nodeType.label}
              >
                <Icon className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors duration-200" />
              </button>
            );
          })
        ) : (
          // Expanded view - with labels
          filteredNodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <button
                key={nodeType.type}
                onClick={() => onAddNode(nodeType.type)}
                className="w-full px-3 py-2.5 rounded-md transition-all duration-200 flex items-center gap-3 group cursor-pointer hover:bg-dark-hover"
              >
                <Icon className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors duration-200" />
                <span className="font-medium text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-200">
                  {nodeType.label}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}


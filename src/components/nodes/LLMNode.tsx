"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { LLMNodeData } from "@/lib/types";
import { Bot, Loader2, AlertCircle } from "lucide-react";

interface LLMNodeProps extends NodeProps<LLMNodeData> {
  onRun?: (nodeId: string) => void;
}

export default function LLMNode({ data, id, onRun }: LLMNodeProps) {
  const hasUserMessage = !!data.userMessage;
  const hasError = !!data.error;
  const isLoading = data.isLoading || false;

  // Log friendly error if required input is missing (only when button is clicked)
  const handleRunClick = () => {
    if (!hasUserMessage) {
      console.warn(`[LLM Node ${id}] Missing required input: user_message`);
    }
    if (onRun && hasUserMessage && !isLoading) {
      onRun(id);
    }
  };

  return (
    <div className="px-4 py-3 rounded-lg bg-dark-node border border-dark-border min-w-[280px] shadow-lg" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)' }}>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-dark-border">
        <Bot className="w-4 h-4 text-accent-yellow" />
        <div className="font-semibold text-sm text-text-primary">LLM Node</div>
      </div>

      {/* Input Handles */}
      <div className="space-y-2.5 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <Handle
            type="target"
            position={Position.Left}
            id="system_prompt"
            className="w-3 h-3 bg-text-secondary border-2 border-dark-node"
            style={{ top: '30%' }}
          />
          <span className="text-text-secondary">System Prompt (optional)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Handle
            type="target"
            position={Position.Left}
            id="user_message"
            className="w-3 h-3 bg-accent-mint border-2 border-dark-node"
            style={{ top: '50%' }}
          />
          <span className={hasUserMessage ? "text-text-secondary" : "text-error"}>
            User Message {!hasUserMessage && "(required)"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Handle
            type="target"
            position={Position.Left}
            id="images"
            className="w-3 h-3 bg-accent-mint border-2 border-dark-node"
            style={{ top: '70%' }}
          />
          <span className="text-text-secondary">Images (optional)</span>
        </div>
      </div>

      {/* Run Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRunClick();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        disabled={!hasUserMessage || isLoading}
        className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
          hasUserMessage && !isLoading
            ? "bg-accent-yellow text-dark-bg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:ring-offset-2 focus:ring-offset-dark-node"
            : "bg-dark-hover text-text-secondary cursor-not-allowed border border-dark-border"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Running...
          </span>
        ) : (
          "Run Workflow"
        )}
      </button>

      {/* Error Message */}
      {hasError && (
        <div className="mt-3 p-2.5 bg-dark-hover border border-error/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
          <span className="text-xs text-error">{data.error}</span>
        </div>
      )}

      {/* Output */}
      {data.output && !isLoading && (
        <div className="mt-3 p-3 bg-dark-bg border border-dark-border rounded-lg">
          <div className="text-xs font-semibold text-text-primary mb-2">Output:</div>
          <div className="text-sm text-text-secondary whitespace-pre-wrap max-h-48 overflow-y-auto">
            {data.output}
          </div>
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-accent-yellow border-2 border-dark-node"
        style={{ top: '50%' }}
      />
    </div>
  );
}


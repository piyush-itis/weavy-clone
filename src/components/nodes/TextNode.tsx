"use client";

import { useCallback } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { TextNodeData } from "@/lib/types";
import { FileText } from "lucide-react";

export default function TextNode({ data, id }: NodeProps<TextNodeData>) {
  const { updateNodeData } = useReactFlow();

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { text: evt.target.value });
    },
    [id, updateNodeData]
  );

  return (
    <div className="px-4 py-3 rounded-lg bg-dark-node border border-dark-border min-w-[200px] shadow-lg" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)' }}>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-dark-border">
        <FileText className="w-4 h-4 text-accent-mint" />
        <div className="font-semibold text-sm text-text-primary">Text Node</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-accent-mint border-2 border-dark-node"
        style={{ top: '50%' }}
      />
      <textarea
        className="w-full p-3 text-sm bg-dark-bg border border-dark-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-transparent text-text-primary placeholder-text-secondary transition-all duration-200"
        rows={4}
        value={data.text || ""}
        onChange={onChange}
        placeholder="Enter text..."
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}


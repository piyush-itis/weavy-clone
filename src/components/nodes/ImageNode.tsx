"use client";

import { useCallback, useRef } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { ImageNodeData } from "@/lib/types";
import { Image as ImageIcon, Upload, X } from "lucide-react";

export default function ImageNode({ data, id }: NodeProps<ImageNodeData>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateNodeData } = useReactFlow();

  const handleFileSelect = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateNodeData(id, { image: base64, filename: file.name });
      };
      reader.readAsDataURL(file);
    },
    [id, updateNodeData]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect(file);
            break;
          }
        }
      }
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const clearImage = useCallback(() => {
    updateNodeData(id, { image: "", filename: undefined });
  }, [id, updateNodeData]);

  return (
    <div
      className="px-4 py-3 rounded-lg bg-dark-node border border-dark-border min-w-[200px] shadow-lg"
      style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)' }}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-dark-border">
        <ImageIcon className="w-4 h-4 text-accent-mint" />
        <div className="font-semibold text-sm text-text-primary">Image Node</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-accent-mint border-2 border-dark-node"
        style={{ top: '50%' }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
      {data.image ? (
        <div className="relative">
          <img
            src={data.image}
            alt="Preview"
            className="w-full h-32 object-contain rounded-md border border-dark-border bg-dark-bg"
          />
          <button
            onClick={clearImage}
            className="absolute top-1 right-1 p-1 bg-error text-white rounded-full hover:opacity-80 transition-opacity duration-200"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-full py-8 border-2 border-dashed border-dark-border rounded-md hover:border-accent-yellow hover:bg-dark-hover transition-all duration-200 flex flex-col items-center justify-center gap-2"
        >
          <Upload className="w-6 h-6 text-text-secondary" />
          <span className="text-xs text-text-secondary">Click or paste image</span>
        </button>
      )}
    </div>
  );
}


import { Node, Edge } from "reactflow";

export type NodeType = "text" | "image" | "llm";

export interface TextNodeData {
  text: string;
}

export interface ImageNodeData {
  image: string; // base64
  filename?: string;
}

export interface LLMNodeData {
  systemPrompt?: string;
  userMessage?: string;
  images?: string[];
  output?: string;
  isLoading?: boolean;
  error?: string;
}

export type CustomNodeData = TextNodeData | ImageNodeData | LLMNodeData;

export interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
}

export interface LLMRequest {
  system_prompt?: string;
  user_message: string;
  images?: string[];
}


import { Node, Edge } from "reactflow";
import { WorkflowState } from "./types";

const STORAGE_KEY = "weavy-clone-workflow";

export function saveWorkflow(nodes: Node[], edges: Edge[]): void {
  try {
    const state: WorkflowState = { nodes, edges };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save workflow:", error);
  }
}

export function loadWorkflow(): WorkflowState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as WorkflowState;
  } catch (error) {
    console.error("Failed to load workflow:", error);
    return null;
  }
}

export function clearWorkflow(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear workflow:", error);
  }
}


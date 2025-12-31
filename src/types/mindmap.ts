export interface MindmapNodeData {
  id: string;
  label: string;
  description: string;
  summary: string;
  metadata: Record<string, string>;
  children: MindmapNodeData[];
}

export interface NodeState {
  expanded: boolean;
  selected: boolean;
}

export interface MindmapState {
  nodes: Record<string, NodeState>;
  selectedNodeId: string | null;
}

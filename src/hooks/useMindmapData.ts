import { useState, useCallback, useMemo, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { MindmapNodeData, MindmapState } from '@/types/mindmap';

const HORIZONTAL_SPACING = 280;
const VERTICAL_SPACING = 140;

interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

function initializeState(node: MindmapNodeData, nodes: Record<string, { expanded: boolean; selected: boolean }> = {}): Record<string, { expanded: boolean; selected: boolean }> {
  nodes[node.id] = { expanded: true, selected: false };
  node.children.forEach(child => initializeState(child, nodes));
  return nodes;
}

function getAllNodeIds(node: MindmapNodeData): string[] {
  const ids: string[] = [node.id];
  node.children.forEach(child => {
    ids.push(...getAllNodeIds(child));
  });
  return ids;
}

export function useMindmapData(initialData: MindmapNodeData) {
  const [data, setData] = useState<MindmapNodeData>(initialData);
  const [state, setState] = useState<MindmapState>(() => ({
    nodes: initializeState(initialData),
    selectedNodeId: null,
  }));

  // Sync data when initialData changes
  useEffect(() => {
    setData(initialData);
    // Merge new nodes into state while preserving existing expanded states
    setState(prev => {
      const newNodes = initializeState(initialData);
      const mergedNodes: Record<string, { expanded: boolean; selected: boolean }> = {};
      
      Object.keys(newNodes).forEach(id => {
        mergedNodes[id] = prev.nodes[id] || newNodes[id];
      });
      
      return {
        ...prev,
        nodes: mergedNodes,
      };
    });
  }, [initialData]);

  const toggleExpand = useCallback((nodeId: string) => {
    setState((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [nodeId]: {
          ...prev.nodes[nodeId],
          expanded: !prev.nodes[nodeId]?.expanded,
        },
      },
    }));
  }, []);

  const expandAll = useCallback(() => {
    setState((prev) => {
      const newNodes = { ...prev.nodes };
      Object.keys(newNodes).forEach(id => {
        newNodes[id] = { ...newNodes[id], expanded: true };
      });
      return { ...prev, nodes: newNodes };
    });
  }, []);

  const collapseAll = useCallback(() => {
    setState((prev) => {
      const newNodes = { ...prev.nodes };
      Object.keys(newNodes).forEach(id => {
        newNodes[id] = { ...newNodes[id], expanded: false };
      });
      // Keep root expanded
      const rootId = data.id;
      if (newNodes[rootId]) {
        newNodes[rootId] = { ...newNodes[rootId], expanded: true };
      }
      return { ...prev, nodes: newNodes };
    });
  }, [data.id]);

  const selectNode = useCallback((nodeId: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedNodeId: nodeId,
    }));
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<Pick<MindmapNodeData, 'label' | 'description'>>) => {
    const updateRecursive = (node: MindmapNodeData): MindmapNodeData => {
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      return {
        ...node,
        children: node.children.map(updateRecursive),
      };
    };
    
    setData((prev) => updateRecursive(prev));
  }, []);

  const addNode = useCallback((parentId: string) => {
    const newId = `node-${Date.now()}`;
    const newNode: MindmapNodeData = {
      id: newId,
      label: 'New Node',
      description: 'Click to edit this node',
      summary: 'New node',
      metadata: {},
      children: [],
    };

    const addToParent = (node: MindmapNodeData): MindmapNodeData => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newNode] };
      }
      return { ...node, children: node.children.map(addToParent) };
    };

    setData((prev) => addToParent(prev));
    setState((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [newId]: { expanded: true, selected: false },
        [parentId]: { ...prev.nodes[parentId], expanded: true },
      },
    }));

    return newId;
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    // Cannot delete root node
    if (nodeId === data.id) return false;

    const removeFromParent = (node: MindmapNodeData): MindmapNodeData => {
      return {
        ...node,
        children: node.children
          .filter((child) => child.id !== nodeId)
          .map(removeFromParent),
      };
    };

    setData((prev) => removeFromParent(prev));
    setState((prev) => {
      const { [nodeId]: _, ...remainingNodes } = prev.nodes;
      return {
        ...prev,
        nodes: remainingNodes,
        selectedNodeId: prev.selectedNodeId === nodeId ? null : prev.selectedNodeId,
      };
    });

    return true;
  }, [data.id]);

  const findNode = useCallback((nodeId: string): MindmapNodeData | null => {
    const search = (node: MindmapNodeData): MindmapNodeData | null => {
      if (node.id === nodeId) return node;
      for (const child of node.children) {
        const found = search(child);
        if (found) return found;
      }
      return null;
    };
    return search(data);
  }, [data]);

  const getLevel = useCallback((nodeId: string): number => {
    const findLevel = (node: MindmapNodeData, currentLevel: number): number => {
      if (node.id === nodeId) return currentLevel;
      for (const child of node.children) {
        const level = findLevel(child, currentLevel + 1);
        if (level !== -1) return level;
      }
      return -1;
    };
    return findLevel(data, 0);
  }, [data]);

  const getAllVisibleNodeIds = useCallback((): string[] => {
    const ids: string[] = [];
    const collectVisible = (node: MindmapNodeData) => {
      ids.push(node.id);
      if (state.nodes[node.id]?.expanded) {
        node.children.forEach(collectVisible);
      }
    };
    collectVisible(data);
    return ids;
  }, [data, state.nodes]);

  const layoutResult = useMemo((): LayoutResult => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const calculateSubtreeHeight = (node: MindmapNodeData): number => {
      const isExpanded = state.nodes[node.id]?.expanded ?? true;
      if (!isExpanded || node.children.length === 0) {
        return VERTICAL_SPACING;
      }
      return node.children.reduce((sum, child) => sum + calculateSubtreeHeight(child), 0);
    };

    const processNode = (
      node: MindmapNodeData,
      x: number,
      startY: number,
      parentId: string | null,
      level: number
    ): number => {
      const isExpanded = state.nodes[node.id]?.expanded ?? true;
      const subtreeHeight = calculateSubtreeHeight(node);
      const y = startY + subtreeHeight / 2 - VERTICAL_SPACING / 2;

      nodes.push({
        id: node.id,
        type: 'mindmapNode',
        position: { x, y },
        data: {
          ...node,
          level,
          expanded: isExpanded,
          hasChildren: node.children.length > 0,
          isSelected: state.selectedNodeId === node.id,
        },
      });

      if (parentId) {
        const isSelected = state.selectedNodeId === node.id;
        edges.push({
          id: `${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          type: 'smoothstep',
          animated: false,
          style: {
            stroke: isSelected ? '#14b8a6' : '#64748b',
            strokeWidth: isSelected ? 3 : 2,
          },
        });
      }

      if (isExpanded && node.children.length > 0) {
        let childStartY = startY;
        for (const child of node.children) {
          const childHeight = calculateSubtreeHeight(child);
          processNode(child, x + HORIZONTAL_SPACING, childStartY, node.id, level + 1);
          childStartY += childHeight;
        }
      }

      return subtreeHeight;
    };

    processNode(data, 0, 0, null, 0);
    
    return { nodes, edges };
  }, [data, state]);

  return {
    data,
    state,
    nodes: layoutResult.nodes,
    edges: layoutResult.edges,
    toggleExpand,
    expandAll,
    collapseAll,
    selectNode,
    updateNode,
    addNode,
    deleteNode,
    findNode,
    getLevel,
    getAllVisibleNodeIds,
  };
}

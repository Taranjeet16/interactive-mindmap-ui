import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
  NodeMouseHandler,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MindmapNode } from './MindmapNode';
import { MindmapControls } from './MindmapControls';
import { Toolbar } from './Toolbar';
import { useMindmapData } from '@/hooks/useMindmapData';
import { MindmapNodeData } from '@/types/mindmap';

const nodeTypes = {
  mindmapNode: MindmapNode,
};

interface MindmapCanvasProps {
  data: MindmapNodeData;
  onNodeSelect: (node: MindmapNodeData | null, level: number) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<Pick<MindmapNodeData, 'label' | 'description'>>) => void;
  onAddNode: (parentId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onKeyboardNav: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

function MindmapCanvasInner({ data, onNodeSelect, onNodeUpdate, onAddNode, onDeleteNode, onKeyboardNav }: MindmapCanvasProps) {
  const { fitView } = useReactFlow();
  const {
    nodes,
    edges,
    toggleExpand,
    selectNode,
    updateNode,
    findNode,
    getLevel,
    expandAll,
    collapseAll,
    getAllVisibleNodeIds,
    state,
  } = useMindmapData(data);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.15, duration: 500 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const visibleIds = getAllVisibleNodeIds();
      const currentIndex = state.selectedNodeId ? visibleIds.indexOf(state.selectedNodeId) : -1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < visibleIds.length - 1) {
            const nextId = visibleIds[currentIndex + 1];
            selectNode(nextId);
            const foundNode = findNode(nextId);
            const level = getLevel(nextId);
            onNodeSelect(foundNode, level);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            const prevId = visibleIds[currentIndex - 1];
            selectNode(prevId);
            const foundNode = findNode(prevId);
            const level = getLevel(prevId);
            onNodeSelect(foundNode, level);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (state.selectedNodeId) {
            const node = findNode(state.selectedNodeId);
            if (node && node.children.length > 0) {
              toggleExpand(state.selectedNodeId);
            }
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (state.selectedNodeId) {
            const node = findNode(state.selectedNodeId);
            if (node && node.children.length > 0) {
              toggleExpand(state.selectedNodeId);
            }
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (state.selectedNodeId) {
            toggleExpand(state.selectedNodeId);
          }
          break;
        case 'Escape':
          e.preventDefault();
          selectNode(null);
          onNodeSelect(null, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedNodeId, getAllVisibleNodeIds, selectNode, findNode, getLevel, onNodeSelect, toggleExpand]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const nodeId = node.id;
      const nodeData = node.data as unknown as { hasChildren: boolean };
      
      if (nodeData.hasChildren) {
        toggleExpand(nodeId);
      }
      
      selectNode(nodeId);
      const foundNode = findNode(nodeId);
      const level = getLevel(nodeId);
      onNodeSelect(foundNode, level);
    },
    [toggleExpand, selectNode, findNode, getLevel, onNodeSelect]
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
    onNodeSelect(null, 0);
  }, [selectNode, onNodeSelect]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-800">
      <Toolbar onExpandAll={expandAll} onCollapseAll={collapseAll} data={data} />
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.1}
          maxZoom={2}
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { strokeWidth: 2, stroke: '#64748b' },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Lines}
            gap={40}
            size={1}
            color="hsl(220, 20%, 20%)"
            style={{ backgroundColor: 'hsl(220, 20%, 15%)' }}
          />
          <MindmapControls />
        </ReactFlow>
      </div>
    </div>
  );
}

export function MindmapCanvas(props: MindmapCanvasProps) {
  return <MindmapCanvasInner {...props} />;
}

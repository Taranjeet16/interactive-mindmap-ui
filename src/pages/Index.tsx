import { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { MindmapCanvas } from '@/components/mindmap/MindmapCanvas';
import { DetailsPanel } from '@/components/mindmap/DetailsPanel';
import { MindmapNodeData } from '@/types/mindmap';
import mindmapData from '@/data/mindmapData.json';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Index = () => {
  const [data, setData] = useState<MindmapNodeData>(mindmapData as MindmapNodeData);
  const [selectedNode, setSelectedNode] = useState<MindmapNodeData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const handleNodeSelect = useCallback((node: MindmapNodeData | null, level: number) => {
    setSelectedNode(node);
    setSelectedLevel(level);
    if (node) {
      setIsPanelOpen(true);
    }
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<Pick<MindmapNodeData, 'label' | 'description'>>) => {
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
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedNode]);

  const handleAddNode = useCallback((parentId: string) => {
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
    toast.success('New child node added');
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    if (nodeId === data.id) {
      toast.error('Cannot delete root node');
      return;
    }

    const removeFromParent = (node: MindmapNodeData): MindmapNodeData => {
      return {
        ...node,
        children: node.children
          .filter((child) => child.id !== nodeId)
          .map(removeFromParent),
      };
    };

    setData((prev) => removeFromParent(prev));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    toast.success('Node deleted');
  }, [data.id, selectedNode]);

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleKeyboardNav = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    // Keyboard nav is handled in MindmapCanvas
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col sm:flex-row overflow-hidden bg-slate-900">
      {/* Canvas */}
      <main className="flex-1 relative min-h-0">
        <ReactFlowProvider>
          <MindmapCanvas
            data={data}
            onNodeSelect={handleNodeSelect}
            onNodeUpdate={handleNodeUpdate}
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onKeyboardNav={handleKeyboardNav}
          />
        </ReactFlowProvider>
        
        {/* Panel Toggle Button - Desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={cn(
            'hidden sm:flex absolute top-1/2 -translate-y-1/2 z-20 bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-l-lg rounded-r-none h-12 w-6',
            isPanelOpen ? 'right-80' : 'right-0'
          )}
        >
          {isPanelOpen ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </main>

      {/* Mobile Panel Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="sm:hidden fixed bottom-4 right-4 z-30 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg px-4"
      >
        {isPanelOpen ? 'Hide Details' : 'Show Details'}
      </Button>

      {/* Side Panel */}
      <aside
        className={cn(
          'shrink-0 bg-slate-800 overflow-hidden transition-all duration-300 ease-out border-l border-slate-700',
          'fixed sm:relative inset-0 sm:inset-auto z-20 sm:z-auto',
          isPanelOpen ? 'w-full sm:w-80 h-1/2 sm:h-full bottom-0 top-auto sm:top-0' : 'w-0 h-0 sm:h-full'
        )}
      >
        <div className="w-full sm:w-80 h-full">
          <DetailsPanel
            node={selectedNode}
            level={selectedLevel}
            isRoot={selectedNode?.id === data.id}
            onClose={handleClosePanel}
            onUpdate={handleNodeUpdate}
            onAddChild={handleAddNode}
            onDelete={handleDeleteNode}
          />
        </div>
      </aside>
    </div>
  );
};

export default Index;

import { useState, useEffect } from 'react';
import { Edit2, Save, Lightbulb, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MindmapNodeData } from '@/types/mindmap';
import { cn } from '@/lib/utils';

interface DetailsPanelProps {
  node: MindmapNodeData | null;
  level: number;
  isRoot: boolean;
  onClose: () => void;
  onUpdate: (nodeId: string, updates: Partial<Pick<MindmapNodeData, 'label' | 'description'>>) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (nodeId: string) => void;
}

export function DetailsPanel({ node, level, isRoot, onClose, onUpdate, onAddChild, onDelete }: DetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (node) {
      setEditLabel(node.label);
      setEditDescription(node.description);
      setIsEditing(false);
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      onUpdate(node.id, {
        label: editLabel,
        description: editDescription,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (node) {
      setEditLabel(node.label);
      setEditDescription(node.description);
    }
    setIsEditing(false);
  };

  const getLevelLabel = (lvl: number) => {
    if (lvl === 0) return 'Root';
    return `Level ${lvl}`;
  };

  if (!node) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Interactive Mindmap UI</h2>
              <p className="text-sm text-slate-400">Click a node to view details</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">No Node Selected</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-[200px]">
              Click on any node in the mindmap to view its details
            </p>
            <div className="mt-4 text-xs text-slate-500">
              <p>Keyboard shortcuts:</p>
              <p>Arrow keys: Navigate</p>
              <p>Enter: Expand/Collapse</p>
              <p>Escape: Deselect</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Interactive Mindmap UI</h2>
            <p className="text-sm text-slate-400">Node details</p>
          </div>
        </div>
      </div>

      {/* Level Badge */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <Badge variant="secondary" className="bg-slate-700 text-slate-300 hover:bg-slate-600">
          {getLevelLabel(level)}
        </Badge>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddChild(node.id)}
            className="text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 h-8 px-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Child
          </Button>
          {!isRoot && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(node.id)}
              className="text-red-400 hover:text-red-300 hover:bg-slate-700 h-8 px-2"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          {isEditing ? (
            <Input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white text-lg font-semibold"
            />
          ) : (
            <h3 className="text-xl font-bold text-teal-400">{node.label}</h3>
          )}
        </div>

        {/* Summary Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              SUMMARY
            </span>
            {!isEditing ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="text-amber-400 hover:text-amber-300 hover:bg-slate-700 h-auto py-1 px-2"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancel}
                  className="text-slate-400 hover:text-white hover:bg-slate-700 h-auto py-1 px-2"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  className="bg-teal-500 hover:bg-teal-600 text-white h-auto py-1 px-2"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="bg-slate-700 border-slate-600 text-slate-200 min-h-[120px]"
            />
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed">
              {node.description}
            </p>
          )}
        </div>

        <Separator className="bg-slate-700" />

        {/* Metadata */}
        {Object.keys(node.metadata).length > 0 && (
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              METADATA
            </span>
            <div className="space-y-2">
              {Object.entries(node.metadata).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 px-3 bg-slate-700/50 rounded-lg"
                >
                  <span className="text-xs font-medium text-slate-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono text-xs">
                    {value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Children count */}
        {node.children.length > 0 && (
          <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
            <p className="text-xs text-slate-400">
              This node has <span className="font-semibold text-teal-400">{node.children.length}</span> child node{node.children.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

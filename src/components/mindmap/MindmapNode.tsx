import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MindmapNodeDataProps {
  id: string;
  label: string;
  summary: string;
  level: number;
  expanded: boolean;
  hasChildren: boolean;
  isSelected: boolean;
}

// Level-based colors matching reference images
const levelStyles: Record<number, { bg: string; border: string; text: string }> = {
  0: { 
    bg: 'bg-sky-400', 
    border: 'border-sky-500', 
    text: 'text-slate-900' 
  },
  1: { 
    bg: 'bg-emerald-400', 
    border: 'border-emerald-500', 
    text: 'text-slate-900' 
  },
  2: { 
    bg: 'bg-amber-400', 
    border: 'border-amber-500', 
    text: 'text-slate-900' 
  },
  3: { 
    bg: 'bg-violet-400', 
    border: 'border-violet-500', 
    text: 'text-slate-900' 
  },
};

export const MindmapNode = memo(({ data }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeData = data as unknown as MindmapNodeDataProps;
  const { label, summary, level, expanded, hasChildren, isSelected } = nodeData;

  const styles = levelStyles[Math.min(level, 3)];

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />
      
      <div
        className={cn(
          'group relative flex items-center justify-center rounded-full cursor-pointer transition-all duration-200',
          'border-2 shadow-lg hover:shadow-xl',
          styles.bg,
          styles.border,
          // Size based on level - root is larger
          level === 0 ? 'min-w-[160px] min-h-[160px] px-6 py-6' : 
          level === 1 ? 'min-w-[120px] min-h-[120px] px-4 py-4' :
          'min-w-[100px] min-h-[100px] px-3 py-3',
          isSelected && 'ring-4 ring-white ring-offset-2 ring-offset-slate-800 shadow-2xl scale-105',
          isHovered && !isSelected && 'scale-102'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <h3 className={cn(
            'font-bold leading-tight',
            styles.text,
            level === 0 ? 'text-lg max-w-[140px]' : 
            level === 1 ? 'text-sm max-w-[100px]' : 
            'text-xs max-w-[80px]'
          )}>
            {label}
          </h3>
        </div>
        
        {/* Expand/Collapse indicator */}
        {hasChildren && (
          <div className={cn(
            'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center',
            'bg-slate-800 text-white border border-slate-600 shadow-md'
          )}>
            {expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </div>
        )}

        {/* Hover tooltip */}
        {isHovered && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-50 pointer-events-none animate-fade-in">
            <div className="bg-slate-800 text-white rounded-lg shadow-xl border border-slate-600 p-3 max-w-xs">
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-slate-300 mt-1">{summary}</p>
              <p className="text-xs text-teal-400 mt-2">Click to {hasChildren ? 'expand/collapse & ' : ''}view details</p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-800" />
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />
    </>
  );
});

MindmapNode.displayName = 'MindmapNode';

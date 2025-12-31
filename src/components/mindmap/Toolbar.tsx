import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { 
  FolderOpen, 
  FolderClosed, 
  Target, 
  Download,
  FileJson
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MindmapNodeData } from '@/types/mindmap';
import { toast } from 'sonner';

interface ToolbarProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  data: MindmapNodeData;
}

export function Toolbar({ onExpandAll, onCollapseAll, data }: ToolbarProps) {
  const { fitView, getNodes } = useReactFlow();

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 300 });
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Mindmap exported as JSON');
  };

  const handleExportPNG = () => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;

    const nodes = getNodes();
    if (nodes.length === 0) return;

    const bounds = getNodesBounds(nodes);
    const padding = 50;

    toPng(viewport, {
      backgroundColor: 'hsl(220, 20%, 15%)',
      width: bounds.width + padding * 2,
      height: bounds.height + padding * 2,
      style: {
        width: `${bounds.width + padding * 2}px`,
        height: `${bounds.height + padding * 2}px`,
        transform: `translate(${-bounds.x + padding}px, ${-bounds.y + padding}px)`,
      },
    })
      .then((dataUrl) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'mindmap.png';
        a.click();
        toast.success('Mindmap exported as PNG');
      })
      .catch((err) => {
        console.error('Export failed:', err);
        toast.error('Failed to export PNG');
      });
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 bg-slate-800 px-2 sm:px-4 py-2 border-b border-slate-600 w-full flex-wrap">
      <span className="text-white font-bold text-sm mr-2">Interactive Mindmap UI</span>
      <div className="w-px h-6 bg-slate-600" />
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExpandAll}
            className="text-amber-400 hover:text-amber-300 hover:bg-slate-700 gap-1"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Expand All</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Expand all nodes</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCollapseAll}
            className="text-amber-400 hover:text-amber-300 hover:bg-slate-700 gap-1"
          >
            <FolderClosed className="w-4 h-4" />
            <span className="hidden sm:inline">Collapse All</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Collapse all nodes</TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-slate-600" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleFitView}
            className="text-teal-400 hover:text-teal-300 hover:bg-slate-700 gap-1"
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Fit View</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Fit all nodes in view</TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-slate-600" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleExportJSON}
            className="text-sky-400 hover:text-sky-300 hover:bg-slate-700 gap-1"
          >
            <FileJson className="w-4 h-4" />
            <span className="hidden sm:inline">JSON</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export as JSON</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleExportPNG}
            className="text-violet-400 hover:text-violet-300 hover:bg-slate-700 gap-1"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PNG</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export as PNG</TooltipContent>
      </Tooltip>
    </div>
  );
}

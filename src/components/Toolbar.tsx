// components/Toolbar.tsx
import { Button } from '@/components/ui/button';
import { Pipette, MousePointer2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolbarProps {
  activeTool?: string;
  onToolSelect?: (tool: string) => void;
}

export function Toolbar({ activeTool = 'cursor', onToolSelect }: ToolbarProps) {
  return (
    <div className="w-16 bg-background border-r flex flex-col items-center py-4 gap-2">
      <TooltipProvider>
        {/* Курсор */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'cursor' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onToolSelect?.('cursor')}
            >
              <MousePointer2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Выделение / Курсор</p>
          </TooltipContent>
        </Tooltip>

        {/* Пипетка */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'pipette' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onToolSelect?.('pipette')}
            >
              <Pipette className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Пипетка</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

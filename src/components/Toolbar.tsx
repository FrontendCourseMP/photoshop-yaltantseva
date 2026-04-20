import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Pipette, MousePointer2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolbarProps {
  activeTool?: string;
  onToolSelect?: (tool: string) => void;
}

export function Toolbar({ activeTool = 'cursor', onToolSelect }: ToolbarProps) {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup className="px-2">
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              {/* Курсор */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === 'cursor' ? 'default' : 'ghost'}
                    size="icon"
                    className={activeTool === 'cursor' ? 'w-full ring-2 ring-blue-500' : 'w-full'}
                    aria-pressed={activeTool === 'cursor'}
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
                    className={activeTool === 'pipette' ? 'w-full ring-2 ring-blue-500' : 'w-full'}
                    aria-pressed={activeTool === 'pipette'}
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
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

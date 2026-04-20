import { Pipette } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PipetteButtonProps {
  isActive?: boolean
  onClick?: () => void
}

export function PipetteButton({ isActive = false, onClick }: PipetteButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? "default" : "ghost"}
            size="icon"
            onClick={onClick}
            className={isActive ? "bg-primary text-primary-foreground" : ""}
          >
            <Pipette className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Пипетка</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
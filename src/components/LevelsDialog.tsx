import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';

interface LevelsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: ImageData | null;
}

type Channel = 'master' | 'r' | 'g' | 'b' | 'a';

export function LevelsDialog({ isOpen, onClose, imageData }: LevelsDialogProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('master');
  const [isLogScale, setIsLogScale] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && imageData && canvasRef.current) {
      const histogram = computeHistogram(imageData, selectedChannel);
      drawHistogram(canvasRef.current, histogram, isLogScale);
    }
  }, [isOpen, imageData, selectedChannel, isLogScale]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Уровни</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Канал:</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="w-full justify-start bg-[hsl(220,10%,26%)] text-white hover:bg-white/10 rounded-none">
                {selectedChannel === 'master' && 'Master'}
                {selectedChannel === 'r' && 'Red'}
                {selectedChannel === 'g' && 'Green'}
                {selectedChannel === 'b' && 'Blue'}
                {selectedChannel === 'a' && 'Alpha'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="min-w-48 overflow-hidden rounded-none p-1.5 shadow-lg border border-white/20 bg-[hsl(220,10%,26%)] text-white"
            >
              <DropdownMenuItem 
                onClick={() => setSelectedChannel('master')}
                className="relative flex cursor-default items-center gap-2.5 rounded-none px-3 py-2 text-sm font-medium text-white outline-none select-none focus:bg-white/10 data-disabled:pointer-events-none data-disabled:opacity-50"
              >
                Master
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedChannel('r')}
                className="relative flex cursor-default items-center gap-2.5 rounded-none px-3 py-2 text-sm font-medium text-white outline-none select-none focus:bg-white/10 data-disabled:pointer-events-none data-disabled:opacity-50"
              >
                Red
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedChannel('g')}
                className="relative flex cursor-default items-center gap-2.5 rounded-none px-3 py-2 text-sm font-medium text-white outline-none select-none focus:bg-white/10 data-disabled:pointer-events-none data-disabled:opacity-50"
              >
                Green
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedChannel('b')}
                className="relative flex cursor-default items-center gap-2.5 rounded-none px-3 py-2 text-sm font-medium text-white outline-none select-none focus:bg-white/10 data-disabled:pointer-events-none data-disabled:opacity-50"
              >
                Blue
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedChannel('a')}
                className="relative flex cursor-default items-center gap-2.5 rounded-none px-3 py-2 text-sm font-medium text-white outline-none select-none focus:bg-white/10 data-disabled:pointer-events-none data-disabled:opacity-50"
              >
                Alpha
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="logScale"
              checked={isLogScale}
              onCheckedChange={(checked) => setIsLogScale(checked as boolean)}
              className="border-0 bg-[hsl(220,10%,26%)] data-[state=checked]:bg-[hsl(220,10%,26%)] rounded-none w-4 h-4 [&_svg]:text-white"
            />
            <label htmlFor="logScale" className="text-sm font-medium cursor-pointer">
              Логарифмическая шкала
            </label>
          </div>
        </div>

        <div className="mb-4">
          <canvas ref={canvasRef} width={256} height={100} className="border w-full"></canvas>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function computeHistogram(imageData: ImageData, channel: Channel): number[] {
  const hist = new Array(256).fill(0);
  const data = imageData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    let value: number;
    if (channel === 'master') {
      value = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    } else if (channel === 'r') {
      value = r;
    } else if (channel === 'g') {
      value = g;
    } else if (channel === 'b') {
      value = b;
    } else { // 'a'
      value = a;
    }
    hist[value]++;
  }

  return hist;
}

function drawHistogram(canvas: HTMLCanvasElement, histogram: number[], isLog: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const maxValue = Math.max(...histogram);
  const scale = canvas.height / (isLog ? Math.log(maxValue + 1) : maxValue);

  ctx.fillStyle = 'black';
  for (let i = 0; i < 256; i++) {
    const height = isLog ? Math.log(histogram[i] + 1) * scale : histogram[i] * scale;
    ctx.fillRect(i, canvas.height - height, 1, height);
  }
}
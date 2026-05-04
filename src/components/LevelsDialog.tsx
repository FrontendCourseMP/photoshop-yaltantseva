import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
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
  onPreview: (imageData: ImageData | null) => void;
  onPreviewToggle: (enabled: boolean) => void;
  onApply: (imageData: ImageData) => void;
  onCancel: () => void;
  previewEnabled: boolean;
}

type Channel = 'master' | 'r' | 'g' | 'b' | 'a';

interface LevelValues {
  black: number;
  white: number;
  gamma: number;
}

const defaultLevels: Record<Channel, LevelValues> = {
  master: { black: 0, white: 255, gamma: 1 },
  r: { black: 0, white: 255, gamma: 1 },
  g: { black: 0, white: 255, gamma: 1 },
  b: { black: 0, white: 255, gamma: 1 },
  a: { black: 0, white: 255, gamma: 1 },
};

export function LevelsDialog({
  isOpen,
  onClose,
  imageData,
  onPreview,
  onPreviewToggle,
  onApply,
  onCancel,
  previewEnabled,
}: LevelsDialogProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('master');
  const [levels, setLevels] = useState(defaultLevels);
  const [isLogScale, setIsLogScale] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentLevels = levels[selectedChannel];

  useEffect(() => {
    if (!isOpen) return;
    setSelectedChannel('master');
    setLevels(defaultLevels);
    setIsLogScale(false);
    if (imageData) {
      onPreview(imageData);
      onPreviewToggle(true);
    }
  }, [isOpen, imageData, onPreview, onPreviewToggle]);

  useEffect(() => {
    if (!isOpen || !imageData || !canvasRef.current) return;
    const histogram = computeHistogram(imageData, selectedChannel);
    drawHistogram(canvasRef.current, histogram, isLogScale);
  }, [isOpen, imageData, selectedChannel, isLogScale]);

  useEffect(() => {
    if (!isOpen || !imageData) return;
    if (previewEnabled) {
      onPreview(applyLevels(imageData, levels));
    } else {
      onPreview(imageData);
    }
  }, [imageData, levels, previewEnabled, isOpen, onPreview]);

  const updateLevel = (key: keyof LevelValues, value: number) => {
    setLevels((prev) => {
      if (selectedChannel === 'master') {
        const updated = { black: 0, white: 255, gamma: 1, ...prev.master, [key]: value };
        return {
          ...prev,
          master: updated,
          r: updated,
          g: updated,
          b: updated,
        };
      }

      return {
        ...prev,
        [selectedChannel]: {
          ...prev[selectedChannel],
          [key]: value,
        },
      };
    });
  };

  const handlePreviewToggle = (checked: boolean) => {
    onPreviewToggle(checked);
    if (imageData) {
      onPreview(checked ? applyLevels(imageData, levels) : imageData);
    }
  };

  const handleReset = () => {
    setLevels(defaultLevels);
    setIsLogScale(false);
    if (imageData) {
      onPreview(imageData);
      onPreviewToggle(true);
    }
  };

  const handleApply = () => {
    if (!imageData) return;
    const result = applyLevels(imageData, levels);
    onApply(result);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent draggable disableOutsideClose className="sm:max-w-md bg-[hsl(220,10%,26%)] border-0 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Уровни</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-white">Канал:</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="w-full justify-start bg-[hsl(220,10%,26%)] text-white hover:bg-white/10 rounded-none border border-white/20"
              >
                {selectedChannel === 'master' && 'Master'}
                {selectedChannel === 'r' && 'Red'}
                {selectedChannel === 'g' && 'Green'}
                {selectedChannel === 'b' && 'Blue'}
                {selectedChannel === 'a' && 'Alpha'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-48 overflow-hidden rounded-none p-1.5 shadow-lg border border-white/20 bg-[hsl(220,10%,26%)] text-white">
              <DropdownMenuItem
                onClick={() => setSelectedChannel('master')}
                className="relative flex cursor-default items-center gap-2.5 rounded-none px-3 py-2 text-sm font-medium text-white outline-none select-none focus:bg-white/10"
              >
                Master
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedChannel('r')}
                className="relative flex cursor-default items-center gap-2.5 rounded-none px-3 py-2 text-sm font-medium text-white outline-none select-none focus:bg-white/10"
              >
                Red
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedChannel('g')}
                className="relative flex cursor-default items-center gap-2.5 rounded-none px-3 py-2 text-sm font-medium text-white outline-none select-none focus:bg-white/10"
              >
                Green
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedChannel('b')}
                className="relative flex cursor-default items-center gap-2.5 rounded-none px-3 py-2 text-sm font-medium text-white outline-none select-none focus:bg-white/10"
              >
                Blue
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedChannel('a')}
                className="relative flex cursor-default items-center gap-2.5 rounded-none px-3 py-2 text-sm font-medium text-white outline-none select-none focus:bg-white/10"
              >
                Alpha
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="preview"
              checked={previewEnabled}
              onCheckedChange={(checked) => handlePreviewToggle(checked as boolean)}
              className="w-4 h-4 border border-white/30 bg-[hsl(220,10%,32%)]"
            />
            <label htmlFor="preview" className="text-sm font-medium cursor-pointer text-white">
              Предпросмотр
            </label>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id="logScale"
              checked={isLogScale}
              onCheckedChange={(checked) => setIsLogScale(checked as boolean)}
              className="w-4 h-4 border border-white/30 bg-[hsl(220,10%,32%)]"
            />
            <label htmlFor="logScale" className="text-sm font-medium cursor-pointer text-white">
              Логарифмическая шкала
            </label>
          </div>
          <canvas
            ref={canvasRef}
            width={256}
            height={100}
            className="border border-white/20 w-full bg-black"
          ></canvas>
        </div>

        <div className="space-y-4 mb-4">
          <div>
            <div className="flex justify-between text-sm font-medium text-white mb-1">
              <span>Черная точка</span>
              <span>{currentLevels.black}</span>
            </div>
            <input
              type="range"
              min={0}
              max={currentLevels.white - 1}
              value={currentLevels.black}
              onChange={(e) => updateLevel('black', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium text-white mb-1">
              <span>Белая точка</span>
              <span>{currentLevels.white}</span>
            </div>
            <input
              type="range"
              min={currentLevels.black + 1}
              max={255}
              value={currentLevels.white}
              onChange={(e) => updateLevel('white', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium text-white mb-1">
              <span>Гамма</span>
              <span>{currentLevels.gamma.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={9.9}
              step={0.1}
              value={currentLevels.gamma}
              onChange={(e) => updateLevel('gamma', Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex flex-wrap gap-2 justify-end w-full">
            <Button
              onClick={handleReset}
              className="border border-white/30 text-white bg-transparent hover:bg-white/10"
            >
              Сброс
            </Button>
            <Button
              onClick={onCancel}
              className="border border-white/30 text-white bg-transparent hover:bg-white/10"
            >
              Отмена
            </Button>
            <Button onClick={handleApply} className="bg-blue-600 text-white hover:bg-blue-700">
              Применить
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function makeLUT(black: number, gamma: number, white: number) {
  const lut = new Uint8ClampedArray(256);
  const minValue = Math.max(0, Math.min(255, black));
  const maxValue = Math.max(0, Math.min(255, white));
  const range = Math.max(1, maxValue - minValue);

  for (let i = 0; i < 256; i++) {
    if (i <= minValue) {
      lut[i] = 0;
    } else if (i >= maxValue) {
      lut[i] = 255;
    } else {
      const normalized = (i - minValue) / range;
      const corrected = Math.pow(normalized, 1 / gamma);
      lut[i] = Math.round(Math.max(0, Math.min(255, corrected * 255)));
    }
  }

  return lut;
}

function applyLevels(imageData: ImageData, levels: Record<Channel, LevelValues>) {
  const lutR = makeLUT(levels.r.black, levels.r.gamma, levels.r.white);
  const lutG = makeLUT(levels.g.black, levels.g.gamma, levels.g.white);
  const lutB = makeLUT(levels.b.black, levels.b.gamma, levels.b.white);
  const lutA = makeLUT(levels.a.black, levels.a.gamma, levels.a.white);

  const output = new ImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = output.data;

  for (let i = 0; i < src.length; i += 4) {
    dst[i] = lutR[src[i]];
    dst[i + 1] = lutG[src[i + 1]];
    dst[i + 2] = lutB[src[i + 2]];
    dst[i + 3] = lutA[src[i + 3]];
  }

  return output;
}

function computeHistogram(imageData: ImageData, channel: Channel): number[] {
  const hist = new Array(256).fill(0);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
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
    } else {
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

  ctx.fillStyle = '#888888';
  for (let i = 0; i < 256; i++) {
    const height = isLog ? Math.log(histogram[i] + 1) * scale : histogram[i] * scale;
    ctx.fillRect(i, canvas.height - height, 1, height);
  }
}

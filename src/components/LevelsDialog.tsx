import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { useLevels } from '../hooks/useLevels';
import type { Channel, LevelValues } from '../lib/levels';

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
  const {
    selectedChannel,
    setSelectedChannel,
    currentLevels,
    isLogScale,
    setIsLogScale,
    canvasRef,
    updateLevel,
    handlePreviewToggle,
    handleReset,
    handleApply,
  } = useLevels(isOpen, imageData, onPreview, onPreviewToggle, onApply, previewEnabled);

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

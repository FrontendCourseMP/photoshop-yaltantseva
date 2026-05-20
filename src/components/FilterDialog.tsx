import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { useFilter } from '@/hooks/useFilter';
import { filterPresets } from '@/lib/filter';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: ImageData | null;
  format: string | null;
  onPreview: (imageData: ImageData | null) => void;
  onPreviewToggle: (enabled: boolean) => void;
  onApply: (imageData: ImageData) => void;
  onCancel: () => void;
  previewEnabled: boolean;
}

export function FilterDialog({
  isOpen,
  onClose,
  imageData,
  format,
  onPreview,
  onPreviewToggle,
  onApply,
  onCancel,
  previewEnabled,
}: FilterDialogProps) {
  const {
    presetId,
    kernelValues,
    divisor,
    edgeHandling,
    selectedChannels,
    availableChannels,
    isProcessing,
    handlePresetChange,
    handleKernelChange,
    handleEdgeHandlingChange,
    handleChannelToggle,
    handleReset,
    handlePreviewToggle,
    handleApply,
  } = useFilter(isOpen, imageData, format, onPreview, onPreviewToggle, onApply, previewEnabled);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        draggable
        disableOutsideClose
        overlayClassName="bg-transparent"
        className="sm:max-w-2xl bg-[hsl(220,10%,26%)] border-0 text-white"
      >
        <DialogHeader>
          <DialogTitle className="text-white">Пользовательский фильтр</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2 rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
            <label className="text-sm font-medium text-white">Предустановка</label>
            <select
              className="h-9 w-full rounded-none border border-white/20 bg-[hsl(220,10%,32%)] px-3 text-sm text-white outline-none focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/30"
              value={presetId}
              onChange={(event) => handlePresetChange(event.target.value)}
            >
              {filterPresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
              <option value="custom">Пользовательский</option>
            </select>
          </div>

          <div className="grid gap-2 rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
            <div className="grid grid-cols-3 gap-2">
              {kernelValues.map((value, index) => (
                <label key={index} className="grid gap-1 text-xs text-white">
                  <span className="sr-only">Ядро {index + 1}</span>
                  <Input
                    type="number"
                    value={value}
                    onChange={(event) => handleKernelChange(index, Number(event.target.value))}
                    className="h-10 rounded-none text-center"
                  />
                </label>
              ))}
            </div>
            <div className="text-xs text-white/60">
              Введите значения ядра 3×3. Выбор предустановки заполняет поля автоматически.
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2 rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
              <label className="text-sm font-medium text-white">Заполнение краёв</label>
              <select
                className="h-9 w-full rounded-none border border-white/20 bg-[hsl(220,10%,32%)] px-3 text-sm text-white outline-none focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/30"
                value={edgeHandling}
                onChange={(event) =>
                  handleEdgeHandlingChange(event.target.value as 'black' | 'white' | 'copy')
                }
              >
                <option value="black">Заполнение чёрным</option>
                <option value="white">Заполнение белым</option>
                <option value="copy">Копирование края</option>
              </select>
            </div>

            <div className="grid gap-2 rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
              <label className="text-sm font-medium text-white">Делитель</label>
              <div className="h-9 rounded-none border border-white/20 bg-[hsl(220,10%,32%)] px-3 py-2 text-sm text-white">
                {divisor}
              </div>
              <div className="text-xs text-white/60">
                Делитель вычисляется автоматически для предустановок.
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
            <span className="text-sm font-medium text-white">Применять к каналам</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableChannels.map((channel) => (
                <label
                  key={channel}
                  className="flex items-center gap-2 rounded-none border border-white/20 bg-[hsl(220,10%,32%)] p-2 text-sm text-white"
                >
                  <Checkbox
                    id={`filter-channel-${channel}`}
                    checked={selectedChannels[channel]}
                    onCheckedChange={() => handleChannelToggle(channel)}
                    className="w-4 h-4 border border-white/30 bg-[hsl(220,10%,32%)]"
                  />
                  <span className="capitalize">
                    {channel === 'r' && 'R'}
                    {channel === 'g' && 'G'}
                    {channel === 'b' && 'B'}
                    {channel === 'a' && 'A'}
                    {channel === 'gray' && 'Gray'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="filter-preview"
                checked={previewEnabled}
                onCheckedChange={(checked) => handlePreviewToggle(checked as boolean)}
                className="w-4 h-4 border border-white/30 bg-[hsl(220,10%,32%)]"
              />
              <label
                htmlFor="filter-preview"
                className="text-sm font-medium cursor-pointer text-white"
              >
                Предпросмотр
              </label>
            </div>
            {isProcessing && <span className="text-sm text-white/70">Обработка...</span>}
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
            <Button
              onClick={handleApply}
              disabled={isProcessing}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Применить
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

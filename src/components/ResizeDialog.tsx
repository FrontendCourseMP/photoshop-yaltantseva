import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Info } from 'lucide-react';
import { resizeImageData } from '@/lib/interpolation';

type ResizeUnit = 'percent' | 'pixels';

type InterpolationMethod = 'nearest' | 'bilinear';

interface ResizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: ImageData | null;
  onApply: (data: ImageData) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function ResizeDialog({ isOpen, onClose, imageData, onApply }: ResizeDialogProps) {
  const originalWidth = imageData?.width ?? 0;
  const originalHeight = imageData?.height ?? 0;
  const originalMegapixels = useMemo(
    () => ((originalWidth * originalHeight) / 1_000_000).toFixed(2),
    [originalWidth, originalHeight],
  );
  const [unit, setUnit] = useState<ResizeUnit>('percent');
  const [percent, setPercent] = useState(100);
  const [pixelWidth, setPixelWidth] = useState(originalWidth);
  const [pixelHeight, setPixelHeight] = useState(originalHeight);
  const [keepAspect, setKeepAspect] = useState(true);
  const [interpolation, setInterpolation] = useState<InterpolationMethod>('bilinear');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageData) return;

    setUnit('percent');
    setPercent(100);
    setPixelWidth(originalWidth);
    setPixelHeight(originalHeight);
    setKeepAspect(true);
    setValidationError(null);
  }, [imageData, isOpen, originalWidth, originalHeight]);

  const targetDimensions = useMemo(() => {
    if (!imageData) {
      return { width: 0, height: 0 };
    }

    if (unit === 'percent') {
      const width = Math.max(1, Math.round((originalWidth * percent) / 100));
      const height = Math.max(1, Math.round((originalHeight * percent) / 100));
      return { width, height };
    }

    return {
      width: Math.max(1, pixelWidth),
      height: Math.max(1, pixelHeight),
    };
  }, [imageData, unit, percent, originalWidth, originalHeight, pixelWidth, pixelHeight]);

  const megapixels = useMemo(() => {
    return ((targetDimensions.width * targetDimensions.height) / 1_000_000).toFixed(2);
  }, [targetDimensions.height, targetDimensions.width]);

  const handlePercentChange = (value: number) => {
    setPercent(clamp(value, 12, 300));
    setValidationError(null);
  };

  const handlePixelWidthChange = (value: number) => {
    const width = Math.max(1, value);
    setPixelWidth(width);

    if (keepAspect && originalWidth > 0) {
      setPixelHeight(Math.max(1, Math.round((width * originalHeight) / originalWidth)));
    }

    setValidationError(null);
  };

  const handlePixelHeightChange = (value: number) => {
    const height = Math.max(1, value);
    setPixelHeight(height);

    if (keepAspect && originalHeight > 0) {
      setPixelWidth(Math.max(1, Math.round((height * originalWidth) / originalHeight)));
    }

    setValidationError(null);
  };

  const validateDimensions = () => {
    if (!imageData) return 'Нет исходного изображения.';
    if (unit === 'percent' && (percent < 12 || percent > 300)) {
      return 'Процент масштабирования должен быть в диапазоне 12–300%.';
    }

    if (unit === 'pixels') {
      if (pixelWidth < 1 || pixelHeight < 1) {
        return 'Ширина и высота должны быть больше нуля.';
      }
      if (pixelWidth > 10000 || pixelHeight > 10000) {
        return 'Ширина и высота не должны превышать 10000 px.';
      }
    }

    if (targetDimensions.width < 1 || targetDimensions.height < 1) {
      return 'Итоговые размеры должны быть больше нуля.';
    }

    return null;
  };

  const handleApply = () => {
    const error = validateDimensions();
    if (error) {
      setValidationError(error);
      return;
    }
    if (!imageData) return;

    if (unit === 'percent' && (percent < 12 || percent > 300)) {
      setValidationError('Процент масштабирования должен быть в диапазоне 12–300%.');
      return;
    }

    if (targetDimensions.width < 1 || targetDimensions.height < 1) {
      setValidationError('Ширина и высота должны быть больше нуля.');
      return;
    }

    const resized = resizeImageData(
      imageData,
      targetDimensions.width,
      targetDimensions.height,
      interpolation,
    );
    onApply(resized);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        overlayClassName="bg-transparent"
        className="sm:max-w-md bg-[hsl(220,10%,26%)] border-0 text-white"
      >
        <DialogHeader>
          <DialogTitle className="text-white">Изменить размер изображения</DialogTitle>
          <DialogDescription className="text-white/60">
            Укажите размеры в процентах или пикселях, выберите интерполяцию и примените изменения.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2 rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
            <label className="text-sm font-medium text-white">Единицы</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`rounded-none border px-3 py-2 text-sm transition text-white ${unit === 'percent' ? 'border-white/30 bg-white/10' : 'border-white/20 bg-transparent hover:bg-white/10'}`}
                onClick={() => setUnit('percent')}
              >
                Проценты
              </button>
              <button
                type="button"
                className={`rounded-none border px-3 py-2 text-sm transition text-white ${unit === 'pixels' ? 'border-white/30 bg-white/10' : 'border-white/20 bg-transparent hover:bg-white/10'}`}
                onClick={() => setUnit('pixels')}
              >
                Пиксели
              </button>
            </div>
          </div>

          {unit === 'percent' ? (
            <div className="grid gap-2 rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
              <label className="text-sm font-medium text-white">Масштаб</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={12}
                  max={300}
                  value={percent}
                  onChange={(event) => handlePercentChange(Number(event.target.value))}
                />
                <span className="text-sm text-white/60">%</span>
              </div>
              <p className="text-xs text-white/60">Диапазон 12–300%.</p>
            </div>
          ) : (
            <div className="grid gap-4 rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-white">Ширина</label>
                  <span className="text-xs text-white/60">px</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  value={pixelWidth}
                  onChange={(event) => handlePixelWidthChange(Number(event.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-white">Высота</label>
                  <span className="text-xs text-white/60">px</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  value={pixelHeight}
                  onChange={(event) => handlePixelHeightChange(Number(event.target.value))}
                />
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={keepAspect}
                  onChange={(event) => setKeepAspect(event.target.checked)}
                  className="h-4 w-4 rounded border border-white/30 bg-[hsl(220,10%,32%)]"
                />
                Сохранить пропорции
              </label>
            </div>
          )}

          <TooltipProvider>
            <div className="grid gap-2 rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-white">Интерполяция</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-full border border-white/20 bg-transparent p-1 text-white/60 hover:bg-white/10"
                    >
                      <Info className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6} className="max-w-sm">
                    {interpolation === 'bilinear' ? (
                      <span>
                        Билинейная интерполяция даёт сглаженные результаты и подходит для
                        большинства фотографий.
                      </span>
                    ) : (
                      <span>
                        Ближайший сосед сохраняет резкие края, но может выглядеть пикселизированно.
                      </span>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
              <select
                className="h-9 w-full rounded-none border border-white/20 bg-[hsl(220,10%,32%)] px-3 text-sm text-white outline-none focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/30"
                value={interpolation}
                onChange={(event) => setInterpolation(event.target.value as InterpolationMethod)}
              >
                <option value="nearest">Ближайший сосед</option>
                <option value="bilinear">Билинейная</option>
              </select>
            </div>
          </TooltipProvider>

          <div className="grid gap-2 rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
            <div className="flex items-center justify-between gap-2 text-sm text-white/60">
              <span>Исходное разрешение</span>
              <span>
                {originalWidth} × {originalHeight} px
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm text-white/60">
              <span>Исходные мегапиксели</span>
              <span>{originalMegapixels} MP</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm text-white/60">
              <span>Итоговое разрешение</span>
              <span>
                {targetDimensions.width} × {targetDimensions.height} px
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm text-white/60">
              <span>Итоговые мегапиксели</span>
              <span>{megapixels} MP</span>
            </div>
          </div>

          {validationError && <p className="text-sm text-red-400">{validationError}</p>}
        </div>

        <DialogFooter>
          <div className="flex flex-wrap gap-2 justify-end w-full">
            <Button
              type="button"
              onClick={onClose}
              className="border border-white/30 text-white bg-transparent hover:bg-white/10"
            >
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleApply}
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

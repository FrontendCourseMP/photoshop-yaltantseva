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
  const [widthValue, setWidthValue] = useState(100);
  const [heightValue, setHeightValue] = useState(100);
  const [keepAspect, setKeepAspect] = useState(true);
  const [interpolation, setInterpolation] = useState<InterpolationMethod>('bilinear');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageData) return;

    setUnit('percent');
    setWidthValue(100);
    setHeightValue(100);
    setKeepAspect(true);
    setValidationError(null);
  }, [imageData, isOpen, originalWidth, originalHeight]);

  const targetDimensions = useMemo(() => {
    if (!imageData) {
      return { width: 0, height: 0 };
    }

    if (unit === 'percent') {
      return {
        width: Math.max(1, Math.round((originalWidth * widthValue) / 100)),
        height: Math.max(1, Math.round((originalHeight * heightValue) / 100)),
      };
    }

    return {
      width: Math.max(1, widthValue),
      height: Math.max(1, heightValue),
    };
  }, [imageData, unit, widthValue, heightValue, originalWidth, originalHeight]);

  const megapixels = useMemo(
    () => ((targetDimensions.width * targetDimensions.height) / 1_000_000).toFixed(2),
    [targetDimensions.width, targetDimensions.height],
  );

  const handleUnitChange = (newUnit: ResizeUnit) => {
    if (newUnit === unit) return;

    if (newUnit === 'pixels') {
      setWidthValue(Math.max(1, Math.round((originalWidth * widthValue) / 100)));
      setHeightValue(Math.max(1, Math.round((originalHeight * heightValue) / 100)));
    } else {
      if (originalWidth > 0 && originalHeight > 0) {
        setWidthValue(Math.max(1, Math.round((widthValue / originalWidth) * 100)));
        setHeightValue(Math.max(1, Math.round((heightValue / originalHeight) * 100)));
      }
    }

    setUnit(newUnit);
    setValidationError(null);
  };

  const handleWidthChange = (value: number) => {
    const clamped = unit === 'percent' ? clamp(value, 1, 1000) : Math.max(1, value);

    setWidthValue(clamped);
    if (keepAspect) {
      if (unit === 'percent') {
        setHeightValue(clamp(clamped, 1, 1000));
      } else {
        setHeightValue(Math.max(1, Math.round((clamped * originalHeight) / originalWidth)));
      }
    }

    setValidationError(null);
  };

  const handleHeightChange = (value: number) => {
    const clamped = unit === 'percent' ? clamp(value, 1, 1000) : Math.max(1, value);

    setHeightValue(clamped);
    if (keepAspect) {
      if (unit === 'percent') {
        setWidthValue(clamp(clamped, 1, 1000));
      } else {
        setWidthValue(Math.max(1, Math.round((clamped * originalWidth) / originalHeight)));
      }
    }

    setValidationError(null);
  };

  const validateDimensions = () => {
    if (!imageData) return 'Нет исходного изображения.';

    if (unit === 'pixels') {
      if (widthValue < 1 || heightValue < 1) {
        return 'Ширина и высота должны быть больше нуля.';
      }
      if (widthValue > 10000 || heightValue > 10000) {
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
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2 rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
            <label className="text-sm font-medium text-white">Единицы измерения</label>
            <select
              className="h-9 w-full rounded-none border border-white/20 bg-[hsl(220,10%,32%)] px-3 text-sm text-white outline-none focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/30"
              value={unit}
              onChange={(event) => handleUnitChange(event.target.value as ResizeUnit)}
            >
              <option value="percent">Проценты</option>
              <option value="pixels">Пиксели</option>
            </select>
          </div>

          <div className="grid gap-4 rounded-none border border-white/20 bg-[hsl(220,10%,26%)] p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-white">Ширина</label>
                  <span className="text-xs text-white/60">{unit === 'percent' ? '%' : 'px'}</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  value={widthValue}
                  onChange={(event) => handleWidthChange(Number(event.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-white">Высота</label>
                  <span className="text-xs text-white/60">{unit === 'percent' ? '%' : 'px'}</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  value={heightValue}
                  onChange={(event) => handleHeightChange(Number(event.target.value))}
                />
              </div>
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

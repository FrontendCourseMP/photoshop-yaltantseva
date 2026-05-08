import { useState, useEffect, useRef } from 'react';
import { applyLevels, computeHistogram, drawHistogram } from '../lib/levels';
import type { Channel, LevelValues } from '../lib/levels';
import { defaultLevels } from '../lib/levels';

export function useLevels(
  isOpen: boolean,
  imageData: ImageData | null,
  onPreview: (imageData: ImageData | null) => void,
  onPreviewToggle: (enabled: boolean) => void,
  onApply: (imageData: ImageData) => void,
  previewEnabled: boolean
) {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('master');
  const [levels, setLevels] = useState(defaultLevels);
  const [isLogScale, setIsLogScale] = useState(false);
  const [hasAlpha, setHasAlpha] = useState(false);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentLevels = levels[selectedChannel];

  useEffect(() => {
    if (!isOpen) return;
    setLevels(defaultLevels);
    setIsLogScale(false);
    if (imageData) {
      const data = imageData.data;
      // Проверяем наличие альфа-канала (есть ли пиксели с alpha < 255)
      let alphaPresent = false;
      // Проверяем, является ли изображение градационным (R == G == B для всех пикселей)
      let grayscale = true;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== data[i + 1] || data[i] !== data[i + 2]) {
          grayscale = false;
          // Если уже нашли цветной пиксель и есть альфа, можно выйти
        }
        if (!alphaPresent && data[i + 3] < 255) {
          alphaPresent = true;
        }
        if (!grayscale && alphaPresent) break; // Оптимизация - выходим, если уже всё понятно
      }
      setHasAlpha(alphaPresent);
      setIsGrayscale(grayscale);
      setSelectedChannel('master');
      onPreview(imageData);
      onPreviewToggle(true);
    }
  }, [isOpen, imageData, onPreview, onPreviewToggle]);

  useEffect(() => {
    if (!isOpen || !imageData) return;

    const raf = requestAnimationFrame(() => {
      if (!canvasRef.current) return;
      const histogram = computeHistogram(imageData, selectedChannel);
      drawHistogram(canvasRef.current, histogram, isLogScale);
    });

    return () => cancelAnimationFrame(raf);
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

  return {
    selectedChannel,
    setSelectedChannel,
    levels,
    currentLevels,
    isLogScale,
    setIsLogScale,
    hasAlpha,
    isGrayscale,
    canvasRef,
    updateLevel,
    handlePreviewToggle,
    handleReset,
    handleApply,
  };
}

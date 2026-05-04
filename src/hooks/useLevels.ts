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

  return {
    selectedChannel,
    setSelectedChannel,
    levels,
    currentLevels,
    isLogScale,
    setIsLogScale,
    canvasRef,
    updateLevel,
    handlePreviewToggle,
    handleReset,
    handleApply,
  };
}

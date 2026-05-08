import { useRef, useEffect } from 'react';
import { getAvailableChannels } from '@/lib/imageUtils';

interface ChannelsPanelProps {
  imageData: ImageData | null;
  format: string | null;
  selectedChannels: { r: boolean; g: boolean; b: boolean; a: boolean; gray: boolean };
  setSelectedChannels: (channels: {
    r: boolean;
    g: boolean;
    b: boolean;
    a: boolean;
    gray: boolean;
  }) => void;
}

function ChannelItem({
  label,
  channel,
  imageData,
  format,
  isSelected,
  onToggle,
}: {
  label: string;
  channel: 'r' | 'g' | 'b' | 'a' | 'gray';
  imageData: ImageData | null;
  format: string | null;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imageData) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxSize = 64;
    const scale = Math.min(maxSize / imageData.width, maxSize / imageData.height);
    const width = Math.floor(imageData.width * scale);
    const height = Math.floor(imageData.height * scale);

    canvas.width = width;
    canvas.height = height;

    // Создаем ImageData для миниатюры
    const preview = new ImageData(width, height);
    const pData = preview.data;
    const origData = imageData.data;
    const origW = imageData.width;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcX = Math.floor(x / scale);
        const srcY = Math.floor(y / scale);
        const srcIdx = (srcY * origW + srcX) * 4;
        const dstIdx = (y * width + x) * 4;

        if (channel === 'a') {
          // Альфа-канал: градации серого (белый = непрозрачный, чёрный = прозрачный)
          const alpha = origData[srcIdx + 3];
          pData[dstIdx] = alpha;     // R
          pData[dstIdx + 1] = alpha; // G
          pData[dstIdx + 2] = alpha; // B
          pData[dstIdx + 3] = 255;   // Непрозрачный
        } else {
          // RGB каналы
          let value = 0;
          if (channel === 'r') value = origData[srcIdx];
          else if (channel === 'g') value = origData[srcIdx + 1];
          else if (channel === 'b') value = origData[srcIdx + 2];

          if (channel === 'r') {
            pData[dstIdx] = value; pData[dstIdx + 1] = 0; pData[dstIdx + 2] = 0;
          } else if (channel === 'g') {
            pData[dstIdx] = 0; pData[dstIdx + 1] = value; pData[dstIdx + 2] = 0;
          } else if (channel === 'b') {
            pData[dstIdx] = 0; pData[dstIdx + 1] = 0; pData[dstIdx + 2] = value;
          }
          pData[dstIdx + 3] = 255;
        }
      }
    }

    ctx.putImageData(preview, 0, 0);
  }, [imageData, channel]);

  // Определяем цвет рамки в зависимости от канала
  const getBorderColor = () => {
    if (!isSelected) return 'border-gray-600';
    switch (channel) {
      case 'r':
        return 'border-red-500';
      case 'g':
        return 'border-green-500';
      case 'b':
        return 'border-blue-500';
      case 'a':
        return 'border-purple-500';
      default:
        return 'border-blue-400';
    }
  };

  // Определяем цвет текста
  const getTextColor = () => {
    if (!isSelected) return 'text-white/60';
    switch (channel) {
      case 'r':
        return 'text-red-400';
      case 'g':
        return 'text-green-400';
      case 'b':
        return 'text-blue-400';
      case 'a':
        return 'text-purple-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div
      className={`p-2 border-2 rounded cursor-pointer transition-all ${getBorderColor()} bg-[hsl(220,10%,15%)] hover:bg-[hsl(220,10%,25%)]`}
      onClick={onToggle}
    >
      <div className={`text-xs font-medium mb-1 ${getTextColor()}`}>{label}</div>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="rounded"
        />
      </div>
      <div className="text-xs text-center mt-1 text-white/40">
        {isSelected ? '✓ Включен' : '✗ Выключен'}
      </div>
    </div>
  );
}

export function ChannelsPanel({
  imageData,
  format,
  selectedChannels,
  setSelectedChannels,
}: ChannelsPanelProps) {
  if (!imageData) return null;

  const availableChannels = getAvailableChannels(imageData, format);

  const toggleChannel = (channel: keyof typeof selectedChannels) => {
    setSelectedChannels({
      ...selectedChannels,
      [channel]: !selectedChannels[channel],
    });
  };

  const getChannelLabel = (channel: 'r' | 'g' | 'b' | 'a' | 'gray') => {
    switch (channel) {
      case 'r':
        return 'Красный (R)';
      case 'g':
        return 'Зеленый (G)';
      case 'b':
        return 'Синий (B)';
      case 'a':
        return 'Альфа (A)';
      case 'gray':
        return 'Серый (Gray)';
      default:
        return '';
    }
  };

  return (
    <div className="w-72 bg-[hsl(220,10%,20%)] p-4 overflow-y-auto flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold mb-3 text-white/90">Цветовые каналы</h3>
        <p className="text-xs text-white/40 mb-4">
          Нажмите на миниатюру, чтобы включить/выключить канал
        </p>

        <div className="grid grid-cols-1 gap-3">
          {availableChannels.map((channel) => (
             <ChannelItem
               key={channel}
               label={getChannelLabel(channel)}
               channel={channel}
               imageData={imageData}
               format={format}
               isSelected={selectedChannels[channel]}
               onToggle={() => toggleChannel(channel)}
             />
           ))}
         </div>
      </div>
    </div>
  );
}

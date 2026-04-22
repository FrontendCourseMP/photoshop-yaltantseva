import { useRef, useEffect } from 'react';

interface ChannelsPanelProps {
  imageData: ImageData | null;
  selectedChannels: { r: boolean; g: boolean; b: boolean; a: boolean };
  setSelectedChannels: (channels: { r: boolean; g: boolean; b: boolean; a: boolean }) => void;
}

// Создание превью для отдельного канала
function createChannelPreview(
  imageData: ImageData, 
  channel: 'r' | 'g' | 'b' | 'a'
): ImageData {
  const preview = new ImageData(imageData.width, imageData.height);
  const pixels = preview.data;
  const origPixels = imageData.data;

  for (let i = 0; i < origPixels.length; i += 4) {
    let value = 0;
    
    // Получаем значение канала
    if (channel === 'r') value = origPixels[i];
    else if (channel === 'g') value = origPixels[i + 1];
    else if (channel === 'b') value = origPixels[i + 2];
    else if (channel === 'a') value = origPixels[i + 3];
    
    if (channel === 'a') {
      // Альфа-канал показываем в градациях серого
      pixels[i] = value;     // R
      pixels[i + 1] = value; // G
      pixels[i + 2] = value; // B
      pixels[i + 3] = 255;   // A - непрозрачный фон
    } else {
      // RGB каналы показываем в соответствующем цвете
      if (channel === 'r') {
        pixels[i] = value;     // R
        pixels[i + 1] = 0;     // G
        pixels[i + 2] = 0;     // B
      } else if (channel === 'g') {
        pixels[i] = 0;         // R
        pixels[i + 1] = value; // G
        pixels[i + 2] = 0;     // B
      } else if (channel === 'b') {
        pixels[i] = 0;         // R
        pixels[i + 1] = 0;     // G
        pixels[i + 2] = value; // B
      }
      pixels[i + 3] = 255; // Непрозрачный фон
    }
  }
  
  return preview;
}

function ChannelItem({
  label,
  channel,
  imageData,
  isSelected,
  onToggle,
}: {
  label: string;
  channel: 'r' | 'g' | 'b' | 'a';
  imageData: ImageData | null;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imageData) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Создаем превью для канала
    const preview = createChannelPreview(imageData, channel);
    
    // Фиксированный размер миниатюры 64x64 с сохранением пропорций
    const maxSize = 64;
    const scale = Math.min(maxSize / imageData.width, maxSize / imageData.height);
    const width = Math.floor(imageData.width * scale);
    const height = Math.floor(imageData.height * scale);
    
    canvas.width = width;
    canvas.height = height;
    
    // Очищаем canvas
    ctx.clearRect(0, 0, width, height);
    
    // Для альфа-канала рисуем шахматную доску (фон)
    if (channel === 'a') {
      drawCheckerboard(ctx, width, height);
    }
    
    // Рисуем превью
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.putImageData(preview, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0, width, height);
    }
  }, [imageData, channel]);

  // Определяем цвет рамки в зависимости от канала
  const getBorderColor = () => {
    if (!isSelected) return 'border-gray-600';
    switch (channel) {
      case 'r': return 'border-red-500';
      case 'g': return 'border-green-500';
      case 'b': return 'border-blue-500';
      case 'a': return 'border-purple-500';
      default: return 'border-blue-400';
    }
  };

  // Определяем цвет текста
  const getTextColor = () => {
    if (!isSelected) return 'text-white/60';
    switch (channel) {
      case 'r': return 'text-red-400';
      case 'g': return 'text-green-400';
      case 'b': return 'text-blue-400';
      case 'a': return 'text-purple-400';
      default: return 'text-white';
    }
  };

  return (
    <div
      className={`p-2 border-2 rounded cursor-pointer transition-all ${getBorderColor()} bg-[hsl(220,10%,15%)] hover:bg-[hsl(220,10%,25%)]`}
      onClick={onToggle}
    >
      <div className={`text-xs font-medium mb-1 ${getTextColor()}`}>{label}</div>
      <canvas 
        ref={canvasRef} 
        className="w-full rounded"
        style={{ aspectRatio: `${imageData?.width || 1}/${imageData?.height || 1}` }}
      />
      <div className="text-xs text-center mt-1 text-white/40">
        {isSelected ? '✓ Включен' : '✗ Выключен'}
      </div>
    </div>
  );
}

// Функция для рисования шахматной доски (для альфа-канала)
function drawCheckerboard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cellSize: number = 8
) {
  const lightColor = '#e0e0e0';
  const darkColor = '#a0a0a0';

  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      const isLight = (Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 2 === 0;
      ctx.fillStyle = isLight ? lightColor : darkColor;
      ctx.fillRect(x, y, Math.min(cellSize, width - x), Math.min(cellSize, height - y));
    }
  }
}

export function ChannelsPanel({
  imageData,
  selectedChannels,
  setSelectedChannels,
}: ChannelsPanelProps) {
  if (!imageData) return null;

  const toggleChannel = (channel: keyof typeof selectedChannels) => {
    setSelectedChannels({ 
      ...selectedChannels, 
      [channel]: !selectedChannels[channel] 
    });
  };

  return (
    <div className="w-72 bg-[hsl(220,10%,20%)] p-4 overflow-y-auto flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold mb-3 text-white/90">Цветовые каналы</h3>
        <p className="text-xs text-white/40 mb-4">
          Нажмите на миниатюру, чтобы включить/выключить канал
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <ChannelItem
            label="Красный (R)"
            channel="r"
            imageData={imageData}
            isSelected={selectedChannels.r}
            onToggle={() => toggleChannel('r')}
          />
          <ChannelItem
            label="Зеленый (G)"
            channel="g"
            imageData={imageData}
            isSelected={selectedChannels.g}
            onToggle={() => toggleChannel('g')}
          />
          <ChannelItem
            label="Синий (B)"
            channel="b"
            imageData={imageData}
            isSelected={selectedChannels.b}
            onToggle={() => toggleChannel('b')}
          />
          <ChannelItem
            label="Альфа (A)"
            channel="a"
            imageData={imageData}
            isSelected={selectedChannels.a}
            onToggle={() => toggleChannel('a')}
          />
        </div>
      </div>
    </div>
  );
}
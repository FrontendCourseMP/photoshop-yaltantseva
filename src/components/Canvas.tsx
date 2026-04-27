import { useRef, useEffect } from 'react';
import { useCanvasDrawing } from '@/hooks/useCanvasDrawing';

interface CanvasProps {
  imageData: ImageData | null;
  tool: string | null;
  onPixelClick: (info: {
    x: number;
    y: number;
    rgb: [number, number, number];
    lab: [number, number, number];
  }) => void;
  selectedChannels: { r: boolean; g: boolean; b: boolean; a: boolean; gray: boolean };
  format: string | null;
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // Normalize RGB to 0-1
  r /= 255;
  g /= 255;
  b /= 255;

  // Linearize
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // To XYZ
  const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  // To LAB
  const xr = x / 0.95047;
  const yr = y / 1.0;
  const zr = z / 1.08883;

  const fx = xr > 0.008856 ? Math.pow(xr, 1 / 3) : 7.787 * xr + 16 / 116;
  const fy = yr > 0.008856 ? Math.pow(yr, 1 / 3) : 7.787 * yr + 16 / 116;
  const fz = zr > 0.008856 ? Math.pow(zr, 1 / 3) : 7.787 * zr + 16 / 116;

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bb = 200 * (fy - fz);

  return [L, a, bb];
}

// Функция для получения курсора в зависимости от инструмента
const getCursor = (tool: string | null) => {
  switch (tool) {
    case 'pipette':
      return 'crosshair';
    case 'cursor':
      return 'default';
    default:
      return 'default';
  }
};

export function Canvas({ imageData, tool, onPixelClick, selectedChannels, format }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCanvasDrawing(canvasRef, imageData, selectedChannels, format);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.style.cursor = getCursor(tool);
  }, [tool]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'pipette' || !imageData || !canvasRef.current) return;
    e.preventDefault();
    if (e.button !== 0) return; // Only left mouse button

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = imageData.width / rect.width;
    const scaleY = imageData.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
      const index = (y * imageData.width + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const lab = rgbToLab(r, g, b);
      onPixelClick({ x, y, rgb: [r, g, b], lab });
    }
  };

  if (!imageData) {
    return (
      <div className="flex items-center justify-center w-full h-full text-white/40">
        Откройте изображение
      </div>
    );
  }

  const cursorClass = tool === 'pipette' ? 'cursor-crosshair' : 'cursor-default';

  return (
    <canvas
      ref={canvasRef}
      className={`max-w-full max-h-full object-contain ${cursorClass}`}
      style={{ cursor: getCursor(tool) }}
      onMouseDown={handleClick}
      onMouseMove={() => {
        if (canvasRef.current && tool === 'pipette') {
          canvasRef.current.style.cursor = 'crosshair';
        }
      }}
    />
  );
}

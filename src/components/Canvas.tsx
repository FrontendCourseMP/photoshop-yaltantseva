import { useRef, useEffect } from 'react';

interface CanvasProps {
  imageData: ImageData | null;
}

function drawCheckerboard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cellSize: number = 8,
) {
  const lightColor = '#cccccc';
  const darkColor = '#888888';

  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      const isLight = (x / cellSize + y / cellSize) % 2 === 0;
      ctx.fillStyle = isLight ? lightColor : darkColor;
      ctx.fillRect(x, y, Math.min(cellSize, width - x), Math.min(cellSize, height - y));
    }
  }
}

export function Canvas({ imageData }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imageData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Устанавливаем размер canvas равным размеру изображения
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    // Рисуем шахматную доску для фона
    drawCheckerboard(ctx, imageData.width, imageData.height);

    // Создаем временный canvas для изображения
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.putImageData(imageData, 0, 0);
      // Рисуем изображение поверх шахматки с учетом прозрачности
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }, [imageData]);

  if (!imageData) {
    return (
      <div className="flex items-center justify-center w-full h-full text-white/40">
        Откройте изображение
      </div>
    );
  }

  return <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />;
}

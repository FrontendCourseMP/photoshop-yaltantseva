import { useEffect, RefObject } from 'react';

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
      const isLight = (Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 2 === 0;
      ctx.fillStyle = isLight ? lightColor : darkColor;
      ctx.fillRect(x, y, Math.min(cellSize, width - x), Math.min(cellSize, height - y));
    }
  }
}

function applyChannelSelection(
  imageData: ImageData,
  selectedChannels: { r: boolean; g: boolean; b: boolean; a: boolean; gray: boolean },
  format: string | null,
): ImageData {
  // СОЗДАЕМ НОВЫЙ МАССИВ, не изменяем оригинал!
  const modified = new ImageData(imageData.width, imageData.height);
  const origData = imageData.data;
  const modData = modified.data;

  const isGB7 = format === 'gb7';

  for (let i = 0; i < origData.length; i += 4) {
    if (isGB7) {
      // Для GB7: если gray выключен - все RGB = 0, иначе оставляем оригинальные значения
      const grayValue = selectedChannels.gray ? origData[i] : 0;
      modData[i] = grayValue; // R
      modData[i + 1] = grayValue; // G
      modData[i + 2] = grayValue; // B
      modData[i + 3] = selectedChannels.a ? origData[i + 3] : 255; // A
    } else {
      // Для обычных изображений: применяем RGB каналы отдельно
      modData[i] = selectedChannels.r ? origData[i] : 0; // R
      modData[i + 1] = selectedChannels.g ? origData[i + 1] : 0; // G
      modData[i + 2] = selectedChannels.b ? origData[i + 2] : 0; // B
      modData[i + 3] = selectedChannels.a ? origData[i + 3] : 255; // A
    }
  }

  return modified;
}

export function useCanvasDrawing(
  canvasRef: RefObject<HTMLCanvasElement>,
  imageData: ImageData | null,
  selectedChannels: { r: boolean; g: boolean; b: boolean; a: boolean; gray: boolean },
  format: string | null,
) {
  useEffect(() => {
    if (!canvasRef.current || !imageData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Устанавливаем размер canvas равным размеру изображения
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    // Рисуем шахматную доску для фона (видна будет только если есть прозрачность)
    drawCheckerboard(ctx, imageData.width, imageData.height);

    // Применяем выбранные каналы к изображению (создаем НОВЫЙ ImageData)
    const modifiedImageData = applyChannelSelection(imageData, selectedChannels, format);

    // Создаем временный canvas для изображения
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.putImageData(modifiedImageData, 0, 0);
      // Рисуем изображение поверх шахматки с учетом прозрачности
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }, [canvasRef, imageData, selectedChannels, format]);
}

export function loadImageFile(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Не удалось получить контекст'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(ctx.getImageData(0, 0, img.width, img.height));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Ошибка загрузки'));
    };
    img.src = url;
  });
}

export function getColorDepth(imageData: ImageData, format?: string): number {
  const data = imageData.data;

  if (format === 'gb7') {
    let hasTransparency = false;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 255) {
        hasTransparency = true;
        break;
      }
    }
    return hasTransparency ? 8 : 7;
  }

  let hasTransparency = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 255) {
      hasTransparency = true;
      break;
    }
  }

  return hasTransparency ? 32 : 24;
}

export function getAvailableChannels(
  imageData: ImageData,
  format?: string,
): ('r' | 'g' | 'b' | 'a' | 'gray')[] {
  if (format === 'gb7') {
    // Для GB7 всегда есть серый канал, альфа - опционально
    const channels: ('r' | 'g' | 'b' | 'a' | 'gray')[] = ['gray'];

    // Проверяем наличие прозрачности
    let hasTransparency = false;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] !== 255) {
        hasTransparency = true;
        break;
      }
    }

    if (hasTransparency) {
      channels.push('a');
    }

    return channels;
  }

  // Для JPG всегда только RGB (нет прозрачности)
  if (format === 'jpg' || format === 'jpeg') {
    return ['r', 'g', 'b'];
  }

  // Для PNG и других форматов проверяем наличие прозрачности
  let hasTransparency = false;
  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] !== 255) {
      hasTransparency = true;
      break;
    }
  }

  const channels: ('r' | 'g' | 'b' | 'a')[] = ['r', 'g', 'b'];
  if (hasTransparency) {
    channels.push('a');
  }

  return channels;
}

export function saveImageAs(imageData: ImageData, format: 'png' | 'jpg') {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);

  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';

  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `image.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, mime);
}

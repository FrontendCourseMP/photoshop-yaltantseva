export interface ImageDataWrapper {
  data: ImageData;
  format?: string;
}

export abstract class ImageHandler {
  abstract load(file: File): Promise<ImageDataWrapper>;
  abstract save(data: ImageDataWrapper, format: string): void;
}

export class DefaultImageHandler extends ImageHandler {
  async load(file: File): Promise<ImageDataWrapper> {
    const ext = file.name.split('.').pop()?.toLowerCase();
    let imageData: ImageData;

    if (ext === 'gb7') {
      const buffer = await file.arrayBuffer();
      imageData = decodeGB7(buffer);
    } else {
      imageData = await loadImageFile(file);
    }

    return { data: imageData, format: ext };
  }

  save(data: ImageDataWrapper, format: string): void {
    if (format === 'gb7') {
      saveAsGB7(data.data);
    } else {
      saveImageAs(data.data, format as 'png' | 'jpg');
    }
  }
}

// Импорты для зависимостей
import { loadImageFile, saveImageAs } from './imageUtils';
import { decodeGB7, saveAsGB7 } from './gb7';

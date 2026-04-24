import { useState, useRef } from 'react';
import { DefaultImageHandler, ImageDataWrapper } from '@/lib/imageHandler';

export function useImageFile() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const handler = new DefaultImageHandler();

  const openFile = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const wrapper = await handler.load(file);
      setImageData(wrapper.data);
      setFormat(wrapper.format || null);
    } catch (err) {
      alert('Ошибка загрузки: ' + (err as Error).message);
    }

    e.target.value = '';
  };

  const saveAs = (format: 'png' | 'jpg' | 'gb7') => {
    if (!imageData) {
      alert('Нет изображения для сохранения');
      return;
    }
    const wrapper: ImageDataWrapper = { data: imageData };
    handler.save(wrapper, format);
  };

  return { imageData, format, openFile, handleFile, saveAs, inputRef };
}

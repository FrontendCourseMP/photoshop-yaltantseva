import { useEffect } from 'react';
import { useImageFile } from '@/hooks/useImageFile';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './ui/menubar';

export function MenubarDemo({
  onImageLoad,
  onOpenLevels,
}: {
  onImageLoad: (d: ImageData, format?: string) => void;
  onOpenLevels: () => void;
}) {
  const { openFile, handleFile, saveAs, inputRef, imageData, format } = useImageFile();

  useEffect(() => {
    if (imageData) onImageLoad(imageData, format);
  }, [imageData, format, onImageLoad]);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gb7"
        className="hidden"
        onChange={handleFile}
      />

      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Файл</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem onSelect={openFile}>
                Открыть... <MenubarShortcut>^O</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Сохранить как...</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarGroup>
                    <MenubarItem onSelect={() => saveAs('png')}>PNG</MenubarItem>
                    <MenubarItem onSelect={() => saveAs('jpg')}>JPG</MenubarItem>
                    <MenubarItem onSelect={() => saveAs('gb7')}>GB7</MenubarItem>
                  </MenubarGroup>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Правка</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem disabled>
                Отменить <MenubarShortcut>⌃Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>
                Вернуть <MenubarShortcut>⌃Y</MenubarShortcut>
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarItem disabled>Вырезать</MenubarItem>
              <MenubarItem disabled>Копировать</MenubarItem>
              <MenubarItem disabled>Вставить</MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Изображение</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem onSelect={onOpenLevels}>
                Уровни... <MenubarShortcut>⌃L</MenubarShortcut>
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Вид</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem disabled>
                Увеличить <MenubarShortcut>⌘+</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>
                Уменьшить <MenubarShortcut>⌘-</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>
                По размеру окна <MenubarShortcut>⌘0</MenubarShortcut>
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarCheckboxItem disabled>Строка состояния</MenubarCheckboxItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Фильтры</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem disabled>Оттенки серого</MenubarItem>
              <MenubarItem disabled>Инверсия</MenubarItem>
              <MenubarItem disabled>Размытие</MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </>
  );
}

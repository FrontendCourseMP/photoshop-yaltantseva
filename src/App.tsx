import { MenubarDemo } from './components/Menubar';
import { useState, useCallback } from 'react';
import { Canvas } from './components/Canvas';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import { ChannelsPanel } from './components/ChannelsPanel';
import { LevelsDialog } from './components/LevelsDialog';
import { getColorDepth, getAvailableChannels } from './lib/imageUtils';

function App() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [previewImageData, setPreviewImageData] = useState<ImageData | null>(null);
  const [levelsPreviewEnabled, setLevelsPreviewEnabled] = useState(true);
  const [activeTool, setActiveTool] = useState('cursor');
  const [colorDepth, setColorDepth] = useState(0);
  const [format, setFormat] = useState<string | null>(null);
  const [pixelInfo, setPixelInfo] = useState<{
    x: number;
    y: number;
    rgb: [number, number, number];
    lab: [number, number, number];
  } | null>(null);
  const [selectedChannels, setSelectedChannels] = useState({
    r: true,
    g: true,
    b: true,
    a: true,
    gray: true,
  });
  const [isLevelsOpen, setIsLevelsOpen] = useState(false);

  const handleImageLoad = useCallback((data: ImageData, imageFormat?: string) => {
    setImageData(data);
    setFormat(imageFormat || null);
    setColorDepth(getColorDepth(data, imageFormat));
    setPixelInfo(null);
    setOriginalImageData(null);
    setPreviewImageData(null);
    setLevelsPreviewEnabled(true);

    // Сбрасываем настройки каналов в зависимости от доступных каналов
    const availableChannels = getAvailableChannels(data, imageFormat);
    const newSelectedChannels = { r: false, g: false, b: false, a: false, gray: false };

    availableChannels.forEach((channel) => {
      newSelectedChannels[channel] = true;
    });

    setSelectedChannels(newSelectedChannels);
  }, []);

  const handlePixelClick = (info: {
    x: number;
    y: number;
    rgb: [number, number, number];
    lab: [number, number, number];
  }) => {
    setPixelInfo(info);
  };

  const handleToolSelect = (tool: string) => {
    setActiveTool(tool);
  };

  const handleOpenLevels = useCallback(() => {
    if (!imageData) return;
    setOriginalImageData(imageData);
    setPreviewImageData(imageData);
    setLevelsPreviewEnabled(true);
    setIsLevelsOpen(true);
  }, [imageData]);

  const handleLevelsPreview = useCallback((preview: ImageData | null) => {
    setPreviewImageData(preview);
  }, []);

  const handleLevelsTogglePreview = useCallback((enabled: boolean) => {
    setLevelsPreviewEnabled(enabled);
  }, []);

  const handleLevelsApply = useCallback((newImageData: ImageData) => {
    setImageData(newImageData);
    setOriginalImageData(null);
    setPreviewImageData(null);
    setLevelsPreviewEnabled(true);
    setIsLevelsOpen(false);
  }, []);

  const handleLevelsCancel = useCallback(() => {
    setPreviewImageData(null);
    setOriginalImageData(null);
    setLevelsPreviewEnabled(true);
    setIsLevelsOpen(false);
  }, []);

  const displayedImageData = isLevelsOpen
    ? levelsPreviewEnabled
      ? (previewImageData ?? imageData)
      : (originalImageData ?? imageData)
    : imageData;

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Menubar вверху */}
      <div className="border-b p-2">
        <MenubarDemo onImageLoad={handleImageLoad} onOpenLevels={handleOpenLevels} />
      </div>

      {/* Основное содержимое: Toolbar + Canvas + ChannelsPanel */}
      <div className="flex-1 flex overflow-hidden">
        <Toolbar activeTool={activeTool} onToolSelect={handleToolSelect} />

        <main className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <Canvas
            imageData={displayedImageData}
            tool={activeTool}
            onPixelClick={handlePixelClick}
            selectedChannels={selectedChannels}
            format={format}
          />
        </main>

        <ChannelsPanel
          imageData={imageData}
          format={format}
          selectedChannels={selectedChannels}
          setSelectedChannels={setSelectedChannels}
        />
      </div>

      {/* StatusBar внизу */}
      <StatusBar imageData={imageData} colorDepth={colorDepth} pixelInfo={pixelInfo} />

      <LevelsDialog
        isOpen={isLevelsOpen}
        onClose={handleLevelsCancel}
        imageData={originalImageData ?? imageData}
        onPreview={handleLevelsPreview}
        onPreviewToggle={handleLevelsTogglePreview}
        onApply={handleLevelsApply}
        onCancel={handleLevelsCancel}
        previewEnabled={levelsPreviewEnabled}
      />
    </div>
  );
}

export default App;

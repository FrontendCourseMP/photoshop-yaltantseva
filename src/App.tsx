import { MenubarDemo } from './components/Menubar';
import { useState, useCallback } from 'react';
import { Canvas } from './components/Canvas';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import { ChannelsPanel } from './components/ChannelsPanel';
import { getColorDepth, getAvailableChannels } from './lib/imageUtils';

function App() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
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

  const handleImageLoad = useCallback((data: ImageData, imageFormat?: string) => {
    setImageData(data);
    setFormat(imageFormat || null);
    setColorDepth(getColorDepth(data, imageFormat));
    setPixelInfo(null);

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

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Menubar вверху */}
      <div className="border-b p-2">
        <MenubarDemo onImageLoad={handleImageLoad} />
      </div>

      {/* Основное содержимое: Toolbar + Canvas + ChannelsPanel */}
      <div className="flex-1 flex overflow-hidden">
        <Toolbar activeTool={activeTool} onToolSelect={handleToolSelect} />

        <main className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <Canvas
            imageData={imageData}
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
    </div>
  );
}

export default App;

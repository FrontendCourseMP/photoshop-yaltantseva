// App.tsx
import { MenubarDemo } from './components/Menubar';
import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';

function App() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [activeTool, setActiveTool] = useState('cursor');

  const handlePixelClick = (info: { 
    x: number; 
    y: number; 
    rgb: [number, number, number]; 
    lab: [number, number, number];
  }) => {
    console.log("Пипетка: координаты и цвет", info);
  };

  const handleToolSelect = (tool: string) => {
    setActiveTool(tool);
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Menubar вверху */}
      <div className="border-b p-2">
        <MenubarDemo onImageLoad={setImageData} />
      </div>
      
      {/* Основное содержимое: Toolbar + Canvas */}
      <div className="flex-1 flex overflow-hidden">
        <Toolbar 
          activeTool={activeTool} 
          onToolSelect={handleToolSelect} 
        />
        
        <main className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <Canvas 
            imageData={imageData} 
            tool={activeTool} 
            onPixelClick={handlePixelClick} 
          />
        </main>
      </div>
      
      {/* StatusBar внизу */}
      <StatusBar imageData={imageData} />
    </div>
  );
}

export default App;
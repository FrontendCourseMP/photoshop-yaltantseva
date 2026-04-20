// App.tsx
import { MenubarDemo } from './components/Menubar';
import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

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
    console.log("Выбран инструмент:", tool === "cursor" ? "Курсор" : "Пипетка");
  };

  return (
    <SidebarProvider>
      <div className="w-full min-h-screen flex">
        <Toolbar 
          activeTool={activeTool} 
          onToolSelect={handleToolSelect} 
        />
        
        <div className="flex-1 flex flex-col">
          <div className="border-b p-2 flex items-center">
            <SidebarTrigger />
            <MenubarDemo onImageLoad={setImageData} />
          </div>
          
          <main className="flex-1 flex items-center justify-center p-4">
            <Canvas 
              imageData={imageData} 
              tool={activeTool} 
              onPixelClick={handlePixelClick} 
            />
          </main>
          
          <StatusBar imageData={imageData} />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default App;
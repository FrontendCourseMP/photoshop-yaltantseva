import { MenubarDemo } from './components/Menubar';
import { useState } from "react"
import { Canvas } from "./components/Canvas"
import { StatusBar } from "./components/StatusBar"

function App() {
  const [imageData, setImageData] = useState<ImageData | null>(null)

  return (
    <div className="w-full min-h-screen flex flex-col">
      <MenubarDemo onImageLoad={setImageData} />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Canvas imageData={imageData} />
      </main>

      <StatusBar imageData={imageData} />
    </div>
  )
}

export default App;

import { useRef, useEffect } from "react"

interface CanvasProps {
  imageData: ImageData | null
}

export function Canvas({ imageData }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !imageData) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Устанавливаем размер canvas равным размеру изображения
    canvas.width = imageData.width
    canvas.height = imageData.height

    // Рисуем изображение
    ctx.putImageData(imageData, 0, 0)
  }, [imageData])

  if (!imageData) {
    return (
      <div className="flex items-center justify-center w-full h-full text-white/40">
        Откройте изображение
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full max-h-full object-contain"
    />
  )
}
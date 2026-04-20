interface StatusBarProps {
  imageData: ImageData | null
  pixelInfo: { x: number, y: number, rgb: [number, number, number], lab: [number, number, number] } | null
}

export function StatusBar({ imageData, pixelInfo }: StatusBarProps) {
  if (!imageData) {
    return (
      <footer className="h-6 px-4 flex items-center text-xs text-white/30 bg-[hsl(220,10%,20%)]">
        Нет изображения
      </footer>
    )
  }

  return (
    <footer className="h-6 px-4 flex items-center gap-6 text-xs text-white/50 bg-[hsl(220,10%,20%)]">
      <span>Ширина: {imageData.width} px</span>
      <span>Высота: {imageData.height} px</span>
      <span>Глубина цвета: 32 бит</span>
      {pixelInfo && (
        <span>
          X: {pixelInfo.x}, Y: {pixelInfo.y} | RGB: {pixelInfo.rgb.join(', ')} | LAB: {pixelInfo.lab.map(v => v.toFixed(2)).join(', ')}
        </span>
      )}
    </footer>
  )
}
interface StatusBarProps {
  imageData: ImageData | null;
  colorDepth: number;
  pixelInfo: {
    x: number;
    y: number;
    rgb: [number, number, number];
    lab: [number, number, number];
  } | null;
}

export function StatusBar({ imageData, colorDepth, pixelInfo }: StatusBarProps) {
  if (!imageData) {
    return (
      <footer className="h-6 px-4 flex items-center text-xs text-white/30 bg-[hsl(220,10%,20%)]">
        Нет изображения
      </footer>
    );
  }

  return (
    <footer className="h-8 px-4 flex flex-wrap items-center gap-4 text-xs text-white/50 bg-[hsl(220,10%,20%)]">
      <span>Ширина: {imageData.width} px</span>
      <span>Высота: {imageData.height} px</span>
      <span>Глубина цвета: {colorDepth} бит</span>
      {pixelInfo ? (
        <span className="whitespace-nowrap">
          Координаты: X {pixelInfo.x}, Y {pixelInfo.y} · RGB: {pixelInfo.rgb.join(', ')} · LAB:{' '}
          {pixelInfo.lab.map((v) => v.toFixed(2)).join(', ')}
        </span>
      ) : (
        <span className="text-white/30">
          Выберите инструмент «Пипетка» и кликните по изображению
        </span>
      )}
    </footer>
  );
}

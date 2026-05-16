interface StatusBarProps {
  imageData: ImageData | null;
  colorDepth: number;
  pixelInfo: {
    x: number;
    y: number;
    rgb: [number, number, number];
    lab: [number, number, number];
  } | null;
  scale: number;
  onScaleChange: (scale: number) => void;
}

export function StatusBar({
  imageData,
  colorDepth,
  pixelInfo,
  scale,
  onScaleChange,
}: StatusBarProps) {
  if (!imageData) {
    return (
      <footer className="h-6 px-4 flex items-center text-xs text-white/30 bg-[hsl(220,10%,20%)]">
        Нет изображения
      </footer>
    );
  }

  return (
    <footer className="h-12 px-4 flex flex-wrap items-center gap-4 text-xs text-white/50 bg-[hsl(220,10%,20%)]">
      <span>Ширина: {imageData.width} px</span>
      <span>Высота: {imageData.height} px</span>
      <span>Глубина цвета: {colorDepth} бит</span>
      <span className="flex items-center gap-2">
        <label htmlFor="scaleRange" className="text-white/80">
          Масштаб:
        </label>
        <input
          id="scaleRange"
          type="range"
          min={12}
          max={300}
          value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="h-2 w-36 accent-sky-400"
        />
        <span className="min-w-12 text-right">{scale}%</span>
      </span>
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

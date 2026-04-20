import { useRef, useEffect } from 'react';

interface ChannelsPanelProps {
  imageData: ImageData | null;
  selectedChannels: { r: boolean; g: boolean; b: boolean; a: boolean };
  setSelectedChannels: (channels: { r: boolean; g: boolean; b: boolean; a: boolean }) => void;
}

function createChannelPreview(imageData: ImageData, channel: 'r' | 'g' | 'b' | 'a'): ImageData {
  const preview = new ImageData(imageData.width, imageData.height);
  const pixels = preview.data;
  const origPixels = imageData.data;

  for (let i = 0; i < origPixels.length; i += 4) {
    let value = 0;
    if (channel === 'r') value = origPixels[i];
    else if (channel === 'g') value = origPixels[i + 1];
    else if (channel === 'b') value = origPixels[i + 2];
    else if (channel === 'a') value = origPixels[i + 3];

    pixels[i] = value;
    pixels[i + 1] = value;
    pixels[i + 2] = value;
    pixels[i + 3] = 255;
  }

  return preview;
}

function ChannelItem({
  label,
  channel,
  imageData,
  isSelected,
  onToggle,
}: {
  label: string;
  channel: 'r' | 'g' | 'b' | 'a';
  imageData: ImageData | null;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imageData) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const preview = createChannelPreview(imageData, channel);
    const scale = Math.min(50 / imageData.width, 50 / imageData.height);
    canvas.width = imageData.width * scale;
    canvas.height = imageData.height * scale;
    ctx.scale(scale, scale);
    ctx.putImageData(preview, 0, 0);
  }, [imageData, channel]);

  return (
    <div
      className={`p-2 border ${isSelected ? 'border-blue-500' : 'border-gray-300'} cursor-pointer`}
      onClick={onToggle}
    >
      <div className="text-xs">{label}</div>
      <canvas ref={canvasRef} className="border" />
    </div>
  );
}

export function ChannelsPanel({
  imageData,
  selectedChannels,
  setSelectedChannels,
}: ChannelsPanelProps) {
  if (!imageData) return null;

  const toggleChannel = (channel: keyof typeof selectedChannels) => {
    setSelectedChannels({ ...selectedChannels, [channel]: !selectedChannels[channel] });
  };

  return (
    <div className="w-64 bg-gray-100 p-4">
      <h3 className="text-sm font-bold mb-2">Каналы</h3>
      <div className="space-y-2">
        <ChannelItem
          label="Red"
          channel="r"
          imageData={imageData}
          isSelected={selectedChannels.r}
          onToggle={() => toggleChannel('r')}
        />
        <ChannelItem
          label="Green"
          channel="g"
          imageData={imageData}
          isSelected={selectedChannels.g}
          onToggle={() => toggleChannel('g')}
        />
        <ChannelItem
          label="Blue"
          channel="b"
          imageData={imageData}
          isSelected={selectedChannels.b}
          onToggle={() => toggleChannel('b')}
        />
        <ChannelItem
          label="Alpha"
          channel="a"
          imageData={imageData}
          isSelected={selectedChannels.a}
          onToggle={() => toggleChannel('a')}
        />
      </div>
    </div>
  );
}

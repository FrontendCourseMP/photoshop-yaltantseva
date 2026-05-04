export type Channel = 'master' | 'r' | 'g' | 'b' | 'a';

export interface LevelValues {
  black: number;
  white: number;
  gamma: number;
}

export const defaultLevels: Record<Channel, LevelValues> = {
  master: { black: 0, white: 255, gamma: 1 },
  r: { black: 0, white: 255, gamma: 1 },
  g: { black: 0, white: 255, gamma: 1 },
  b: { black: 0, white: 255, gamma: 1 },
  a: { black: 0, white: 255, gamma: 1 },
};

export function makeLUT(black: number, gamma: number, white: number) {
  const lut = new Uint8ClampedArray(256);
  const minValue = Math.max(0, Math.min(255, black));
  const maxValue = Math.max(0, Math.min(255, white));
  const range = Math.max(1, maxValue - minValue);

  for (let i = 0; i < 256; i++) {
    if (i <= minValue) {
      lut[i] = 0;
    } else if (i >= maxValue) {
      lut[i] = 255;
    } else {
      const normalized = (i - minValue) / range;
      const corrected = Math.pow(normalized, 1 / gamma);
      lut[i] = Math.round(Math.max(0, Math.min(255, corrected * 255)));
    }
  }

  return lut;
}

export function applyLevels(imageData: ImageData, levels: Record<Channel, LevelValues>) {
  const lutR = makeLUT(levels.r.black, levels.r.gamma, levels.r.white);
  const lutG = makeLUT(levels.g.black, levels.g.gamma, levels.g.white);
  const lutB = makeLUT(levels.b.black, levels.b.gamma, levels.b.white);
  const lutA = makeLUT(levels.a.black, levels.a.gamma, levels.a.white);

  const output = new ImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = output.data;

  for (let i = 0; i < src.length; i += 4) {
    dst[i] = lutR[src[i]];
    dst[i + 1] = lutG[src[i + 1]];
    dst[i + 2] = lutB[src[i + 2]];
    dst[i + 3] = lutA[src[i + 3]];
  }

  return output;
}

export function computeHistogram(imageData: ImageData, channel: Channel): number[] {
  const hist = new Array(256).fill(0);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    let value: number;
    if (channel === 'master') {
      value = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    } else if (channel === 'r') {
      value = r;
    } else if (channel === 'g') {
      value = g;
    } else if (channel === 'b') {
      value = b;
    } else {
      value = a;
    }

    hist[value]++;
  }

  return hist;
}

export function drawHistogram(canvas: HTMLCanvasElement, histogram: number[], isLog: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const maxValue = Math.max(...histogram);
  const scale = canvas.height / (isLog ? Math.log(maxValue + 1) : maxValue);

  ctx.fillStyle = '#888888';
  for (let i = 0; i < 256; i++) {
    const height = isLog ? Math.log(histogram[i] + 1) * scale : histogram[i] * scale;
    ctx.fillRect(i, canvas.height - height, 1, height);
  }
}

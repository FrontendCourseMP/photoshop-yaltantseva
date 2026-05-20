export type FilterChannel = 'r' | 'g' | 'b' | 'a' | 'gray';
export type EdgeHandling = 'black' | 'white' | 'copy';

export interface FilterPreset {
  id: string;
  label: string;
  kernel: number[];
  divisor: number;
}

export const filterPresets: FilterPreset[] = [
  {
    id: 'identity',
    label: 'Тождественное отображение',
    kernel: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    divisor: 1,
  },
  {
    id: 'sharpen',
    label: 'Повышение резкости',
    kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    divisor: 1,
  },
  {
    id: 'gaussian',
    label: 'Фильтр Гаусса (3x3)',
    kernel: [1, 2, 1, 2, 4, 2, 1, 2, 1],
    divisor: 16,
  },
  {
    id: 'box',
    label: 'Прямоугольное размытие',
    kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1],
    divisor: 9,
  },
  {
    id: 'prewittH',
    label: 'Оператор Прюитта Горизонтальный',
    kernel: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
    divisor: 1,
  },
  {
    id: 'prewittV',
    label: 'Оператор Прюитта Вертикальный',
    kernel: [-1, 0, 1, -1, 0, 1, -1, 0, 1],
    divisor: 1,
  },
];

const clamp8 = (value: number) => Math.min(255, Math.max(0, value));

function getClampedCoordinates(value: number, max: number) {
  return Math.min(max, Math.max(0, value));
}

function getSampleValue(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  channel: FilterChannel,
  edgeHandling: EdgeHandling,
): number {
  const inBounds = x >= 0 && x < width && y >= 0 && y < height;

  if (!inBounds) {
    if (edgeHandling === 'copy') {
      const clampedX = getClampedCoordinates(x, width - 1);
      const clampedY = getClampedCoordinates(y, height - 1);
      const index = (clampedY * width + clampedX) * 4;
      if (channel === 'gray') {
        return Math.round((data[index] + data[index + 1] + data[index + 2]) / 3);
      }
      const channelIndex = channel === 'a' ? 3 : channel === 'r' ? 0 : channel === 'g' ? 1 : 2;
      return data[index + channelIndex];
    }

    return edgeHandling === 'white' ? 255 : 0;
  }

  const index = (y * width + x) * 4;
  if (channel === 'gray') {
    return Math.round((data[index] + data[index + 1] + data[index + 2]) / 3);
  }
  const channelIndex = channel === 'a' ? 3 : channel === 'r' ? 0 : channel === 'g' ? 1 : 2;
  return data[index + channelIndex];
}

export async function applyKernelAsync(
  imageData: ImageData,
  kernel: number[],
  divisor: number,
  edgeHandling: EdgeHandling,
  selectedChannels: Set<FilterChannel>,
  chunkSize = 16,
): Promise<ImageData> {
  const width = imageData.width;
  const height = imageData.height;
  const input = imageData.data;
  const output = new ImageData(width, height);
  const outputData = output.data;
  const applyGray = selectedChannels.has('gray');
  const applyR = selectedChannels.has('r');
  const applyG = selectedChannels.has('g');
  const applyB = selectedChannels.has('b');
  const applyA = selectedChannels.has('a');

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const outIndex = (y * width + x) * 4;
      const originalR = input[outIndex];
      const originalG = input[outIndex + 1];
      const originalB = input[outIndex + 2];
      const originalA = input[outIndex + 3];

      if (applyGray) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky += 1) {
          for (let kx = -1; kx <= 1; kx += 1) {
            const sample = getSampleValue(
              input,
              width,
              height,
              x + kx,
              y + ky,
              'gray',
              edgeHandling,
            );
            sum += sample * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const value = clamp8(divisor !== 0 ? Math.round(sum / divisor) : Math.round(sum));
        outputData[outIndex] = value;
        outputData[outIndex + 1] = value;
        outputData[outIndex + 2] = value;
      } else {
        outputData[outIndex] = applyR
          ? clamp8(
              divisor !== 0
                ? Math.round(
                    [
                      getSampleValue(input, width, height, x - 1, y - 1, 'r', edgeHandling),
                      getSampleValue(input, width, height, x, y - 1, 'r', edgeHandling),
                      getSampleValue(input, width, height, x + 1, y - 1, 'r', edgeHandling),
                      getSampleValue(input, width, height, x - 1, y, 'r', edgeHandling),
                      getSampleValue(input, width, height, x, y, 'r', edgeHandling),
                      getSampleValue(input, width, height, x + 1, y, 'r', edgeHandling),
                      getSampleValue(input, width, height, x - 1, y + 1, 'r', edgeHandling),
                      getSampleValue(input, width, height, x, y + 1, 'r', edgeHandling),
                      getSampleValue(input, width, height, x + 1, y + 1, 'r', edgeHandling),
                    ].reduce((acc, value, index) => acc + value * kernel[index], 0),
                    divisor,
                  )
                : 0,
            )
          : originalR;
        outputData[outIndex + 1] = applyG
          ? clamp8(
              divisor !== 0
                ? Math.round(
                    [
                      getSampleValue(input, width, height, x - 1, y - 1, 'g', edgeHandling),
                      getSampleValue(input, width, height, x, y - 1, 'g', edgeHandling),
                      getSampleValue(input, width, height, x + 1, y - 1, 'g', edgeHandling),
                      getSampleValue(input, width, height, x - 1, y, 'g', edgeHandling),
                      getSampleValue(input, width, height, x, y, 'g', edgeHandling),
                      getSampleValue(input, width, height, x + 1, y, 'g', edgeHandling),
                      getSampleValue(input, width, height, x - 1, y + 1, 'g', edgeHandling),
                      getSampleValue(input, width, height, x, y + 1, 'g', edgeHandling),
                      getSampleValue(input, width, height, x + 1, y + 1, 'g', edgeHandling),
                    ].reduce((acc, value, index) => acc + value * kernel[index], 0),
                    divisor,
                  )
                : 0,
            )
          : originalG;
        outputData[outIndex + 2] = applyB
          ? clamp8(
              divisor !== 0
                ? Math.round(
                    [
                      getSampleValue(input, width, height, x - 1, y - 1, 'b', edgeHandling),
                      getSampleValue(input, width, height, x, y - 1, 'b', edgeHandling),
                      getSampleValue(input, width, height, x + 1, y - 1, 'b', edgeHandling),
                      getSampleValue(input, width, height, x - 1, y, 'b', edgeHandling),
                      getSampleValue(input, width, height, x, y, 'b', edgeHandling),
                      getSampleValue(input, width, height, x + 1, y, 'b', edgeHandling),
                      getSampleValue(input, width, height, x - 1, y + 1, 'b', edgeHandling),
                      getSampleValue(input, width, height, x, y + 1, 'b', edgeHandling),
                      getSampleValue(input, width, height, x + 1, y + 1, 'b', edgeHandling),
                    ].reduce((acc, value, index) => acc + value * kernel[index], 0),
                    divisor,
                  )
                : 0,
            )
          : originalB;
      }

      outputData[outIndex + 3] = applyA
        ? clamp8(
            divisor !== 0
              ? Math.round(
                  [
                    getSampleValue(input, width, height, x - 1, y - 1, 'a', edgeHandling),
                    getSampleValue(input, width, height, x, y - 1, 'a', edgeHandling),
                    getSampleValue(input, width, height, x + 1, y - 1, 'a', edgeHandling),
                    getSampleValue(input, width, height, x - 1, y, 'a', edgeHandling),
                    getSampleValue(input, width, height, x, y, 'a', edgeHandling),
                    getSampleValue(input, width, height, x + 1, y, 'a', edgeHandling),
                    getSampleValue(input, width, height, x - 1, y + 1, 'a', edgeHandling),
                    getSampleValue(input, width, height, x, y + 1, 'a', edgeHandling),
                    getSampleValue(input, width, height, x + 1, y + 1, 'a', edgeHandling),
                  ].reduce((acc, value, index) => acc + value * kernel[index], 0),
                  divisor,
                )
              : 0,
          )
        : originalA;

      if (!applyGray && !applyR && !applyG && !applyB) {
        outputData[outIndex] = originalR;
        outputData[outIndex + 1] = originalG;
        outputData[outIndex + 2] = originalB;
      }

      if (!applyA) {
        outputData[outIndex + 3] = originalA;
      }
    }

    if ((y + 1) % chunkSize === 0) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
  }

  return output;
}

interface InterpolationMethod {
    interpolate(image: number[][][] | number[][], newHeight: number, newWidth: number): number[][][] | number[][];
}

class NearestNeighborInterpolation implements InterpolationMethod {
    interpolate(image: number[][][] | number[][], newHeight: number, newWidth: number): number[][][] | number[][] {
        const srcHeight = image.length;
        const srcWidth = image[0].length;
        const isColor = Array.isArray(image[0][0]);
        
        const xFactor = newWidth > 1 ? (srcWidth - 1) / (newWidth - 1) : 0;
        const yFactor = newHeight > 1 ? (srcHeight - 1) / (newHeight - 1) : 0;

        if (isColor) {
            const channels = (image as number[][][])[0][0].length;
            const result: number[][][] = Array(newHeight).fill(0).map(() => Array(newWidth).fill(0).map(() => Array(channels).fill(0)));
            
            for (let y = 0; y < newHeight; y++) {
                for (let x = 0; x < newWidth; x++) {
                    const srcX = Math.round(x * xFactor);
                    const srcY = Math.round(y * yFactor);
                    const clampedX = Math.min(Math.max(0, srcX), srcWidth - 1);
                    const clampedY = Math.min(Math.max(0, srcY), srcHeight - 1);
                    result[y][x] = [...(image as number[][][])[clampedY][clampedX]];
                }
            }
            return result;
        } else {
            const result: number[][] = Array(newHeight).fill(0).map(() => Array(newWidth).fill(0));
            
            for (let y = 0; y < newHeight; y++) {
                for (let x = 0; x < newWidth; x++) {
                    const srcX = Math.round(x * xFactor);
                    const srcY = Math.round(y * yFactor);
                    const clampedX = Math.min(Math.max(0, srcX), srcWidth - 1);
                    const clampedY = Math.min(Math.max(0, srcY), srcHeight - 1);
                    result[y][x] = (image as number[][])[clampedY][clampedX];
                }
            }
            return result;
        }
    }
}

class BilinearInterpolation implements InterpolationMethod {
    interpolate(image: number[][][] | number[][], newHeight: number, newWidth: number): number[][][] | number[][] {
        const srcHeight = image.length;
        const srcWidth = image[0].length;
        const isColor = Array.isArray(image[0][0]);
        
        const xFactor = newWidth > 1 ? (srcWidth - 1) / (newWidth - 1) : 0;
        const yFactor = newHeight > 1 ? (srcHeight - 1) / (newHeight - 1) : 0;

        if (isColor) {
            const channels = (image as number[][][])[0][0].length;
            const result: number[][][] = Array(newHeight).fill(0).map(() => Array(newWidth).fill(0).map(() => Array(channels).fill(0)));
            
            for (let y = 0; y < newHeight; y++) {
                for (let x = 0; x < newWidth; x++) {
                    const srcX = x * xFactor;
                    const srcY = y * yFactor;
                    
                    const x0 = Math.floor(srcX);
                    const x1 = Math.min(x0 + 1, srcWidth - 1);
                    const y0 = Math.floor(srcY);
                    const y1 = Math.min(y0 + 1, srcHeight - 1);
                    
                    const dx = srcX - x0;
                    const dy = srcY - y0;
                    
                    for (let c = 0; c < channels; c++) {
                        const f00 = (image as number[][][])[y0][x0][c];
                        const f01 = (image as number[][][])[y0][x1][c];
                        const f10 = (image as number[][][])[y1][x0][c];
                        const f11 = (image as number[][][])[y1][x1][c];
                        
                        const top = f00 * (1 - dx) + f01 * dx;
                        const bottom = f10 * (1 - dx) + f11 * dx;
                        const value = top * (1 - dy) + bottom * dy;
                        
                        result[y][x][c] = Math.min(255, Math.max(0, value));
                    }
                }
            }
            return result;
        } else {
            const result: number[][] = Array(newHeight).fill(0).map(() => Array(newWidth).fill(0));
            
            for (let y = 0; y < newHeight; y++) {
                for (let x = 0; x < newWidth; x++) {
                    const srcX = x * xFactor;
                    const srcY = y * yFactor;
                    
                    const x0 = Math.floor(srcX);
                    const x1 = Math.min(x0 + 1, srcWidth - 1);
                    const y0 = Math.floor(srcY);
                    const y1 = Math.min(y0 + 1, srcHeight - 1);
                    
                    const dx = srcX - x0;
                    const dy = srcY - y0;
                    
                    const f00 = (image as number[][])[y0][x0];
                    const f01 = (image as number[][])[y0][x1];
                    const f10 = (image as number[][])[y1][x0];
                    const f11 = (image as number[][])[y1][x1];
                    
                    const top = f00 * (1 - dx) + f01 * dx;
                    const bottom = f10 * (1 - dx) + f11 * dx;
                    const value = top * (1 - dy) + bottom * dy;
                    
                    result[y][x] = Math.min(255, Math.max(0, value));
                }
            }
            return result;
        }
    }
}

function imageDataToArray(imageData: ImageData): number[][][] {
    const { width, height, data } = imageData;
    const result: number[][][] = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => [0, 0, 0, 0]),
    );

    let index = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            result[y][x] = [
                data[index],
                data[index + 1],
                data[index + 2],
                data[index + 3],
            ];
            index += 4;
        }
    }

    return result;
}

function arrayToImageData(image: number[][][], width: number, height: number): ImageData {
    const imageData = new ImageData(width, height);
    const data = imageData.data;
    let index = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixel = image[y][x];
            data[index++] = Math.round(pixel[0]);
            data[index++] = Math.round(pixel[1]);
            data[index++] = Math.round(pixel[2]);
            data[index++] = Math.round(pixel[3]);
        }
    }

    return imageData;
}

function resizeImageData(
    source: ImageData,
    newWidth: number,
    newHeight: number,
    methodName: string = 'bilinear',
): ImageData {
    const width = Math.max(1, newWidth);
    const height = Math.max(1, newHeight);
    const sourceArray = imageDataToArray(source);
    const resizer = new ImageResizer();
    resizer.setMethod(methodName);
    const resizedArray = resizer.resize(sourceArray, height, width) as number[][][];
    return arrayToImageData(resizedArray, width, height);
}

class ImageResizer {
    private methods: Record<string, InterpolationMethod> = {
        'nearest': new NearestNeighborInterpolation(),
        'bilinear': new BilinearInterpolation()
    };
    private method: InterpolationMethod = this.methods['bilinear'];
    
    setMethod(methodName: string): void {
        if (!this.methods[methodName]) {
            throw new Error(`Unknown method: ${methodName}`);
        }
        this.method = this.methods[methodName];
    }
    
    setCustomMethod(method: InterpolationMethod): void {
        this.method = method;
    }
    
    resize(image: number[][][] | number[][], newHeight: number, newWidth: number): number[][][] | number[][] {
        return this.method.interpolate(image, newHeight, newWidth);
    }
    
    addMethod(name: string, method: InterpolationMethod): void {
        this.methods[name] = method;
    }
}

export type { InterpolationMethod };
export { NearestNeighborInterpolation, BilinearInterpolation, ImageResizer, resizeImageData };
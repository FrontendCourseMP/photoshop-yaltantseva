const SIGNATURE = [0x47, 0x42, 0x37, 0x1D]

export function decodeGB7(buffer: ArrayBuffer): ImageData {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)

  // Проверка сигнатуры
  for (let i = 0; i < 4; i++) {
    if (bytes[i] !== SIGNATURE[i]) {
      throw new Error("Неверная сигнатура файла — это не GB7")
    }
  }

  const version = bytes[4]
  if (version !== 0x01) {
    throw new Error(`Неподдерживаемая версия GB7: ${version}`)
  }

  const hasMask = (bytes[5] & 0x01) === 1
  const width   = view.getUint16(6, false)  // big-endian
  const height  = view.getUint16(8, false)  // big-endian

  if (bytes.length < 12 + width * height) {
    throw new Error("Файл повреждён: недостаточно данных")
  }

  const imageData = new ImageData(width, height)
  const pixels = imageData.data

  for (let i = 0; i < width * height; i++) {
    const byte = bytes[12 + i]
    // Биты 6-0: значение серого (0-127) → растягиваем до 0-255
    const gray = Math.round((byte & 0x7F) / 127 * 255)
    // Бит 7: маска (если есть)
    const alpha = hasMask ? ((byte >> 7) & 0x01 ? 255 : 0) : 255

    const idx = i * 4
    pixels[idx]     = gray
    pixels[idx + 1] = gray
    pixels[idx + 2] = gray
    pixels[idx + 3] = alpha
  }

  return imageData
}

export function encodeGB7(imageData: ImageData): Uint8Array {
  const { width, height, data } = imageData
  const buffer = new Uint8Array(12 + width * height)

  // Сигнатура
  buffer[0] = 0x47; buffer[1] = 0x42
  buffer[2] = 0x37; buffer[3] = 0x1D

  // Заголовок
  buffer[4] = 0x01  // версия
  buffer[5] = 0x00  // флаг (без маски)

  // Ширина и высота big-endian
  buffer[6] = (width >> 8) & 0xFF
  buffer[7] = width & 0xFF
  buffer[8] = (height >> 8) & 0xFF
  buffer[9] = height & 0xFF

  buffer[10] = 0x00
  buffer[11] = 0x00

  // Пиксели — RGB → оттенки серого → 7 бит
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]
    // Стандартная формула яркости
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    // Сжимаем 0-255 до 0-127 (7 бит)
    buffer[12 + i] = Math.round(gray / 255 * 127) & 0x7F
  }

  return buffer
}

export function saveAsGB7(imageData: ImageData) {
  const bytes = encodeGB7(imageData)
  const blob = new Blob([bytes], { type: "application/octet-stream" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = "image.gb7"
  a.click()
  URL.revokeObjectURL(a.href)
}
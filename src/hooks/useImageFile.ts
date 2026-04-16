import { useState, useRef } from "react"
import { loadImageFile, saveImageAs } from "@/lib/imageUtils"
import { decodeGB7, saveAsGB7 } from "@/lib/gb7"

export function useImageFile() {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const openFile = () => inputRef.current?.click()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split(".").pop()?.toLowerCase()

    try {
      if (ext === "gb7") {
        const buffer = await file.arrayBuffer()
        setImageData(decodeGB7(buffer))
      } else {
        setImageData(await loadImageFile(file))
      }
    } catch (err) {
      alert("Ошибка загрузки: " + (err as Error).message)
    }

    e.target.value = ""
  }

  const saveAs = (format: "png" | "jpg" | "gb7") => {
    if (!imageData) { alert("Нет изображения для сохранения"); return }
    if (format === "gb7") saveAsGB7(imageData)
    else saveImageAs(imageData, format)
  }

  return { imageData, openFile, handleFile, saveAs, inputRef }
}
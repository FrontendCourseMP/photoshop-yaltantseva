import { useState, useRef } from "react"
import { loadImageFile, saveImageAs } from "@/lib/imageUtils"

export function useImageFile() {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const openFile = () => inputRef.current?.click()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setImageData(await loadImageFile(file))
    } catch (err) {
      alert("Ошибка: " + (err as Error).message)
    }
    e.target.value = ""
  }

  const saveAs = (format: "png" | "jpg" | "gb7") => {
    if (!imageData) { alert("Нет изображения для сохранения"); return }
    else saveImageAs(imageData, format)
  }

  return { imageData, openFile, handleFile, saveAs, inputRef }
}
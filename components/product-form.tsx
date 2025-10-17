"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle, AlertTriangle } from "lucide-react"
import type { OrderFormData } from "@/lib/validations"
import { Input } from "@/components/ui/input"
import { useFormConfig } from "@/hooks/use-form-config"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Slider simple de imágenes para Tipo Plantilla (ratio 1.1:1)
function ProductTypeImageSlider({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  // Cross-fade
  const [currSrc, setCurrSrc] = useState<string | null>(null)
  const [prevSrc, setPrevSrc] = useState<string | null>(null)
  const [fadeOn, setFadeOn] = useState(false)
  const startXRef = useRef<number | null>(null)
  const currentXRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const safeList = useMemo(() => (images && images.length > 0 ? images : ["/Underfeet-placeholder.png", "/Underfeet-placeholder.png"]), [images])

  // Reinicia al primer slide cuando cambian las imágenes (p. ej., al cambiar de tipo de plantilla)
  useEffect(() => {
    setIndex(0)
  }, [images])

  // Inicializa la imagen actual cuando cambia el set de imágenes para evitar flashes
  useEffect(() => {
    const first = safeList[0]
    setPrevSrc(null)
    setCurrSrc(first)
    setFadeOn(false)
    const raf = requestAnimationFrame(() => setFadeOn(true))
    return () => cancelAnimationFrame(raf)
  }, [safeList])

  // Configura las capas prev/curr y dispara el cross-fade en cada cambio
  useEffect(() => {
    const next = safeList[Math.min(index, safeList.length - 1)]
    setPrevSrc((prev) => (currSrc ?? prev))
    setCurrSrc(next)
    // Reinicia y activa el fade en el próximo frame
    setFadeOn(false)
    let raf1 = 0, raf2 = 0
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setFadeOn(true))
    })
    return () => {
      if (raf1) cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [index, safeList])

  const commitSwipe = () => {
    const startX = startXRef.current
    if (startX === null) return
    const delta = currentXRef.current - startX
    const width = containerRef.current?.clientWidth || 1
    const threshold = Math.max(40, width * 0.15) // 15% del ancho o 40px
    if (delta > threshold) {
      // swipe derecha -> imagen anterior
      setIndex((i) => (i - 1 + safeList.length) % safeList.length)
    } else if (delta < -threshold) {
      // swipe izquierda -> siguiente imagen
      setIndex((i) => (i + 1) % safeList.length)
    }
    startXRef.current = null
    currentXRef.current = 0
    setDragging(false)
  }

  // Handlers touch
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startXRef.current = e.touches[0].clientX
    currentXRef.current = startXRef.current
    setDragging(true)
  }
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startXRef.current !== null) {
      currentXRef.current = e.touches[0].clientX
    }
  }
  const onTouchEnd = () => commitSwipe()

  // Handlers mouse
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startXRef.current = e.clientX
    currentXRef.current = e.clientX
    setDragging(true)
  }
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (startXRef.current !== null) {
      currentXRef.current = e.clientX
    }
  }
  const onMouseUp = () => commitSwipe()
  const onMouseLeave = () => {
    if (dragging) commitSwipe()
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[1.1/1] overflow-hidden rounded-md border bg-[#FDFDFC] dark:bg-[#F9F7FA] ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      role="region"
      aria-roledescription="carousel"
      aria-label="Imágenes del producto"
    >
      {/* Capa inferior: imagen previa */}
      {prevSrc && (
        <Image
          key={`prev-${prevSrc}`}
          src={prevSrc}
          alt={alt}
          fill
          draggable={false}
          className={`object-contain select-none transition-opacity duration-500 ease-in-out ${fadeOn ? "opacity-0" : "opacity-100"}`}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
      )}
      {/* Capa superior: imagen actual */}
      {currSrc && (
        <Image
          key={`curr-${currSrc}`}
          src={currSrc}
          alt={alt}
          fill
          draggable={false}
          className={`object-contain select-none transition-opacity duration-500 ease-in-out ${fadeOn ? "opacity-100" : "opacity-0"}`}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
      )}
      {/* Puntos (indicadores y control) */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {safeList.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir a imagen ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/50 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </div>
  )
}

// Slider de imágenes para opciones (ratio 3:4)
function ProductImageSlider({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  // Cross-fade
  const [currSrc, setCurrSrc] = useState<string | null>(null)
  const [prevSrc, setPrevSrc] = useState<string | null>(null)
  const [fadeOn, setFadeOn] = useState(false)
  const startXRef = useRef<number | null>(null)
  const currentXRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const safeList = useMemo(() => (images && images.length > 0 ? images : ["/Underfeet-placeholder.png", "/Underfeet-placeholder.png"]), [images])

  // Reinicia al primer slide cuando cambian las imágenes (p. ej., al cambiar de tipo de plantilla)
  useEffect(() => {
    setIndex(0)
  }, [images])

  // Inicializa la imagen actual cuando cambia el set de imágenes para evitar flashes
  useEffect(() => {
    const first = safeList[0]
    setPrevSrc(null)
    setCurrSrc(first)
    setFadeOn(false)
    const raf = requestAnimationFrame(() => setFadeOn(true))
    return () => cancelAnimationFrame(raf)
  }, [safeList])

  // Configura las capas prev/curr y dispara el cross-fade en cada cambio
  useEffect(() => {
    const next = safeList[Math.min(index, safeList.length - 1)]
    setPrevSrc((prev) => (currSrc ?? prev))
    setCurrSrc(next)
    // Reinicia y activa el fade en el próximo frame
    setFadeOn(false)
    let raf1 = 0, raf2 = 0
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setFadeOn(true))
    })
    return () => {
      if (raf1) cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [index, safeList])

  const commitSwipe = () => {
    const startX = startXRef.current
    if (startX === null) return
    const delta = currentXRef.current - startX
    const width = containerRef.current?.clientWidth || 1
    const threshold = Math.max(40, width * 0.15) // 15% del ancho o 40px
    if (delta > threshold) {
      // swipe derecha -> imagen anterior
      setIndex((i) => (i - 1 + safeList.length) % safeList.length)
    } else if (delta < -threshold) {
      // swipe izquierda -> siguiente imagen
      setIndex((i) => (i + 1) % safeList.length)
    }
    startXRef.current = null
    currentXRef.current = 0
    setDragging(false)
  }

  // Handlers touch
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startXRef.current = e.touches[0].clientX
    currentXRef.current = startXRef.current
    setDragging(true)
  }
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startXRef.current !== null) {
      currentXRef.current = e.touches[0].clientX
    }
  }
  const onTouchEnd = () => commitSwipe()

  // Handlers mouse
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startXRef.current = e.clientX
    currentXRef.current = e.clientX
    setDragging(true)
  }
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (startXRef.current !== null) {
      currentXRef.current = e.clientX
    }
  }
  const onMouseUp = () => commitSwipe()
  const onMouseLeave = () => {
    if (dragging) commitSwipe()
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[3/4] overflow-hidden rounded-md border bg-[#FDFDFC] dark:bg-[#F9F7FA] ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      role="region"
      aria-roledescription="carousel"
      aria-label="Imágenes del producto"
    >
      {/* Capa inferior: imagen previa */}
      {prevSrc && (
        <Image
          key={`prev-${prevSrc}`}
          src={prevSrc}
          alt={alt}
          fill
          draggable={false}
          className={`object-contain select-none transition-opacity duration-500 ease-in-out ${fadeOn ? "opacity-0" : "opacity-100"}`}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
      )}
      {/* Capa superior: imagen actual */}
      {currSrc && (
        <Image
          key={`curr-${currSrc}`}
          src={currSrc}
          alt={alt}
          fill
          draggable={false}
          className={`object-contain select-none transition-opacity duration-500 ease-in-out ${fadeOn ? "opacity-100" : "opacity-0"}`}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
      )}
      {/* Puntos (indicadores y control) */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {safeList.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir a imagen ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/50 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </div>
  )
}

interface ProductFormProps {
  form: UseFormReturn<OrderFormData>
  index: number
}

export function ProductForm({ form, index }: ProductFormProps) {
  const [loading, setLoading] = useState(true)
  const [productsColors, setProductsColors] = useState<Record<string, string[]>>({})
  const { config } = useFormConfig()

  // Listas fijas solicitadas por el cliente
  const PLANTILLA_TYPES = [
    "Every Day",
    "3/4",
    "Cross Trainer",
    "Botín",
    "Junior",
    "Plantilla 3D",
    "Mi Marca Sport",
    "Mi Marca Clásica",
    "3D",
    "Sandalia Under Feet",
    "Clásico",
    "Sport",
  ]

  // Mapeo de imágenes por tipo de plantilla (2 imágenes por producto). Fallback a placeholders.
  const PRODUCT_IMAGE_MAP: Record<string, string[]> = {
    "Every Day": ["/every-day.jpg", "/EVERY-DAY-FRENTE.jpg"],
    "3/4": ["/3-4.jpg", "/3-4-FRENTE.jpg"],
    "Cross Trainer": ["/cross.jpg", "/CROSS-TRAINER-FRENTE.jpg"],
    "Botín": ["/botin-gris.jpg", "/BOTIN-AZUL-FRENTE.jpg"],
    "Junior": ["/junior-gris.jpg", "/JUNIOR-AZUL-FRENTE.jpg"],
    "Plantilla 3D": ["/Underfeet-placeholder.png", "/Underfeet-placeholder.png"],
    "Mi Marca Sport": ["/Underfeet-placeholder.png", "/Underfeet-placeholder.png"],
    "Mi Marca Clásica": ["/Underfeet-placeholder.png", "/Underfeet-placeholder.png"],
    "3D": ["/Underfeet-placeholder.png", "/Underfeet-placeholder.png"],
    "Sandalia Under Feet": ["/Underfeet-placeholder.png", "/Underfeet-placeholder.png"],
    "Clásico": ["/Underfeet-placeholder.png", "/Underfeet-placeholder.png"],
    "Sport": ["/Underfeet-placeholder.png", "/Underfeet-placeholder.png"],
  }

  // Mapas de imágenes por opción para cada dropdown adicional
  // Pie derecho (imágenes originales)
  const FOREFOOT_IMAGE_MAP_RIGHT: Record<string, string[]> = {
    "Oliva": ["/zonas/Derecho/Oliva.png"],
    "Barra": ["/zonas/Derecho/Barra.png"],
    "Pad Running": ["/zonas/Derecho/Pad-Running.png"],
    "Pad Medialuna": ["/zonas/Derecho/Pad-Medialuna.png"],
    "Valente Valenti": ["/zonas/Derecho/Valenti-Valenti.png"],
    "Ninguno": [],
  }

  // Pie izquierdo (imágenes pre-rotadas)
  const FOREFOOT_IMAGE_MAP_LEFT: Record<string, string[]> = {
    "Oliva": ["/zonas/Izquierdo/Oliva-Izq.png"],
    "Barra": ["/zonas/Izquierdo/Barra-Izq.png"],
    "Pad Running": ["/zonas/Izquierdo/Pad-Running-Izq.png"],
    "Pad Medialuna": ["/zonas/Izquierdo/Pad-Medialuna-Izq.png"],
    "Valente Valenti": ["/zonas/Izquierdo/Valenti-Valenti-Izq.png"],
    "Ninguno": [],
  }

  // Mantener compatibilidad con código existente
  const FOREFOOT_IMAGE_MAP = FOREFOOT_IMAGE_MAP_RIGHT

  const ANTERIOR_WEDGE_IMAGE_MAP_RIGHT: Record<string, string[]> = {
    "Cuña Anterior Externa": ["/zonas/Derecho/Cuna-Anterior-Externa.png"],
    "Cuña Anterior Interna": ["/zonas/Derecho/Cuna-Anterior-Interna.png"],
    "Ninguno": [],
  }

  const ANTERIOR_WEDGE_IMAGE_MAP_LEFT: Record<string, string[]> = {
    "Cuña Anterior Externa": ["/zonas/Izquierdo/Cuna-Anterior-Externa-Izq.png"],
    "Cuña Anterior Interna": ["/zonas/Izquierdo/Cuna-Anterior-Interna-Izq.png"],
    "Ninguno": [],
  }

  const ANTERIOR_WEDGE_IMAGE_MAP = ANTERIOR_WEDGE_IMAGE_MAP_RIGHT

  const MIDFOOT_ARCH_IMAGE_MAP_RIGHT: Record<string, string[]> = {
    "Arco Flex": ["/zonas/Derecho/Arco-Flex.png"],
    "Arco Flex Reforzado": ["/zonas/Derecho/Arco-Flex.png"],
    "Arco Semiblando": ["/zonas/Derecho/Arco-Semiblando.png"],
    "Arco Semiblando Solapa": ["/zonas/Derecho/Arco-Semiblando.png"],
    "Arco Látex": ["/zonas/Derecho/Arco-Latex.png"],
    "Ninguno": [],
  }

  const MIDFOOT_ARCH_IMAGE_MAP_LEFT: Record<string, string[]> = {
    "Arco Flex": ["/zonas/Izquierdo/Arco-Flex-Izq.png"],
    "Arco Flex Reforzado": ["/zonas/Izquierdo/Arco-Flex-Izq.png"],
    "Arco Semiblando": ["/zonas/Izquierdo/Arco-Semiblando-Izq.png"],
    "Arco Semiblando Solapa": ["/zonas/Izquierdo/Arco-Semiblando-Izq.png"],
    "Arco Látex": ["/zonas/Izquierdo/Arco-Latex-Izq.png"],
    "Ninguno": [],
  }

  const MIDFOOT_ARCH_IMAGE_MAP = MIDFOOT_ARCH_IMAGE_MAP_RIGHT


  const REARFOOT_IMAGE_MAP_RIGHT: Record<string, string[]> = {
    "Botón Látex": ["/zonas/Derecho/Boton-Latex.png"],
    "Talonera Descanso Espolón": ["/zonas/Derecho/Talonera-Descanso-Espolon.png"],
    "Realce en talón": ["/zonas/Derecho/Realce-en-talon.png"],
    "Talonera Descanso Completa 5mm": ["/zonas/Derecho/Realce-en-talon.png"],
    "Talonera Descanso Completa Alta 10mm": ["/zonas/Derecho/Realce-en-talon.png"],
    "Ninguno": [],
  }

  const REARFOOT_IMAGE_MAP_LEFT: Record<string, string[]> = {
    "Botón Látex": ["/zonas/Izquierdo/Boton-Latex-Izq.png"],
    "Talonera Descanso Espolón": ["/zonas/Izquierdo/Talonera-Descanso-Espolon-Izq.png"],
    "Realce en talón": ["/zonas/Izquierdo/Realce-en-talon-Izq.png"],
    "Talonera Descanso Completa 5mm": ["/zonas/Izquierdo/Realce-en-talon-Izq.png"],
    "Talonera Descanso Completa Alta 10mm": ["/zonas/Izquierdo/Realce-en-talon-Izq.png"],
    "Ninguno": [],
  }

  const REARFOOT_IMAGE_MAP = REARFOOT_IMAGE_MAP_RIGHT

  const POSTERIOR_WEDGE_IMAGE_MAP_RIGHT: Record<string, string[]> = {
    "Cuña Posterior Externa": ["/zonas/Derecho/Cuna-Posterio-Externa.png"],
    "Cuña Posterior Interna": ["/zonas/Derecho/Cuna-Posterio-Interna.png"],
    "Ninguno": [],
  }

  const POSTERIOR_WEDGE_IMAGE_MAP_LEFT: Record<string, string[]> = {
    "Cuña Posterior Externa": ["/zonas/Izquierdo/Cuna-Posterio-Externa-Izq.png"],
    "Cuña Posterior Interna": ["/zonas/Izquierdo/Cuna-Posterio-Interna-Izq.png"],
    "Ninguno": [],
  }

  const POSTERIOR_WEDGE_IMAGE_MAP = POSTERIOR_WEDGE_IMAGE_MAP_RIGHT

  const SIZE_OPTIONS = [
    "21 (14,5 cm)",
    "22 (15 cm)",
    "23 (15,5 cm)",
    "24 (16 cm)",
    "25 (16,5 cm)",
    "26 (17 cm)",
    "27 (18 cm)",
    "28 (18,5 cm)",
    "29 (19 cm)",
    "30 (20 cm)",
    "31 (20,5 cm)",
    "32 (21 cm)",
    "33 (21,5 cm)",
    "34 (22,5 cm)",
    "34.5 (23 cm)",
    "35 (23.5 cm)",
    "36 (24 cm)",
    "36.5 (24.5cm)",
    "37 (25 cm)",
    "38 (25.5 cm)",
    "39 (26 cm)",
    "39.5 (26.5 cm)",
    "40 (27 cm)",
    "41 (27.5 cm)",
    "42 (28 cm)",
    "43 (28.5 cm)",
    "44 (29 cm)",
    "44.5 (29.5 cm)",
    "45 (30 cm)",
    "46 (30.5 cm)",
    "47 (31 cm)",
    "48 (31.5 cm)",
  ]

  const FOREFOOT_OPTIONS = ["Oliva", "Barra", "Pad Running", "Pad Medialuna", "Valente Valenti", "Ninguno"]
  const ANTERIOR_WEDGE_OPTIONS = ["Cuña Anterior Externa", "Cuña Anterior Interna", "Ninguno"]
  const ANTERIOR_WEDGE_MM_OPTIONS = ["2mm", "3mm"]
  const MIDFOOT_ARCH_OPTIONS = ["Arco Flex", "Arco Flex Reforzado", "Arco Semiblando", "Arco Semiblando Solapa", "Arco Látex", "Ninguno"]
  const REARFOOT_OPTIONS = [
    "Botón Látex",
    "Talonera Descanso Espolón",
    "Realce en talón",
    "Talonera Descanso Completa 5mm",
    "Talonera Descanso Completa Alta 10mm",
    "Ninguno",
  ]
  const HEEL_RAISE_MM_OPTIONS = ["3mm", "5mm", "6mm", "8mm", "9mm", "10mm"]

  // Guía de talles (extraída de talles.jpg)
  const SIZE_GUIDE = {
    men: [
      { us: "4", arg: "35,5", cm: "22" },
      { us: "4,5", arg: "36", cm: "22,5" },
      { us: "5", arg: "36,5", cm: "23" },
      { us: "5,5", arg: "37", cm: "23,5" },
      { us: "6", arg: "37,5", cm: "24" },
      { us: "6,5", arg: "38", cm: "24,5" },
      { us: "7", arg: "39", cm: "25" },
      { us: "7,5", arg: "39,5", cm: "25,5" },
      { us: "8", arg: "40", cm: "26" },
      { us: "8,5", arg: "41", cm: "26,5" },
      { us: "9", arg: "42", cm: "27" },
      { us: "9,5", arg: "42,5", cm: "27,5" },
      { us: "10", arg: "43", cm: "28" },
      { us: "10,5", arg: "43,5", cm: "28,5" },
      { us: "11", arg: "44", cm: "29" },
      { us: "11,5", arg: "44,5", cm: "29,5" },
      { us: "12", arg: "45", cm: "30" },
      { us: "12,5", arg: "45,5", cm: "30,5" },
      { us: "13", arg: "47", cm: "31" },
      { us: "13,5", arg: "48", cm: "31,5" },
    ],
    women: [
      { us: "4,5", arg: "35", cm: "21,5" },
      { us: "5", arg: "35,5", cm: "22" },
      { us: "5,5", arg: "36", cm: "22,5" },
      { us: "6", arg: "36,5", cm: "23" },
      { us: "6,5", arg: "37,5", cm: "23,5" },
      { us: "7", arg: "38", cm: "24" },
      { us: "7,5", arg: "38,5", cm: "24,5" },
      { us: "8", arg: "39", cm: "25" },
      { us: "8,5", arg: "39,5", cm: "25,5" },
      { us: "9", arg: "40", cm: "26" },
      { us: "9,5", arg: "40,5", cm: "26,5" },
      { us: "10", arg: "41", cm: "27" },
    ],
    kids: [
      { us: "8,5C", arg: "25", cm: "14,5" },
      { us: "9C", arg: "25,5", cm: "15" },
      { us: "9,5C", arg: "26", cm: "15,5" },
      { us: "10C", arg: "27", cm: "16" },
      { us: "10,5C", arg: "27,5", cm: "16,5" },
      { us: "11C", arg: "28", cm: "17" },
      { us: "11,5C", arg: "28,5", cm: "17,5" },
      { us: "12C", arg: "29", cm: "18" },
      { us: "12,5C", arg: "29,5", cm: "18,5" },
      { us: "13C", arg: "30", cm: "19" },
      { us: "13,5C", arg: "30,5", cm: "19,5" },
      { us: "1Y", arg: "31", cm: "20" },
      { us: "1,5Y", arg: "32", cm: "20,5" },
      { us: "2Y", arg: "32,5", cm: "21" },
      { us: "2,5Y", arg: "33", cm: "21,5" },
      { us: "3Y", arg: "34", cm: "22" },
      { us: "3,5Y", arg: "34,5", cm: "22,5" },
    ],
  } as const

  useEffect(() => {
    const init = async () => {
      try {
        // Cargar mapeo de colores por producto
        const res = await fetch("/api/products-colors", { cache: "no-store" })
        const json = await res.json().catch(() => null)
        if (json?.success && json?.data) setProductsColors(json.data)
      } catch (e) {
        console.warn("No se pudo cargar products-colors:", e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])


  const rearfootValue = form.watch(`products.${index}.rearfoot_calcaneus` as const)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name={`products.${index}.patient_name` as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Paciente *</FormLabel>
            <FormControl>
              <Input placeholder="Ingrese el nombre del paciente" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`products.${index}.patient_lastname` as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Apellido del Paciente *</FormLabel>
            <FormControl>
              <Input placeholder="Ingrese el apellido del paciente" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Fila 2: Tipo, Talle, Color + Imagen del producto */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Columna izquierda: Tipo, (imagen en mobile), Talle, Color */}
        <div className="grid grid-cols-1 gap-4">
          {/* Tipo Plantilla */}
          <FormField
            control={form.control}
            name={`products.${index}.product_type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-1 min-h-[24px] flex items-center">
                  <div className="flex items-center gap-2">
                    <span>Tipo Plantilla *</span>
                    <a
                      href="https://drive.google.com/file/d/1AAmSwqDUS102aXO32qNgTPaEDtwhdMZi/view"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                      title="Ver Zonas del Pie"
                    >
                      <HelpCircle className="h-4 w-4" /> <span className="ml-1"> Zonas del Pie</span>
                    </a>
                  </div>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo"/>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PLANTILLA_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Imagen debajo de Tipo en pantallas chicas */}
          {(() => {
            const selectedType = form.watch(`products.${index}.product_type` as const) as string
            const images = PRODUCT_IMAGE_MAP[selectedType] || []
            const alt = selectedType ? `Imagen de ${selectedType}` : "Imagen de producto"
            return (
              <div className="block md:hidden">
                <ProductTypeImageSlider images={images} alt={alt} />
              </div>
            )
          })()}

          {/* Talle */}
          {config.productFields.template_size !== false && (
            <FormField
              control={form.control}
              name={`products.${index}.template_size` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-1 min-h-[24px] flex items-center">
                    <span>{config.productLabels?.template_size || "Selección de talle"}</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar talle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SIZE_OPTIONS.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Los cm son el largo total de la plantilla a fabricar</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Color condicional por producto */}
          {config.productFields.template_color !== false && (
            <FormField
              control={form.control}
              name={`products.${index}.template_color` as any}
              render={({ field }) => {
                const selectedType = form.watch(`products.${index}.product_type` as const) as string
                const colors = (productsColors?.[selectedType] || []) as string[]
                
                // Auto-seleccionar Habano para Mi Marca Sport y Mi Marca Clásica
                const autoSelectTypes = ["Mi Marca Sport", "Mi Marca Clásica"]
                if (autoSelectTypes.includes(selectedType) && field.value !== "Habano") {
                  field.onChange("Habano")
                }
                
                // Mostrar dropdown solo si hay más de 1 color
                const show = Array.isArray(colors) && colors.length > 1
                const hasColors = Array.isArray(colors) && colors.length > 0
                
                return (
                  <FormItem>
                    <FormLabel className="mb-1 min-h-[24px] flex items-center">{config.productLabels?.template_color || "Color"}</FormLabel>
                    {show ? (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colors.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : hasColors && colors.length === 1 ? (
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {colors[0]}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Este producto no posee variantes de color</div>
                    )}
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          )}
        </div>

        {/* Columna derecha: Imagen fija en desktop */}
        {(() => {
          const selectedType = form.watch(`products.${index}.product_type` as const) as string
          const images = PRODUCT_IMAGE_MAP[selectedType] || []
          const alt = selectedType ? `Imagen de ${selectedType}` : "Imagen de producto"
          return (
            <div className="hidden md:block">
              <ProductTypeImageSlider images={images} alt={alt} />
            </div>
          )
        })()}
      </div>

      {/* Separador  antes de Antepié */}
      <div className="md:col-span-2 h-px bg-gray-100 dark:bg-gray-700 my-2" />

      {/* Antepié - Zona metatarsal */}
      {config.productFields.forefoot_metatarsal !== false && (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="space-y-2">
            {/* Título de sección */}
            <div className="mb-2">
              <h5 className="text-sm font-bold text-gray-600 dark:text-gray-300">{config.productLabels?.forefoot_metatarsal || "Antepié — Zona metatarsal"}</h5>
            </div>
            
            {/* Dropdown para pie izquierdo */}
            <FormField
              control={form.control}
              name={`products.${index}.forefoot_metatarsal_left` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[0.75rem] text-blue-600 font-semibold">Pie Izquierdo</FormLabel>
                  <Select 
                    onValueChange={(val) => {
                      field.onChange(val)
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar"/>
                      </SelectTrigger>  
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Igual a Pie Derecho" className="text-green-600 font-semibold">
                        → Igual a Pie Derecho
                      </SelectItem>
                      {FOREFOOT_OPTIONS.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Dropdown para pie derecho */}
            <FormField
              control={form.control}
              name={`products.${index}.forefoot_metatarsal` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[0.75rem] text-green-600 font-semibold">Pie Derecho</FormLabel>
                  <Select 
                    onValueChange={(val) => {
                      field.onChange(val)
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar"/>
                      </SelectTrigger>  
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Igual a Pie Izquierdo" className="text-blue-600 font-semibold">
                        ← Igual a Pie Izquierdo
                      </SelectItem>
                      {FOREFOOT_OPTIONS.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Alerta de validación para Antepié - Zona metatarsal */}
            {(() => {
              const selectedRight = form.watch(`products.${index}.forefoot_metatarsal` as const) as string
              const selectedLeft = form.watch(`products.${index}.forefoot_metatarsal_left` as const) as string
              const bothEqual = selectedRight === "Igual a Pie Izquierdo" && selectedLeft === "Igual a Pie Derecho"
              
              if (bothEqual) {
                return (
                  <Alert variant="warning" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No puede seleccionar "Igual al pie derecho" e "Igual al pie izquierdo" en ambos pies. Debe elegir una opción específica en al menos uno de los pies.
                    </AlertDescription>
                  </Alert>
                )
              }
              return null
            })()}
            
            {/* Sliders móviles debajo de los campos */}
            {(() => {
              const selectedRight = form.watch(`products.${index}.forefoot_metatarsal` as const) as string
              const selectedLeft = form.watch(`products.${index}.forefoot_metatarsal_left` as const) as string
              const imagesRight = FOREFOOT_IMAGE_MAP_RIGHT[selectedRight] || []
              const imagesLeft = FOREFOOT_IMAGE_MAP_LEFT[selectedLeft] || []
              const altRight = selectedRight ? `Imagen ${selectedRight} (Derecho)` : "Imagen Antepié Derecho"
              const altLeft = selectedLeft ? `Imagen ${selectedLeft} (Izquierdo)` : "Imagen Antepié Izquierdo"
              
              return (
                <div className="md:hidden mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-blue-600 mb-1 font-semibold">Pie Izquierdo</p>
                    <ProductImageSlider images={imagesLeft} alt={altLeft} />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1 font-semibold">Pie Derecho</p>
                    <ProductImageSlider images={imagesRight} alt={altRight} />
                  </div>
                </div>
              )
            })()}
          </div>
          
          {/* Sliders a la derecha en desktop - divididos en dos columnas */}
          {(() => {
            const selectedRight = form.watch(`products.${index}.forefoot_metatarsal` as const) as string
            const selectedLeft = form.watch(`products.${index}.forefoot_metatarsal_left` as const) as string
            const imagesRight = FOREFOOT_IMAGE_MAP_RIGHT[selectedRight] || []
            const imagesLeft = FOREFOOT_IMAGE_MAP_LEFT[selectedLeft] || []
            const altRight = selectedRight ? `Imagen ${selectedRight} (Derecho)` : "Imagen Antepié Derecho"
            const altLeft = selectedLeft ? `Imagen ${selectedLeft} (Izquierdo)` : "Imagen Antepié Izquierdo"
            
            return (
              <div className="hidden md:grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-blue-600 mb-1 font-semibold text-center">Pie Izquierdo</p>
                  <ProductImageSlider images={imagesLeft} alt={altLeft} />
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-1 font-semibold text-center">Pie Derecho</p>
                  <ProductImageSlider images={imagesRight} alt={altRight} />
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Separador antes de Cuña Anterior */}
      <div className="md:col-span-2 h-px bg-gray-100 dark:bg-gray-700 my-2"></div>

      {/* Cuña Anterior */}
      {config.productFields.anterior_wedge !== false && (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="space-y-2">
            {/* Título de sección */}
            <div className="mb-2">
              <h5 className="text-sm font-bold text-gray-600 dark:text-gray-300">{config.productLabels?.anterior_wedge || "Cuña anterior"}</h5>
            </div>
            
            {/* Dropdown para pie izquierdo */}
            <FormField
              control={form.control}
              name={`products.${index}.anterior_wedge_left` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[0.75rem] text-blue-600 font-semibold">Pie Izquierdo</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val)
                      if (val === "Igual a Pie Derecho") {
                        const rightMm = form.watch(`products.${index}.anterior_wedge_mm` as const)
                        if (rightMm) {
                          form.setValue(`products.${index}.anterior_wedge_left_mm` as any, rightMm)
                        }
                      } else if (val !== "Cuña Anterior Interna") {
                        form.setValue(`products.${index}.anterior_wedge_left_mm` as any, "")
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Igual a Pie Derecho" className="text-green-600 font-semibold">
                        → Igual a Pie Derecho
                      </SelectItem>
                      {ANTERIOR_WEDGE_OPTIONS.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Espesor (solo si Interna) - PIE IZQUIERDO */}
                  {(() => {
                    const wedgeLeft = form.watch(`products.${index}.anterior_wedge_left` as const) as string
                    if (wedgeLeft === "Cuña Anterior Interna") {
                      return (
                        <FormField
                          control={form.control}
                          name={`products.${index}.anterior_wedge_left_mm` as any}
                          render={({ field: mmField }) => (
                            <FormItem className="mt-2">
                              <FormLabel className="text-xs font-semibold text-blue-600">Espesor - Pie Izquierdo</FormLabel>
                              <Select onValueChange={mmField.onChange} value={mmField.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="border-blue-300">
                                    <SelectValue placeholder="Seleccionar espesor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ANTERIOR_WEDGE_MM_OPTIONS.map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )
                    }
                    return null
                  })()}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Dropdown para pie derecho */}
            <FormField
              control={form.control}
              name={`products.${index}.anterior_wedge` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[0.75rem] text-green-600 font-semibold">Pie Derecho</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val)
                      if (val === "Igual a Pie Izquierdo") {
                        const leftMm = form.watch(`products.${index}.anterior_wedge_left_mm` as const)
                        if (leftMm) {
                          form.setValue(`products.${index}.anterior_wedge_mm` as any, leftMm)
                        }
                      } else if (val !== "Cuña Anterior Interna") {
                        form.setValue(`products.${index}.anterior_wedge_mm` as any, "")
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Igual a Pie Izquierdo" className="text-blue-600 font-semibold">
                        ← Igual a Pie Izquierdo
                      </SelectItem>
                      {ANTERIOR_WEDGE_OPTIONS.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Espesor (solo si Interna) - PIE DERECHO */}
                  {(() => {
                    const wedge = form.watch(`products.${index}.anterior_wedge` as const) as string
                    if (wedge === "Cuña Anterior Interna") {
                      return (
                        <FormField
                          control={form.control}
                          name={`products.${index}.anterior_wedge_mm` as any}
                          render={({ field: mmField }) => (
                            <FormItem className="mt-2">
                              <FormLabel className="text-xs font-semibold text-green-600">Espesor - Pie Derecho</FormLabel>
                              <Select onValueChange={mmField.onChange} value={mmField.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="border-green-300">
                                    <SelectValue placeholder="Seleccionar espesor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ANTERIOR_WEDGE_MM_OPTIONS.map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )
                    }
                    return null
                  })()}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Alerta de validación para Cuña Anterior */}
            {(() => {
              const selectedRight = form.watch(`products.${index}.anterior_wedge` as const) as string
              const selectedLeft = form.watch(`products.${index}.anterior_wedge_left` as const) as string
              const bothEqual = selectedRight === "Igual a Pie Izquierdo" && selectedLeft === "Igual a Pie Derecho"
              
              if (bothEqual) {
                return (
                  <Alert variant="warning" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No puede seleccionar "Igual al pie derecho" e "Igual al pie izquierdo" en ambos pies. Debe elegir una opción específica en al menos uno de los pies.
                    </AlertDescription>
                  </Alert>
                )
              }
              return null
            })()}
            
            {/* Sliders móviles debajo de los campos */}
            {(() => {
              const selectedRight = form.watch(`products.${index}.anterior_wedge` as const) as string
              const selectedLeft = form.watch(`products.${index}.anterior_wedge_left` as const) as string
              const imagesRight = ANTERIOR_WEDGE_IMAGE_MAP_RIGHT[selectedRight] || []
              const imagesLeft = ANTERIOR_WEDGE_IMAGE_MAP_LEFT[selectedLeft] || []
              const altRight = selectedRight ? `Imagen ${selectedRight} (Derecho)` : "Imagen Cuña Anterior Derecho"
              const altLeft = selectedLeft ? `Imagen ${selectedLeft} (Izquierdo)` : "Imagen Cuña Anterior Izquierdo"
              
              return (
                <div className="md:hidden mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-blue-600 mb-1 font-semibold">Pie Izquierdo</p>
                    <ProductImageSlider images={imagesLeft} alt={altLeft} />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1 font-semibold">Pie Derecho</p>
                    <ProductImageSlider images={imagesRight} alt={altRight} />
                  </div>
                </div>
              )
            })()}
          </div>
          
          {/* Sliders a la derecha en desktop - divididos en dos columnas */}
          {(() => {
            const selectedRight = form.watch(`products.${index}.anterior_wedge` as const) as string
            const selectedLeft = form.watch(`products.${index}.anterior_wedge_left` as const) as string
            const imagesRight = ANTERIOR_WEDGE_IMAGE_MAP_RIGHT[selectedRight] || []
            const imagesLeft = ANTERIOR_WEDGE_IMAGE_MAP_LEFT[selectedLeft] || []
            const altRight = selectedRight ? `Imagen ${selectedRight} (Derecho)` : "Imagen Cuña Anterior Derecho"
            const altLeft = selectedLeft ? `Imagen ${selectedLeft} (Izquierdo)` : "Imagen Cuña Anterior Izquierdo"
            
            return (
              <div className="hidden md:grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-blue-600 mb-1 font-semibold text-center">Pie Izquierdo</p>
                  <ProductImageSlider images={imagesLeft} alt={altLeft} />
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-1 font-semibold text-center">Pie Derecho</p>
                  <ProductImageSlider images={imagesRight} alt={altRight} />
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Separador antes de Mediopié - Zona arco */}
      <div className="md:col-span-2 h-px bg-gray-100 dark:bg-gray-700 my-2"></div>

      {/* Mediopié - Zona arco */}
      {config.productFields.midfoot_arch !== false && (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="space-y-2">
            {/* Título de sección */}
            <div className="mb-2">
              <h5 className="text-sm font-bold text-gray-600 dark:text-gray-300">Mediopié - Zona del arco</h5>
            </div>
            
            {/* Dropdown para pie izquierdo */}
            <FormField
              control={form.control}
              name={`products.${index}.midfoot_arch_left` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[0.75rem] text-blue-600 font-semibold">Pie Izquierdo</FormLabel>
                  <Select 
                    onValueChange={(val) => {
                      field.onChange(val)
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Igual a Pie Derecho" className="text-green-600 font-semibold">
                        → Igual a Pie Derecho
                      </SelectItem>
                      {MIDFOOT_ARCH_OPTIONS.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Dropdown para pie derecho */}
            <FormField
              control={form.control}
              name={`products.${index}.midfoot_arch` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[0.75rem] text-green-600 font-semibold">Pie Derecho</FormLabel>
                  <Select 
                    onValueChange={(val) => {
                      field.onChange(val)
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Igual a Pie Izquierdo" className="text-blue-600 font-semibold">
                        ← Igual a Pie Izquierdo
                      </SelectItem>
                      {MIDFOOT_ARCH_OPTIONS.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Alerta de validación para Mediopié - Zona arco */}
            {(() => {
              const selectedRight = form.watch(`products.${index}.midfoot_arch` as const) as string
              const selectedLeft = form.watch(`products.${index}.midfoot_arch_left` as const) as string
              const bothEqual = selectedRight === "Igual a Pie Izquierdo" && selectedLeft === "Igual a Pie Derecho"
              
              if (bothEqual) {
                return (
                  <Alert variant="warning" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No puede seleccionar "Igual al pie derecho" e "Igual al pie izquierdo" en ambos pies. Debe elegir una opción específica en al menos uno de los pies.
                    </AlertDescription>
                  </Alert>
                )
              }
              return null
            })()}
            
            {/* Sliders móviles debajo de los campos */}
            {(() => {
              const selectedRight = form.watch(`products.${index}.midfoot_arch` as const) as string
              const selectedLeft = form.watch(`products.${index}.midfoot_arch_left` as const) as string
              const imagesRight = MIDFOOT_ARCH_IMAGE_MAP_RIGHT[selectedRight] || []
              const imagesLeft = MIDFOOT_ARCH_IMAGE_MAP_LEFT[selectedLeft] || []
              const altRight = selectedRight ? `Imagen ${selectedRight} (Derecho)` : "Imagen Mediopié Derecho"
              const altLeft = selectedLeft ? `Imagen ${selectedLeft} (Izquierdo)` : "Imagen Mediopié Izquierdo"
              
              return (
                <div className="md:hidden mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-blue-600 mb-1 font-semibold">Pie Izquierdo</p>
                    <ProductImageSlider images={imagesLeft} alt={altLeft} />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1 font-semibold">Pie Derecho</p>
                    <ProductImageSlider images={imagesRight} alt={altRight} />
                  </div>
                </div>
              )
            })()}
          </div>
          
          {/* Sliders a la derecha en desktop - divididos en dos columnas */}
          {(() => {
            const selectedRight = form.watch(`products.${index}.midfoot_arch` as const) as string
            const selectedLeft = form.watch(`products.${index}.midfoot_arch_left` as const) as string
            const imagesRight = MIDFOOT_ARCH_IMAGE_MAP_RIGHT[selectedRight] || []
            const imagesLeft = MIDFOOT_ARCH_IMAGE_MAP_LEFT[selectedLeft] || []
            const altRight = selectedRight ? `Imagen ${selectedRight} (Derecho)` : "Imagen Mediopié Derecho"
            const altLeft = selectedLeft ? `Imagen ${selectedLeft} (Izquierdo)` : "Imagen Mediopié Izquierdo"
            
            return (
              <div className="hidden md:grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-blue-600 mb-1 font-semibold text-center">Pie Izquierdo</p>
                  <ProductImageSlider images={imagesLeft} alt={altLeft} />
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-1 font-semibold text-center">Pie Derecho</p>
                  <ProductImageSlider images={imagesRight} alt={altRight} />
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Separador antes de Retropié - Zona calcáneo */}
      <div className="md:col-span-2 h-px bg-gray-100 dark:bg-gray-700 my-2"></div>

      {/* Retropié - Zona calcáneo */}
      {config.productFields.rearfoot_calcaneus !== false && (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="space-y-2">
            {/* Título de sección */}
            <div className="mb-2">
              <h5 className="text-sm font-bold text-gray-600 dark:text-gray-300">{config.productLabels?.rearfoot_calcaneus || "Retropié — Zona del calcáneo"}</h5>
            </div>
            
            {/* Dropdown para pie izquierdo */}
            <FormField
              control={form.control}
              name={`products.${index}.rearfoot_calcaneus_left` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[0.75rem] text-blue-600 font-semibold">Pie Izquierdo</FormLabel>
                  <Select 
                    onValueChange={(val) => {
                      field.onChange(val)
                      if (val === "Igual a Pie Derecho") {
                        const rightMm = form.watch(`products.${index}.heel_raise_mm` as const)
                        if (rightMm) {
                          form.setValue(`products.${index}.heel_raise_left_mm` as any, rightMm)
                        }
                      }
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Igual a Pie Derecho" className="text-green-600 font-semibold">
                        → Igual a Pie Derecho
                      </SelectItem>
                      {REARFOOT_OPTIONS.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Detalle de milímetros para Realce en talón - PIE IZQUIERDO */}
                  {(() => {
                    const rearfootLeft = form.watch(`products.${index}.rearfoot_calcaneus_left` as const) as string
                    if (config.productFields.heel_raise_mm !== false && rearfootLeft === "Realce en talón") {
                      return (
                        <FormField
                          control={form.control}
                          name={`products.${index}.heel_raise_left_mm` as any}
                          render={({ field: mmField }) => (
                            <FormItem className="mt-2">
                              <FormLabel className="text-xs font-semibold text-blue-600">Realce en talón - Pie Izquierdo (mm)</FormLabel>
                              <Select onValueChange={mmField.onChange} value={mmField.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="border-blue-300">
                                    <SelectValue placeholder="Seleccione milímetros" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {HEEL_RAISE_MM_OPTIONS.map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )
                    }
                    return null
                  })()}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Dropdown para pie derecho */}
            <FormField
              control={form.control}
              name={`products.${index}.rearfoot_calcaneus` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[0.75rem] text-green-600 font-semibold">Pie Derecho</FormLabel>
                  <Select 
                    onValueChange={(val) => {
                      field.onChange(val)
                      if (val === "Igual a Pie Izquierdo") {
                        const leftMm = form.watch(`products.${index}.heel_raise_left_mm` as const)
                        if (leftMm) {
                          form.setValue(`products.${index}.heel_raise_mm` as any, leftMm)
                        }
                      }
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Igual a Pie Izquierdo" className="text-blue-600 font-semibold">
                        ← Igual a Pie Izquierdo
                      </SelectItem>
                      {REARFOOT_OPTIONS.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Detalle de milímetros para Realce en talón - PIE DERECHO */}
                  {(() => {
                    const rearfootRight = form.watch(`products.${index}.rearfoot_calcaneus` as const) as string
                    if (config.productFields.heel_raise_mm !== false && rearfootRight === "Realce en talón") {
                      return (
                        <FormField
                          control={form.control}
                          name={`products.${index}.heel_raise_mm` as any}
                          render={({ field: mmField }) => (
                            <FormItem className="mt-2">
                              <FormLabel className="text-xs font-semibold text-green-600">Realce en talón - Pie Derecho (mm)</FormLabel>
                              <Select onValueChange={mmField.onChange} value={mmField.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="border-green-300">
                                    <SelectValue placeholder="Seleccione milímetros" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {HEEL_RAISE_MM_OPTIONS.map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )
                    }
                    return null
                  })()}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Alerta de validación para Retropié - Zona calcáneo */}
            {(() => {
              const selectedRight = form.watch(`products.${index}.rearfoot_calcaneus` as const) as string
              const selectedLeft = form.watch(`products.${index}.rearfoot_calcaneus_left` as const) as string
              const bothEqual = selectedRight === "Igual a Pie Izquierdo" && selectedLeft === "Igual a Pie Derecho"
              
              if (bothEqual) {
                return (
                  <Alert variant="warning" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No puede seleccionar "Igual al pie derecho" e "Igual al pie izquierdo" en ambos pies. Debe elegir una opción específica en al menos uno de los pies.
                    </AlertDescription>
                  </Alert>
                )
              }
              return null
            })()}
            
            {/* Sliders móviles debajo de los campos */}
            {(() => {
              const selectedRight = form.watch(`products.${index}.rearfoot_calcaneus` as const) as string
              const selectedLeft = form.watch(`products.${index}.rearfoot_calcaneus_left` as const) as string
              const imagesRight = REARFOOT_IMAGE_MAP_RIGHT[selectedRight] || []
              const imagesLeft = REARFOOT_IMAGE_MAP_LEFT[selectedLeft] || []
              const altRight = selectedRight ? `Imagen ${selectedRight} (Derecho)` : "Imagen Retropié Derecho"
              const altLeft = selectedLeft ? `Imagen ${selectedLeft} (Izquierdo)` : "Imagen Retropié Izquierdo"
              
              return (
                <div className="md:hidden mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-blue-600 mb-1 font-semibold">Pie Izquierdo</p>
                    <ProductImageSlider images={imagesLeft} alt={altLeft} />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1 font-semibold">Pie Derecho</p>
                    <ProductImageSlider images={imagesRight} alt={altRight} />
                  </div>
                </div>
              )
            })()}
          </div>
          
          {/* Sliders a la derecha en desktop - divididos en dos columnas */}
          {(() => {
            const selectedRight = form.watch(`products.${index}.rearfoot_calcaneus` as const) as string
            const selectedLeft = form.watch(`products.${index}.rearfoot_calcaneus_left` as const) as string
            const imagesRight = REARFOOT_IMAGE_MAP_RIGHT[selectedRight] || []
            const imagesLeft = REARFOOT_IMAGE_MAP_LEFT[selectedLeft] || []
            const altRight = selectedRight ? `Imagen ${selectedRight} (Derecho)` : "Imagen Retropié Derecho"
            const altLeft = selectedLeft ? `Imagen ${selectedLeft} (Izquierdo)` : "Imagen Retropié Izquierdo"
            
            return (
              <div className="hidden md:grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-blue-600 mb-1 font-semibold text-center">Pie Izquierdo</p>
                  <ProductImageSlider images={imagesLeft} alt={altLeft} />
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-1 font-semibold text-center">Pie Derecho</p>
                  <ProductImageSlider images={imagesRight} alt={altRight} />
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Separador antes de Cuña Posterior */}
      <div className="md:col-span-2 h-px bg-gray-100 dark:bg-gray-700 my-2"></div>

      {/* Cuña Posterior */}
      {config.productFields.posterior_wedge !== false && (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="space-y-2">
            {/* Título de sección */}
            <div className="mb-2">
              <h5 className="text-sm font-bold text-gray-600 dark:text-gray-300">{config.productLabels?.posterior_wedge || "Cuña posterior"}</h5>
            </div>
            
            {/* Dropdown para pie izquierdo */}
            <FormField
              control={form.control}
              name={`products.${index}.posterior_wedge_left` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[0.75rem] text-blue-600 font-semibold">Pie Izquierdo</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val)
                      if (val === "Igual a Pie Derecho") {
                        const rightMm = form.watch(`products.${index}.posterior_wedge_mm` as const)
                        if (rightMm) {
                          form.setValue(`products.${index}.posterior_wedge_left_mm` as any, rightMm)
                        }
                      } else if (val !== "Cuña Posterior Externa" && val !== "Cuña Posterior Interna") {
                        // limpiar espesor al cambiar opción
                        form.setValue(`products.${index}.posterior_wedge_left_mm` as any, "")
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Igual a Pie Derecho" className="text-green-600 font-semibold">
                        → Igual a Pie Derecho
                      </SelectItem>
                      <SelectItem value="Cuña Posterior Externa">Cuña Posterior Externa</SelectItem>
                      <SelectItem value="Cuña Posterior Interna">Cuña Posterior Interna</SelectItem>
                      <SelectItem value="Ninguno">Ninguno</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Espesor para cuña posterior - PIE IZQUIERDO */}
                  {(() => {
                    const wedgeLeft = form.watch(`products.${index}.posterior_wedge_left` as const) as string
                    if (wedgeLeft === "Cuña Posterior Externa" || wedgeLeft === "Cuña Posterior Interna") {
                      return (
                        <FormField
                          control={form.control}
                          name={`products.${index}.posterior_wedge_left_mm` as any}
                          render={({ field: mmField }) => (
                            <FormItem className="mt-2">
                              <FormLabel className="text-xs font-semibold text-blue-600">Espesor - Pie Izquierdo</FormLabel>
                              <Select onValueChange={mmField.onChange} value={mmField.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="border-blue-300">
                                    <SelectValue placeholder="Seleccionar espesor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["2mm", "3mm", "5mm"].map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )
                    }
                    return null
                  })()}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Dropdown para pie derecho */}
            <FormField
              control={form.control}
              name={`products.${index}.posterior_wedge`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[0.75rem] text-green-600 font-semibold">Pie Derecho</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val)
                      if (val === "Igual a Pie Izquierdo") {
                        const leftMm = form.watch(`products.${index}.posterior_wedge_left_mm` as const)
                        if (leftMm) {
                          form.setValue(`products.${index}.posterior_wedge_mm` as any, leftMm)
                        }
                      } else if (val !== "Cuña Posterior Externa" && val !== "Cuña Posterior Interna") {
                        // limpiar espesor al cambiar opción
                        form.setValue(`products.${index}.posterior_wedge_mm` as any, "")
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Igual a Pie Izquierdo" className="text-blue-600 font-semibold">
                        ← Igual a Pie Izquierdo
                      </SelectItem>
                      <SelectItem value="Cuña Posterior Externa">Cuña Posterior Externa</SelectItem>
                      <SelectItem value="Cuña Posterior Interna">Cuña Posterior Interna</SelectItem>
                      <SelectItem value="Ninguno">Ninguno</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Espesor para cuña posterior - PIE DERECHO */}
                  {(() => {
                    const wedge = form.watch(`products.${index}.posterior_wedge` as const) as string
                    if (wedge === "Cuña Posterior Externa" || wedge === "Cuña Posterior Interna") {
                      return (
                        <FormField
                          control={form.control}
                          name={`products.${index}.posterior_wedge_mm` as any}
                          render={({ field: mmField }) => (
                            <FormItem className="mt-2">
                              <FormLabel className="text-xs font-semibold text-green-600">Espesor - Pie Derecho</FormLabel>
                              <Select onValueChange={mmField.onChange} value={mmField.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="border-green-300">
                                    <SelectValue placeholder="Seleccionar espesor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["2mm", "3mm", "5mm"].map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )
                    }
                    return null
                  })()}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Alerta de validación para Cuña Posterior */}
            {(() => {
              const selectedRight = form.watch(`products.${index}.posterior_wedge` as const) as string
              const selectedLeft = form.watch(`products.${index}.posterior_wedge_left` as const) as string
              const bothEqual = selectedRight === "Igual a Pie Izquierdo" && selectedLeft === "Igual a Pie Derecho"
              
              if (bothEqual) {
                return (
                  <Alert variant="warning" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No puede seleccionar "Igual al pie derecho" e "Igual al pie izquierdo" en ambos pies. Debe elegir una opción específica en al menos uno de los pies.
                    </AlertDescription>
                  </Alert>
                )
              }
              return null
            })()}
            
            {/* Sliders móviles debajo de los campos */}
            {(() => {
              const selectedRight = form.watch(`products.${index}.posterior_wedge` as const) as string
              const selectedLeft = form.watch(`products.${index}.posterior_wedge_left` as const) as string
              const imagesRight = POSTERIOR_WEDGE_IMAGE_MAP_RIGHT[selectedRight] || []
              const imagesLeft = POSTERIOR_WEDGE_IMAGE_MAP_LEFT[selectedLeft] || []
              const altRight = selectedRight ? `Imagen ${selectedRight} (Derecho)` : "Imagen Cuña Posterior Derecho"
              const altLeft = selectedLeft ? `Imagen ${selectedLeft} (Izquierdo)` : "Imagen Cuña Posterior Izquierdo"
              
              return (
                <div className="md:hidden mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-blue-600 mb-1 font-semibold">Pie Izquierdo</p>
                    <ProductImageSlider images={imagesLeft} alt={altLeft} />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1 font-semibold">Pie Derecho</p>
                    <ProductImageSlider images={imagesRight} alt={altRight} />
                  </div>
                </div>
              )
            })()}
          </div>
          
          {/* Sliders a la derecha en desktop - divididos en dos columnas */}
          {(() => {
            const selectedRight = form.watch(`products.${index}.posterior_wedge` as const) as string
            const selectedLeft = form.watch(`products.${index}.posterior_wedge_left` as const) as string
            const imagesRight = POSTERIOR_WEDGE_IMAGE_MAP_RIGHT[selectedRight] || []
            const imagesLeft = POSTERIOR_WEDGE_IMAGE_MAP_LEFT[selectedLeft] || []
            const altRight = selectedRight ? `Imagen ${selectedRight} (Derecho)` : "Imagen Cuña Posterior Derecho"
            const altLeft = selectedLeft ? `Imagen ${selectedLeft} (Izquierdo)` : "Imagen Cuña Posterior Izquierdo"
            
            return (
              <div className="hidden md:grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-blue-600 mb-1 font-semibold text-center">Pie Izquierdo</p>
                  <ProductImageSlider images={imagesLeft} alt={altLeft} />
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-1 font-semibold text-center">Pie Derecho</p>
                  <ProductImageSlider images={imagesRight} alt={altRight} />
                </div>
              </div>
            )
          })()}
        </div>
      )}

    </div>
  )
}

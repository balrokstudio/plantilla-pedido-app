"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle } from "lucide-react"
import type { OrderFormData } from "@/lib/validations"
import { Input } from "@/components/ui/input"
import { useFormConfig } from "@/hooks/use-form-config"

// Slider simple de imágenes 1:1
function ProductImageSlider({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [fade, setFade] = useState(false)
  const startXRef = useRef<number | null>(null)
  const currentXRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const safeImages = images && images.length > 0 ? images : ["/Logo-Under-Feet-green-.png", "/Logo-Under-Feet-green-.png"]

  // Reinicia al primer slide cuando cambian las imágenes (p. ej., al cambiar de tipo de plantilla)
  useEffect(() => {
    setIndex(0)
  }, [images])

  // Reinicia el fade en cada cambio de imagen o set de imágenes
  useEffect(() => {
    setFade(false)
  }, [index, images])

  const commitSwipe = () => {
    const startX = startXRef.current
    if (startX === null) return
    const delta = currentXRef.current - startX
    const width = containerRef.current?.clientWidth || 1
    const threshold = Math.max(40, width * 0.15) // 15% del ancho o 40px
    if (delta > threshold) {
      // swipe derecha -> imagen anterior
      setIndex((i) => (i - 1 + safeImages.length) % safeImages.length)
    } else if (delta < -threshold) {
      // swipe izquierda -> siguiente imagen
      setIndex((i) => (i + 1) % safeImages.length)
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
      <Image
        src={safeImages[index]}
        alt={alt}
        fill
        draggable={false}
        className={`object-contain select-none transition-opacity duration-500 ease-in-out ${fade ? "opacity-100" : "opacity-0"}`}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={false}
        onLoadingComplete={() => setFade(true)}
      />
      {/* Puntos (indicadores y control) */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {safeImages.map((_, i) => (
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
    "Mi Marca 3D",
    "Sandalia Under Feet",
  ]

  // Mapeo de imágenes por tipo de plantilla (2 imágenes por producto). Fallback a placeholders.
  const PRODUCT_IMAGE_MAP: Record<string, string[]> = {
    "Every Day": ["/every-day.jpg", "/EVERY-DAY-FRENTE.jpg"],
    "3/4": ["/3-4.jpg", "/3-4-FRENTE.jpg"],
    "Cross Trainer": ["/cross.jpg", "/CROSS-TRAINER-FRENTE.jpg"],
    "Botín": ["/botin-gris.jpg", "/BOTIN-AZUL-FRENTE.jpg"],
    "Junior": ["/junior-gris.jpg", "/JUNIOR-AZUL-FRENTE.jpg"],
    "Plantilla 3D": ["/Logo-Under-Feet-green-.png", "/Logo-Under-Feet-green-.png"],
    "Mi Marca Sport": ["/Logo-Under-Feet-green-.png", "/Logo-Under-Feet-green-.png"],
    "Mi Marca Clásica": ["/Logo-Under-Feet-green-.png", "/Logo-Under-Feet-green-.png"],
    "Mi Marca 3D": ["/Logo-Under-Feet-green-.png", "/Logo-Under-Feet-green-.png"],
    "Sandalia Under Feet": ["/Logo-Under-Feet-green-.png", "/Logo-Under-Feet-green-.png"],
  }

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

  const FOREFOOT_OPTIONS = ["Oliva Barra", "Pad Running", "Pad Medialuna", "Valente Valenti"]
  const ANTERIOR_WEDGE_OPTIONS = ["Cuña Anterior Externa", "Cuña Anterior Interna"]
  const MIDFOOT_ARCH_OPTIONS = ["Arco Flex", "Arco Semiblando", "Arco Látex"]
  const MIDFOOT_EXTERNAL_WEDGE_OPTIONS = ["Sí", "No"]
  const REARFOOT_OPTIONS = [
    "Botón Látex",
    "Talonera Descanso Espolón",
    "Realce en talón",
  ]
  const HEEL_RAISE_MM_OPTIONS = ["3mm", "5mm", "6mm", "8mm", "9mm", "10mm"]

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
                      <SelectValue placeholder="Seleccione el tipo" />
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
                <ProductImageSlider images={images} alt={alt} />
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
                  <FormLabel className="mb-1 min-h-[24px] flex items-center">{config.productLabels?.template_size || "Selección de talle"}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el talle" />
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
                const show = Array.isArray(colors) && colors.length > 0
                return (
                  <FormItem>
                    <FormLabel className="mb-1 min-h-[24px] flex items-center">{config.productLabels?.template_color || "Color"}</FormLabel>
                    {show ? (
                      <Select onValueChange={field.onChange} value={field.value}>
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
              <ProductImageSlider images={images} alt={alt} />
            </div>
          )
        })()}
      </div>

      {/* Separador  antes de Antepié */}
      <div className="md:col-span-2 h-px bg-gray-100 dark:bg-gray-700 my-2" />

      {/* Antepié - Zona metatarsal */}
      {config.productFields.forefoot_metatarsal !== false && (
        <FormField
          control={form.control}
          name={`products.${index}.forefoot_metatarsal` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{config.productLabels?.forefoot_metatarsal || "Antepié - Zona metatarsal"}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
      )}

      {/* Cuña Anterior */}
      {config.productFields.anterior_wedge !== false && (
        <FormField
          control={form.control}
          name={`products.${index}.anterior_wedge` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{config.productLabels?.anterior_wedge || "Cuña Anterior"}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ANTERIOR_WEDGE_OPTIONS.map((value) => (
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
      )}

      {/* Mediopié - Zona arco */}
      <div className="md:col-span-2">
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mediopié - Zona arco</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.productFields.midfoot_arch !== false && (
            <FormField
              control={form.control}
              name={`products.${index}.midfoot_arch` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{config.productLabels?.midfoot_arch || "Zona arco"}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
          )}
          {config.productFields.midfoot_external_wedge !== false && (
            <FormField
              control={form.control}
              name={`products.${index}.midfoot_external_wedge` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{config.productLabels?.midfoot_external_wedge || "Cuña Mediopié Externa"}</FormLabel>
                  <div className="flex items-center gap-4 py-2">
                    {MIDFOOT_EXTERNAL_WEDGE_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`midfoot_external_wedge_${index}`}
                          value={opt}
                          checked={field.value === opt}
                          onChange={() => field.onChange(opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      {/* Retropié - Zona calcáneo */}
      {config.productFields.rearfoot_calcaneus !== false && (
        <FormField
          control={form.control}
          name={`products.${index}.rearfoot_calcaneus` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{config.productLabels?.rearfoot_calcaneus || "Retropié - Zona calcáneo"}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REARFOOT_OPTIONS.map((value) => (
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
      )}

      {/* Detalle de milímetros para Realce en talón */}
      {config.productFields.heel_raise_mm !== false && rearfootValue === "Realce en talón" && (
        <FormField
          control={form.control}
          name={`products.${index}.heel_raise_mm` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{config.productLabels?.heel_raise_mm || "Detalle de milímetros para Realce en talón"}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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
      )}

      {/* Cuña Posterior */}
      {config.productFields.posterior_wedge !== false && (
        <FormField
          control={form.control}
          name={`products.${index}.posterior_wedge`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{config.productLabels?.posterior_wedge || "Cuña Posterior"}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Cuña Posterior Externa">Cuña Posterior Externa</SelectItem>
                  <SelectItem value="Cuña Posterior Interna">Cuña Posterior Interna</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

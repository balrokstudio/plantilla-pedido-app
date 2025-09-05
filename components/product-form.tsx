"use client"

import { useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ExternalLink, HelpCircle } from "lucide-react"
import type { ProductOption } from "@/lib/types"
import type { OrderFormData } from "@/lib/validations"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { useFormConfig } from "@/hooks/use-form-config"

interface ProductFormProps {
  form: UseFormReturn<OrderFormData>
  index: number
}

export function ProductForm({ form, index }: ProductFormProps) {
  const [productOptions, setProductOptions] = useState<Record<string, ProductOption[]>>({})
  const [loading, setLoading] = useState(true)
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
  const MIDFOOT_EXTERNAL_WEDGE_OPTIONS = ["Si", "No"]
  const REARFOOT_OPTIONS = [
    "Cuña Posterior Externa",
    "Botón Látex",
    "Talonera Descanso",
    "Espolón",
    "Realce en talón",
  ]
  const HEEL_RAISE_MM_OPTIONS = ["3mm", "5mm", "6mm", "8mm", "9mm", "10mm"]

  useEffect(() => {
    const fetchProductOptions = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("product_options")
          .select("*")
          .eq("is_active", true)
          .order("order_index")

        if (error) throw error

        // Group options by category
        const grouped = data.reduce(
          (acc, option) => {
            if (!acc[option.category]) {
              acc[option.category] = []
            }
            acc[option.category].push(option)
            return acc
          },
          {} as Record<string, ProductOption[]>,
        )

        setProductOptions(grouped)
      } catch (error) {
        console.error("Error fetching product options:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProductOptions()
  }, [])

  const openZonesHelp = () => {
    window.open("/zones-help", "_blank")
  }

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

      {/* Tipo Plantilla */}
      <FormField
        control={form.control}
        name={`products.${index}.product_type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo Plantilla *</FormLabel>
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

      {/* Color */}
      {config.productFields.template_color !== false && (
        <FormField
          control={form.control}
          name={`products.${index}.template_color` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el color" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Talle */}
      {config.productFields.template_size !== false && (
        <FormField
          control={form.control}
          name={`products.${index}.template_size` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selección de talle</FormLabel>
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

      {/* Antepié - Zona metatarsal */}
      {config.productFields.forefoot_metatarsal !== false && (
        <FormField
          control={form.control}
          name={`products.${index}.forefoot_metatarsal` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Antepié - Zona metatarsal</FormLabel>
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
              <FormLabel>Cuña Anterior</FormLabel>
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

      {/* Mediopié - Zona arco con botón de ayuda */}
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mediopié - Zona arco</h5>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openZonesHelp}
            className="text-blue-600 hover:text-blue-700 p-1 h-auto"
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Ver Zonas del Pie
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.productFields.midfoot_arch !== false && (
            <FormField
              control={form.control}
              name={`products.${index}.midfoot_arch` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona arco</FormLabel>
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
                  <FormLabel>Cuña Mediopié Externa</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MIDFOOT_EXTERNAL_WEDGE_OPTIONS.map((value) => (
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
        </div>
      </div>

      {/* Retropié - Zona calcáneo */}
      {config.productFields.rearfoot_calcaneus !== false && (
        <FormField
          control={form.control}
          name={`products.${index}.rearfoot_calcaneus` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retropié - Zona calcáneo</FormLabel>
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
              <FormLabel>Detalle de milímetros para Realce en talón</FormLabel>
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
              <FormLabel>Cuña Posterior</FormLabel>
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

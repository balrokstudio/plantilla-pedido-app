"use client"

import { useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ExternalLink, HelpCircle } from "lucide-react"
import type { OrderFormData, ProductOption } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface ProductFormProps {
  form: UseFormReturn<OrderFormData>
  index: number
}

export function ProductForm({ form, index }: ProductFormProps) {
  const [productOptions, setProductOptions] = useState<Record<string, ProductOption[]>>({})
  const [loading, setLoading] = useState(true)

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
        name={`products.${index}.product_type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Producto *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {productOptions.product_type?.map((option) => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

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
                {productOptions.posterior_wedge?.map((option) => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Zone Options with Help Button */}
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Opciones por Zona del Pie</h5>
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
          {[1, 2, 3, 4, 5].map((zoneNum) => (
            <FormField
              key={zoneNum}
              control={form.control}
              name={`products.${index}.zone_option_${zoneNum}` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona {zoneNum}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productOptions[`zone_option_${zoneNum}`]?.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>

      <FormField
        control={form.control}
        name={`products.${index}.heel_height`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Altura de Talón</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {productOptions.heel_height?.map((option) => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Simple manager to assign available colors per product type
export function ProductsColorsManager() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mapping, setMapping] = useState<Record<string, string[]>>({})
  const [productTypes, setProductTypes] = useState<string[]>([])

  const [newColor, setNewColor] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        // Load mapping
        const res = await fetch("/api/admin/products-colors", { cache: "no-store" })
        if (!res.ok) throw new Error("No autorizado o error cargando colores")
        const json = await res.json()
        setMapping(json?.data || {})

        // Load product types from public product options
        const r2 = await fetch("/api/product-options")
        const j2 = await r2.json().catch(() => ({ data: [] }))
        const types = (j2?.data || []).filter((o: any) => o.category === "product_type").map((o: any) => o.label)
        setProductTypes(types)

        if (types[0]) setSelectedProduct(types[0])
      } catch (e) {
        console.error(e)
        toast({ title: "Error", description: (e as Error).message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const colorsForSelected = mapping[selectedProduct] || []

  const addColor = () => {
    const color = newColor.trim()
    if (!color) return
    setMapping((prev) => ({ ...prev, [selectedProduct]: Array.from(new Set([...(prev[selectedProduct] || []), color])) }))
    setNewColor("")
  }

  const removeColor = (color: string) => {
    setMapping((prev) => ({ ...prev, [selectedProduct]: (prev[selectedProduct] || []).filter((c) => c !== color) }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/products-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapping),
      })
      if (!res.ok) throw new Error("No se pudo guardar la configuración")
      toast({ title: "Guardado", description: "Colores por producto actualizados" })
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Colores por Tipo de Plantilla</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tipo de Plantilla</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Colores disponibles</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {colorsForSelected.length === 0 ? (
                <div className="text-sm text-gray-500">No hay colores configurados</div>
              ) : (
                colorsForSelected.map((c) => (
                  <div key={c} className="flex items-center gap-2 border rounded px-2 py-1">
                    <span>{c}</span>
                    <button className="text-red-600" onClick={() => removeColor(c)}>
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Label>Agregar color</Label>
              <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Ej: Negro" />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={addColor} className="w-full">
                Agregar
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={save} disabled={saving}>
              {saving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

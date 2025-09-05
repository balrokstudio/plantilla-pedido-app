"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface FormConfig {
  orderFields: {
    phone: boolean
    notes: boolean
  }
  productFields: {
    forefoot_metatarsal: boolean
    anterior_wedge: boolean
    midfoot_arch: boolean
    midfoot_external_wedge: boolean
    rearfoot_calcaneus: boolean
    heel_raise_mm: boolean
    posterior_wedge: boolean
    template_color?: boolean
    template_size?: boolean
  }
}

const defaultConfig: FormConfig = {
  orderFields: { phone: true, notes: true },
  productFields: {
    forefoot_metatarsal: true,
    anterior_wedge: true,
    midfoot_arch: true,
    midfoot_external_wedge: true,
    rearfoot_calcaneus: true,
    heel_raise_mm: true,
    posterior_wedge: true,
    template_color: true,
    template_size: true,
  },
}

export function FormConfigManager() {
  const [config, setConfig] = useState<FormConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/form-config", { cache: "no-store" })
        if (!res.ok) throw new Error("No autorizado o error al cargar configuración")
        const json = await res.json()
        const data = (json?.data as FormConfig) || defaultConfig
        // merge defaults to avoid missing keys
        setConfig({
          orderFields: { ...defaultConfig.orderFields, ...(data.orderFields || {}) },
          productFields: { ...defaultConfig.productFields, ...(data.productFields || {}) },
        })
      } catch (e) {
        console.error(e)
        toast({ title: "Error", description: (e as Error).message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error("No se pudo guardar la configuración")
      toast({ title: "Guardado", description: "Configuración actualizada" })
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const toggle = (path: string[]) => {
    setConfig((prev) => {
      const copy: any = JSON.parse(JSON.stringify(prev))
      let ref: any = copy
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]]
      const last = path[path.length - 1]
      ref[last] = !ref[last]
      return copy
    })
  }

  const setLabel = (path: string[], value: string) => {
    setConfig((prev) => {
      const copy: any = JSON.parse(JSON.stringify(prev))
      let ref: any = copy
      for (let i = 0; i < path.length - 1; i++) {
        if (!ref[path[i]]) ref[path[i]] = {}
        ref = ref[path[i]]
      }
      const last = path[path.length - 1]
      ref[last] = value
      return copy
    })
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
          <CardTitle>Campos del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Teléfono</Label>
            <input
              type="checkbox"
              checked={config.orderFields.phone}
              onChange={() => toggle(["orderFields", "phone"])}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Etiqueta Teléfono</Label>
              <input
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={(config as any).orderLabels?.phone || "Teléfono"}
                onChange={(e) => setLabel(["orderLabels", "phone"], e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Observaciones</Label>
            <input
              type="checkbox"
              checked={config.orderFields.notes}
              onChange={() => toggle(["orderFields", "notes"])}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Etiqueta Observaciones</Label>
              <input
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={(config as any).orderLabels?.notes || "Observaciones"}
                onChange={(e) => setLabel(["orderLabels", "notes"], e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campos de Producto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              ["Color", "template_color"],
              ["Talle", "template_size"],
              ["Antepié - Zona metatarsal", "forefoot_metatarsal"],
              ["Cuña Anterior", "anterior_wedge"],
              ["Mediopié - Zona arco", "midfoot_arch"],
              ["Cuña Mediopié Externa", "midfoot_external_wedge"],
              ["Retropié - Zona calcáneo", "rearfoot_calcaneus"],
              ["Realce en talón (mm)", "heel_raise_mm"],
              ["Cuña Posterior", "posterior_wedge"],
            ] as const
          ).map(([label, key]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{label}</Label>
                <input
                  type="checkbox"
                  checked={(config.productFields as any)[key] ?? true}
                  onChange={() => toggle(["productFields", key])}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Etiqueta</Label>
                  <input
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={(config as any).productLabels?.[key] || label}
                    onChange={(e) => setLabel(["productLabels", key], e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />
      <div className="flex gap-2">
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar configuración"}
        </Button>
      </div>
    </div>
  )
}

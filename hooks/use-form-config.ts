import { useEffect, useState } from "react"

export interface FormConfig {
  orderFields: {
    phone: boolean
    notes: boolean
  }
  orderLabels?: Partial<Record<"phone" | "notes", string>>
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
  productLabels?: Partial<
    Record<
      | "template_color"
      | "template_size"
      | "forefoot_metatarsal"
      | "anterior_wedge"
      | "midfoot_arch"
      | "midfoot_external_wedge"
      | "rearfoot_calcaneus"
      | "heel_raise_mm"
      | "posterior_wedge",
      string
    >
  >
}

const defaultConfig: FormConfig = {
  orderFields: { phone: true, notes: true },
  orderLabels: { phone: "Teléfono", notes: "Observaciones" },
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
  productLabels: {
    template_color: "Color",
    template_size: "Selección de talle",
    forefoot_metatarsal: "Antepié - Zona metatarsal",
    anterior_wedge: "Cuña Anterior",
    midfoot_arch: "Zona arco",
    midfoot_external_wedge: "Cuña Mediopié Externa",
    rearfoot_calcaneus: "Retropié - Zona calcáneo",
    heel_raise_mm: "Detalle de milímetros para Realce en talón",
    posterior_wedge: "Cuña Posterior",
  },
}

export function useFormConfig() {
  const [config, setConfig] = useState<FormConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch("/api/form-config", { cache: "no-store" })
        const json = await res.json().catch(() => null)
        const data = (json?.data as FormConfig) || defaultConfig
        if (!active) return
        setConfig({
          orderFields: { ...defaultConfig.orderFields, ...(data.orderFields || {}) },
          orderLabels: { ...defaultConfig.orderLabels, ...(data.orderLabels || {}) },
          productFields: { ...defaultConfig.productFields, ...(data.productFields || {}) },
          productLabels: { ...defaultConfig.productLabels, ...(data.productLabels || {}) },
        })
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return { config, loading }
}

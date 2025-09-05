import { useEffect, useState } from "react"

export interface FormConfig {
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
          productFields: { ...defaultConfig.productFields, ...(data.productFields || {}) },
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

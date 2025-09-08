export interface ProductOption {
  id: string
  category: string
  label: string
  value: string
  order_index: number
  is_active: boolean
  created_at: string
}

export interface CustomerRequest {
  id: string
  name: string
  lastname: string
  email: string
  phone?: string
  status: "pending" | "processing" | "completed" | "cancelled"
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProductRequest {
  id: string
  customer_request_id: string
  // Datos del paciente (por producto)
  patient_name: string
  patient_lastname: string
  // Selección principal
  product_type: string
  template_size?: string | null
  template_color?: string | null
  // Configuraciones específicas por zona
  forefoot_metatarsal?: string | null
  anterior_wedge?: string | null
  midfoot_arch?: string | null
  midfoot_external_wedge?: string | null
  rearfoot_calcaneus?: string | null
  heel_raise_mm?: string | null
  // Cuña posterior
  posterior_wedge?: string | null
  created_at: string
}

export interface AppSetting {
  id: string
  key: string
  value: any
  updated_at: string
}

// Mapeo de colores disponibles por tipo de producto
export type ProductsColorsMapping = Record<string, string[]>

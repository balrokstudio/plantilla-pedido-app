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
  product_type: string
  zone_option_1: string
  zone_option_2: string
  zone_option_3: string
  zone_option_4: string
  zone_option_5: string
  heel_height: string
  posterior_wedge: string
  // New physical columns (Option B)
  template_color?: string | null
  template_size?: string | null
  forefoot_metatarsal?: string | null
  anterior_wedge?: string | null
  midfoot_arch?: string | null
  midfoot_external_wedge?: string | null
  rearfoot_calcaneus?: string | null
  heel_raise_mm?: string | null
  created_at: string
}

export interface AppSetting {
  id: string
  key: string
  value: any
  updated_at: string
}

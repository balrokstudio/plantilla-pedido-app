import { z } from "zod"

export const productFormSchema = z.object({
  // Fila 1: Información del Paciente
  patient_name: z.string().min(1, "Debe ingresar el nombre del paciente"),
  patient_lastname: z.string().min(1, "Debe ingresar el apellido del paciente"),

  // Fila 2: Selección principal
  product_type: z.string().min(1, "Debe seleccionar un tipo de producto"),
  template_size: z.string().min(1, "Debe seleccionar un talle"),
  // Color es condicional según producto; lo validamos opcional aquí y forzamos en la UI si corresponde
  template_color: z.string().optional().default(""),

  // Configuraciones específicas por zona
  forefoot_metatarsal: z.string().optional().default(""),
  anterior_wedge: z.string().optional().default(""),
  midfoot_arch: z.string().optional().default(""),
  midfoot_external_wedge: z.string().optional().default(""),
  rearfoot_calcaneus: z.string().optional().default(""),
  heel_raise_mm: z.string().optional().default(""),

  // Cuña Posterior
  posterior_wedge: z.string().optional().default(""),
})

export const orderFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ingresar un email válido"),
  phone: z.string().optional(),
  products: z.array(productFormSchema).min(1, "Debe agregar al menos un producto"),
  notes: z.string().optional().default(""),
})

export type OrderFormData = z.input<typeof orderFormSchema>
export type ProductFormData = z.input<typeof productFormSchema>

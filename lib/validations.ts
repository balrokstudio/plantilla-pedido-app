import { z } from "zod"

export const productFormSchema = z.object({
  product_type: z.string().min(1, "Debe seleccionar un tipo de producto"),
  patient_name: z.string().min(1, "Debe ingresar el nombre del paciente"),
  zone_option_1: z.string().default("ninguna"),
  zone_option_2: z.string().default("ninguna"),
  zone_option_3: z.string().default("ninguna"),
  zone_option_4: z.string().default("ninguna"),
  zone_option_5: z.string().default("ninguna"),
  heel_height: z.string().default("ninguna"),
  posterior_wedge: z.string().default("no"),
})

export const orderFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ingresar un email válido"),
  phone: z.string().optional(),
  products: z.array(productFormSchema).min(1, "Debe agregar al menos un producto"),
})

export type OrderFormData = z.input<typeof orderFormSchema>
export type ProductFormData = z.input<typeof productFormSchema>

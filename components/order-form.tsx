"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, CheckCircle } from "lucide-react"
import { ProductForm } from "@/components/product-form"
import { orderFormSchema, type OrderFormData } from "@/lib/validations"
import { useToast } from "@/hooks/use-toast"
import { useFieldArray } from "react-hook-form"
import { useFormConfig } from "@/hooks/use-form-config"

export function OrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const { toast } = useToast()
  const { config } = useFormConfig()

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      company_or_professional: "",
      email: "",
      phone: "",
      notes: "",
      products: [
        {
          patient_name: "",
          patient_lastname: "",
          product_type: "",
          template_size: "",
          template_color: "",
          forefoot_metatarsal: "",
          anterior_wedge: "",
          anterior_wedge_mm: "",
          midfoot_arch: "",
          rearfoot_calcaneus: "",
          heel_raise_mm: "",
          posterior_wedge: "",
          posterior_wedge_mm: "",
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  })

  const addProduct = () => {
    append({
      patient_name: "",
      patient_lastname: "",
      product_type: "",
      template_size: "",
      template_color: "",
      forefoot_metatarsal: "",
      anterior_wedge: "",
      anterior_wedge_mm: "",
      midfoot_arch: "",
      rearfoot_calcaneus: "",
      heel_raise_mm: "",
      posterior_wedge: "",
      posterior_wedge_mm: "",
    })
  }

  const removeProduct = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/submit-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        let message = "Error al enviar el pedido"
        try {
          const data = await response.json()
          if (data?.message) message = data.message
          // If validation issues are present, append a compact description
          if (Array.isArray(data?.issues) && data.issues.length > 0) {
            const fields = data.issues
              .map((i: any) => (i?.path ? String(i.path.join?.(".")) : i?.code || "campo"))
              .filter(Boolean)
              .slice(0, 5)
              .join(", ")
            if (fields) message += ` (campos: ${fields} ...)`
          }
        } catch (e) {
          // ignore JSON parse errors and keep default message
        }
        throw new Error(message)
      }

      setSubmitSuccess(true)
      form.reset()
      toast({
        title: "¡Pedido enviado exitosamente!",
        description: "Recibirá un email de confirmación en breve.",
      })
    } catch (error) {
      const description = error instanceof Error && error.message ? error.message : "Por favor, inténtelo nuevamente."
      toast({
        title: "Error al enviar el pedido",
        description,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">¡Pedido Enviado!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Su pedido ha sido recibido correctamente. Recibirá un email de confirmación en breve.
        </p>
        <Button onClick={() => setSubmitSuccess(false)}>Realizar Otro Pedido</Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">1</span>
              </div>
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="company_or_professional"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Empresa / Profesional *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese razón social o nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ejemplo@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {config.orderFields.phone !== false && (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{config.orderLabels?.phone || "Teléfono"}</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese su teléfono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Products Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">2</span>
              </div>
              Productos Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Producto {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProduct(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <ProductForm form={form} index={index} />
                {index < fields.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addProduct}
              className="w-full border-dashed border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Otro Producto
            </Button>
          </CardContent>
        </Card>

        {/* Notas / Observaciones */}
        {config.orderFields.notes !== false && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">3</span>
                </div>
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{config.orderLabels?.notes || "Observaciones"}</FormLabel>
                    <FormControl>
                      <textarea
                        className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="Escriba aquí cualquier detalle adicional..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="min-w-48 bg-[#94C361] hover:bg-[#9cce66] text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Enviando...
              </>
            ) : (
              "Enviar Pedido"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { orderFormSchema } from "@/lib/validations"
import { sendCustomerConfirmationEmail, sendAdminNotificationEmail, type OrderEmailData } from "@/lib/email"
import { addOrderToGoogleSheets } from "@/lib/google-sheets"
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = orderFormSchema.parse(body)

    const supabase = await createClient()

    // Insert customer request (try with notes; if column doesn't exist, retry without notes)
    let customerRequest: any | null = null
    let customerError: any | null = null
    {
      const insertWithNotes = await supabase
        .from("customer_requests")
        .insert({
          name: validatedData.name,
          lastname: validatedData.lastname,
          email: validatedData.email,
          phone: validatedData.phone || null,
          status: "pending",
          notes: validatedData.notes || null,
        })
        .select()
        .single()
      customerRequest = insertWithNotes.data
      customerError = insertWithNotes.error
    }

    if (customerError) {
      // Retry without notes to keep compatibility if the column doesn't exist
      const insertWithoutNotes = await supabase
        .from("customer_requests")
        .insert({
          name: validatedData.name,
          lastname: validatedData.lastname,
          email: validatedData.email,
          phone: validatedData.phone || null,
          status: "pending",
        })
        .select()
        .single()
      customerRequest = insertWithoutNotes.data
      customerError = insertWithoutNotes.error
    }

    if (customerError) {
      console.error("Error creating customer request:", customerError)
      throw new Error("Error al crear el pedido")
    }

    // Insert product requests (nuevo esquema de columnas)
    const productRequests = validatedData.products.map((product) => ({
      customer_request_id: customerRequest.id,
      // Datos del paciente por producto
      patient_name: product.patient_name,
      patient_lastname: product.patient_lastname,
      // Selección principal y configuraciones
      product_type: product.product_type,
      template_color: product.template_color || null,
      template_size: product.template_size || null,
      forefoot_metatarsal: product.forefoot_metatarsal || null,
      anterior_wedge: product.anterior_wedge || null,
      midfoot_arch: product.midfoot_arch || null,
      midfoot_external_wedge: product.midfoot_external_wedge || null,
      rearfoot_calcaneus: product.rearfoot_calcaneus || null,
      heel_raise_mm: product.heel_raise_mm || null,
      posterior_wedge: product.posterior_wedge || null,
    }))
    // Try inserting with new columns first; if it fails, fallback is no longer supported (zoneOption removido)
    let productsError: any | null = null
    {
      const insertProducts = await supabase.from("product_requests").insert(productRequests)
      productsError = insertProducts.error
    }

    if (productsError) {
      console.error("Error inserting product requests with new schema:", productsError)
      // Fallback: intentar insertar usando columnas legacy mínimas que existen por defecto
      const legacyMinimal = validatedData.products.map((product) => ({
        customer_request_id: customerRequest.id,
        product_type: product.product_type,
        posterior_wedge: product.posterior_wedge || "No",
      }))
      const retry = await supabase.from("product_requests").insert(legacyMinimal)
      productsError = retry.error
    }

    if (productsError) {
      console.error("Error creating product requests:", productsError)
      throw new Error("Error al crear los productos del pedido")
    }

    // Prepare email data
    const emailData: OrderEmailData = {
      customerName: `${validatedData.name} ${validatedData.lastname}`,
      customerEmail: validatedData.email,
      orderNumber: customerRequest.id.toString(),
      products: validatedData.products.map((product) => ({
        productType: product.product_type,
        quantity: 1, // Each product is quantity 1 in this system
        options: {
          "Tipo Plantilla": product.product_type,
          Color: product.template_color,
          Talle: product.template_size,
          "Nombre Paciente": product.patient_name,
          "Apellido Paciente": product.patient_lastname,
          "Antepié - Zona metatarsal": product.forefoot_metatarsal || "",
          "Cuña Anterior": product.anterior_wedge || "",
          "Mediopié - Zona arco": product.midfoot_arch || "",
          "Cuña Mediopié Externa": product.midfoot_external_wedge || "",
          "Retropié - Zona calcáneo": product.rearfoot_calcaneus || "",
          "Detalle de mm (realce en talón)": product.heel_raise_mm || "",
          "Cuña posterior": product.posterior_wedge,
        },
      })),
      totalProducts: validatedData.products.length,
      submittedAt: new Date().toISOString(),
      notes: validatedData.notes || "",
    }

    const sheetsData = {
      orderId: customerRequest.id.toString(),
      // Nuevo formato: nombre y apellido por separado
      firstName: validatedData.name,
      lastName: validatedData.lastname,
      // Compatibilidad: nombre completo por si faltan campos
      customerName: `${validatedData.name} ${validatedData.lastname}`,
      customerEmail: validatedData.email,
      customerPhone: validatedData.phone || "",
      submittedAt: customerRequest.created_at,
      status: "pending",
      products: validatedData.products.map((product) => ({
        productType: product.product_type,
        posteriorWedge: product.posterior_wedge || "",
        // Nuevos campos
        templateColor: product.template_color || "",
        templateSize: product.template_size || "",
        forefootMetatarsal: product.forefoot_metatarsal || "",
        anteriorWedge: product.anterior_wedge || "",
        midfootArch: product.midfoot_arch || "",
        midfootExternalWedge: product.midfoot_external_wedge || "",
        rearfootCalcaneus: product.rearfoot_calcaneus || "",
        heelRaiseMm: product.heel_raise_mm || "",
      })),
      notes: validatedData.notes || "",
    }

    // Send emails and sync to Google Sheets. Await to ensure serverless does not drop the tasks.
    // We don't fail the request if side effects fail; we just log results.
    const results = await Promise.allSettled([
      (async () => {
        const r = await sendCustomerConfirmationEmail(emailData)
        if (!r?.success) throw new Error(`Customer email failed: ${JSON.stringify(r?.error || r)}`)
      })(),
      (async () => {
        const r = await sendAdminNotificationEmail(emailData)
        if (!r?.success) throw new Error(`Admin email failed: ${JSON.stringify(r?.error || r)}`)
      })(),
      (async () => {
        const ok = await addOrderToGoogleSheets(sheetsData)
        if (!ok) throw new Error("Google Sheets sync returned false (check credentials, spreadsheet ID, and permissions)")
      })(),
    ])

    results.forEach((res, idx) => {
      if (res.status === "rejected") {
        const task = idx === 0 ? "customer_email" : idx === 1 ? "admin_email" : "google_sheets"
        console.error(`Post-order task '${task}' failed:`, res.reason)
      }
    })

    return NextResponse.json({
      success: true,
      message: "Pedido creado exitosamente",
      orderId: customerRequest.id,
    })
  } catch (error) {
    console.error("Error in submit-order API:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Datos inválidos. Revise el formulario.", issues: error.issues },
        { status: 400 },
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message || "Error interno del servidor" },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}


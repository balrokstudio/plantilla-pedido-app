import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { orderFormSchema } from "@/lib/validations"
import { sendCustomerConfirmationEmail, sendAdminNotificationEmail, type OrderEmailData } from "@/lib/email"
import { addOrderToGoogleSheets } from "@/lib/google-sheets"

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

    // Insert product requests (with new physical columns)
    const productRequests = validatedData.products.map((product) => ({
      customer_request_id: customerRequest.id,
      product_type: product.product_type,
      zone_option_1: product.zone_option_1,
      zone_option_2: product.zone_option_2,
      zone_option_3: product.zone_option_3,
      zone_option_4: product.zone_option_4,
      zone_option_5: product.zone_option_5,
      heel_height: product.heel_height,
      posterior_wedge: product.posterior_wedge,
      // New physical columns (Option B)
      template_color: product.template_color || null,
      template_size: product.template_size || null,
      forefoot_metatarsal: product.forefoot_metatarsal || null,
      anterior_wedge: product.anterior_wedge || null,
      midfoot_arch: product.midfoot_arch || null,
      midfoot_external_wedge: product.midfoot_external_wedge || null,
      rearfoot_calcaneus: product.rearfoot_calcaneus || null,
      heel_raise_mm: product.heel_raise_mm || null,
    }))

    const { error: productsError } = await supabase.from("product_requests").insert(productRequests)

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
          "Zona 1": product.zone_option_1,
          "Zona 2": product.zone_option_2,
          "Zona 3": product.zone_option_3,
          "Zona 4": product.zone_option_4,
          "Zona 5": product.zone_option_5,
          "Antepié - Zona metatarsal": product.forefoot_metatarsal || "",
          "Cuña Anterior": product.anterior_wedge || "",
          "Mediopié - Zona arco": product.midfoot_arch || "",
          "Cuña Mediopié Externa": product.midfoot_external_wedge || "",
          "Retropié - Zona calcáneo": product.rearfoot_calcaneus || "",
          "Detalle de mm (realce en talón)": product.heel_raise_mm || "",
          "Altura del talón": product.heel_height,
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
        zoneOption1: product.zone_option_1,
        zoneOption2: product.zone_option_2,
        zoneOption3: product.zone_option_3,
        zoneOption4: product.zone_option_4,
        zoneOption5: product.zone_option_5,
        heelHeight: product.heel_height,
        posteriorWedge: product.posterior_wedge,
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

    // Send emails and sync to Google Sheets (don't block the response if they fail)
    Promise.all([
      sendCustomerConfirmationEmail(emailData),
      sendAdminNotificationEmail(emailData),
      addOrderToGoogleSheets(sheetsData),
    ]).catch((error) => {
      console.error("Error with post-order processing:", error)
      // Log but don't fail the request
    })

    return NextResponse.json({
      success: true,
      message: "Pedido creado exitosamente",
      orderId: customerRequest.id,
    })
  } catch (error) {
    console.error("Error in submit-order API:", error)

    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

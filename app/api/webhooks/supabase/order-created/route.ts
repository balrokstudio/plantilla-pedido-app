import { NextRequest, NextResponse } from "next/server"
import { addOrderToGoogleSheets } from "@/lib/google-sheets"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// This endpoint is intended to be called by a Supabase Database Webhook (on INSERT into customer_requests)
// or by a Supabase Edge Function. It validates a shared secret and then pushes the order to Google Sheets.
//
// Environment required:
// - NEXT_PUBLIC_SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY (server-side only)
// - SUPABASE_WEBHOOK_SECRET (shared secret, used for simple header validation)

function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase URL o SERVICE ROLE KEY no configurados")
  }
  return createSupabaseClient(url, key, { auth: { persistSession: false } })
}

function verifySecret(request: NextRequest): boolean {
  const provided = request.headers.get("x-webhook-secret") || request.headers.get("x-supabase-signature")
  const expected = process.env.SUPABASE_WEBHOOK_SECRET
  if (!expected) {
    console.warn("SUPABASE_WEBHOOK_SECRET no configurado; rechazando por seguridad")
    return false
  }
  return provided === expected
}

export async function POST(request: NextRequest) {
  try {
    if (!verifySecret(request)) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const payload = await request.json()
    // Flexible payload: accept {record:{id}} or {id}
    const orderId = payload?.record?.id ?? payload?.id
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Payload inválido: falta id" }, { status: 400 })
    }

    const supabase = getSupabaseServiceClient()

    // Fetch order with products
    const { data: order, error } = await supabase
      .from("customer_requests")
      .select(
        `id, created_at, name, lastname, email, phone, status, notes,
         product_requests (
           product_type, patient_name, patient_lastname,
           zone_option_1, zone_option_2, zone_option_3, zone_option_4, zone_option_5,
           heel_height, posterior_wedge,
           template_color, template_size, forefoot_metatarsal, forefoot_metatarsal_left, 
           anterior_wedge, anterior_wedge_mm, anterior_wedge_left, anterior_wedge_left_mm, 
           midfoot_arch, midfoot_arch_left, midfoot_external_wedge, 
           rearfoot_calcaneus, rearfoot_calcaneus_left, 
           heel_raise_mm, heel_raise_left_mm,
           posterior_wedge_left, posterior_wedge_mm, posterior_wedge_left_mm
         )`
      )
      .eq("id", orderId)
      .single()

    if (error || !order) {
      console.error("Webhook order fetch error:", error)
      return NextResponse.json({ success: false, message: "No se encontró el pedido" }, { status: 404 })
    }

    const sheetsData = {
      orderId: order.id.toString(),
      firstName: order.name || "",
      lastName: order.lastname || "",
      customerName: `${order.name ?? ""} ${order.lastname ?? ""}`.trim(),
      customerEmail: order.email || "",
      customerPhone: order.phone || "",
      submittedAt: order.created_at,
      status: order.status || "",
      products: (order.product_requests || []).map((p: any) => ({
        productType: p.product_type,
        patientName: p.patient_name || "",
        patientLastname: p.patient_lastname || "",
        zoneOption1: p.zone_option_1,
        zoneOption2: p.zone_option_2,
        zoneOption3: p.zone_option_3,
        zoneOption4: p.zone_option_4,
        zoneOption5: p.zone_option_5,
        heelHeight: p.heel_height,
        posteriorWedge: p.posterior_wedge,
        templateColor: p.template_color || "",
        templateSize: p.template_size || "",
        forefootMetatarsal: p.forefoot_metatarsal || "",
        forefootMetatarsalLeft: p.forefoot_metatarsal_left || "",
        anteriorWedge: p.anterior_wedge || "",
        anteriorWedgeMm: p.anterior_wedge_mm || "",
        anteriorWedgeLeft: p.anterior_wedge_left || "",
        anteriorWedgeLeftMm: p.anterior_wedge_left_mm || "",
        midfootArch: p.midfoot_arch || "",
        midfootArchLeft: p.midfoot_arch_left || "",
        midfootExternalWedge: p.midfoot_external_wedge || "",
        rearfootCalcaneus: p.rearfoot_calcaneus || "",
        rearfootCalcaneusLeft: p.rearfoot_calcaneus_left || "",
        heelRaiseMm: p.heel_raise_mm || "",
        heelRaiseLeftMm: p.heel_raise_left_mm || "",
        posteriorWedgeMm: p.posterior_wedge_mm || "",
        posteriorWedgeLeft: p.posterior_wedge_left || "",
        posteriorWedgeLeftMm: p.posterior_wedge_left_mm || "",
      })),
      notes: order.notes || "",
    }

    const ok = await addOrderToGoogleSheets(sheetsData)
    if (!ok) {
      console.error("Webhook: fallo al sincronizar con Google Sheets")
      return NextResponse.json({ success: false, message: "Error al sincronizar con Google Sheets" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Pedido enviado a Google Sheets" })
  } catch (error) {
    console.error("Error en webhook Supabase -> Sheets:", error)
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Public GET: returns current form configuration from app_settings
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "form_config")
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116: No rows found
      console.error("Error fetching form_config:", error)
    }

    // Default config if not set
    const defaultConfig = {
      orderFields: {
        phone: true,
        notes: true,
      },
      productFields: {
        forefoot_metatarsal: true,
        anterior_wedge: true,
        midfoot_arch: true,
        midfoot_external_wedge: true,
        rearfoot_calcaneus: true,
        heel_raise_mm: true,
        posterior_wedge: true,
      },
    }

    const value = (data?.value as any) || defaultConfig

    return NextResponse.json({ success: true, data: value })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

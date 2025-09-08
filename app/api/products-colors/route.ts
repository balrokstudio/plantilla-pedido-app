import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Public GET: returns products_colors mapping from app_settings
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "products_colors")
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching products_colors:", error)
    }

    return NextResponse.json({ success: true, data: (data?.value as any) || {} })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

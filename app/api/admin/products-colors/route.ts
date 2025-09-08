import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Admin GET/POST: manage products_colors mapping in app_settings
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()

    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "products_colors", value: body, updated_at: new Date().toISOString() }, { onConflict: "key" })

    if (error) {
      console.error("Error updating products_colors:", error)
      return NextResponse.json({ success: false, message: "No se pudo guardar la configuración" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

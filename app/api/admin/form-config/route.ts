import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
      .eq("key", "form_config")
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching form_config:", error)
    }

    return NextResponse.json({ success: true, data: data?.value || null })
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

    // Upsert form_config
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "form_config", value: body, updated_at: new Date().toISOString() }, { onConflict: "key" })

    if (error) {
      console.error("Error updating form_config:", error)
      return NextResponse.json({ success: false, message: "No se pudo guardar la configuración" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

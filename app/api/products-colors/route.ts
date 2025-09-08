import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const DEFAULT_TYPES = [
  "Every Day",
  "3/4",
  "Cross Trainer",
  "Botín",
  "Junior",
  "Plantilla 3D",
  "Mi Marca Sport",
  "Mi Marca Clásica",
  "Mi Marca 3D",
  "Sandalia Under Feet",
]

const DEFAULT_COLORS = [
  "Negro",
  "Marrón",
  "Beige",
  "Azul",
  "Gris",
  "Blanco",
  "Rojo",
  "Verde",
  "Bordó",
  "Arena",
]

// Public GET: returns products_colors mapping from app_settings, completing with defaults
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

    const stored = ((data?.value as any) || {}) as Record<string, string[]>
    const merged: Record<string, string[]> = {}
    for (const t of DEFAULT_TYPES) {
      const existing = Array.isArray(stored[t]) ? stored[t] : []
      merged[t] = existing.length > 0 ? existing : DEFAULT_COLORS
    }

    return NextResponse.json({ success: true, data: merged })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

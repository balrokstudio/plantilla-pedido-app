import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Configuración de colores por tipo de plantilla
const PRODUCTS_COLORS: Record<string, string[]> = {
  "Clásico": ["Habano", "Fucsia"],
  "Sport": ["Gris", "Azul", "Violeta", "Fucsia"],
  "Junior": ["Azul", "Fucsia"],
  "Cross Trainer": ["Gris", "Azul"],
  "Botín": ["Gris", "Azul", "Violeta", "Fucsia"],
  "Every Day": ["Habano", "Plastazote Crema"], // Médica
  "3/4": ["Habano", "Gris"],
  "Mi Marca Sport": ["Habano"], // Automático, sin opción
  "Mi Marca Clásica": ["Habano"], // Automático, sin opción
  "3D": ["Rojo", "Azul", "Menta", "Lavanda"],
  "Sandalia Under Feet": [], // Sin colores
  "Plantilla 3D": [], // Sin especificar, sin colores por defecto
}

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
    
    // Usar configuración almacenada o valores por defecto
    for (const [productType, defaultColors] of Object.entries(PRODUCTS_COLORS)) {
      const existing = Array.isArray(stored[productType]) ? stored[productType] : []
      merged[productType] = existing.length > 0 ? existing : defaultColors
    }

    return NextResponse.json({ success: true, data: merged })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

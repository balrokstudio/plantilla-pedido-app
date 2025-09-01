import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const productOptionSchema = z.object({
  category: z.string().min(1, "La categoría es requerida"),
  label: z.string().min(1, "La etiqueta es requerida"),
  value: z.string().min(1, "El valor es requerido"),
  order_index: z.number().int().min(0),
  is_active: z.boolean().optional().default(true),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let query = supabase.from("product_options").select("*").order("category").order("order_index")

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching product options:", error)
      throw new Error("Error al obtener las opciones de producto")
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error("Error in admin product options API:", error)

    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = productOptionSchema.parse(body)

    const { data, error } = await supabase.from("product_options").insert([validatedData]).select().single()

    if (error) {
      console.error("Error creating product option:", error)
      throw new Error("Error al crear la opción de producto")
    }

    return NextResponse.json({
      success: true,
      message: "Opción de producto creada exitosamente",
      data,
    })
  } catch (error) {
    console.error("Error in admin product options create API:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Datos de entrada inválidos", errors: error.errors },
        { status: 400 },
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

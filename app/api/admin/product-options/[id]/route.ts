import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateProductOptionSchema = z.object({
  category: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
  order_index: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const validatedData = updateProductOptionSchema.parse(body)

    const { data, error } = await supabase
      .from("product_options")
      .update(validatedData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating product option:", error)
      throw new Error("Error al actualizar la opción de producto")
    }

    return NextResponse.json({
      success: true,
      message: "Opción de producto actualizada exitosamente",
      data,
    })
  } catch (error) {
    console.error("Error in admin product option update API:", error)

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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { error } = await supabase.from("product_options").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting product option:", error)
      throw new Error("Error al eliminar la opción de producto")
    }

    return NextResponse.json({
      success: true,
      message: "Opción de producto eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error in admin product option delete API:", error)

    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

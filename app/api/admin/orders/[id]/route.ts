import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get customer request with products
    const { data: customerRequest, error: customerError } = await supabase
      .from("customer_requests")
      .select("*")
      .eq("id", params.id)
      .single()

    if (customerError) {
      console.error("Error fetching customer request:", customerError)
      throw new Error("Error al obtener el pedido")
    }

    const { data: productRequests, error: productsError } = await supabase
      .from("product_requests")
      .select("*")
      .eq("customer_request_id", params.id)
      .order("created_at")

    if (productsError) {
      console.error("Error fetching product requests:", productsError)
      throw new Error("Error al obtener los productos del pedido")
    }

    return NextResponse.json({
      success: true,
      data: {
        ...customerRequest,
        products: productRequests || [],
      },
    })
  } catch (error) {
    console.error("Error in admin order detail API:", error)

    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

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
    const { status, notes } = body

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from("customer_requests")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating order:", error)
      throw new Error("Error al actualizar el pedido")
    }

    return NextResponse.json({
      success: true,
      message: "Pedido actualizado exitosamente",
      data,
    })
  } catch (error) {
    console.error("Error in admin order update API:", error)

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

    // Delete customer request (products will be deleted automatically due to CASCADE)
    const { error } = await supabase.from("customer_requests").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting order:", error)
      throw new Error("Error al eliminar el pedido")
    }

    return NextResponse.json({
      success: true,
      message: "Pedido eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error in admin order delete API:", error)

    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
    const { format = "csv", dateFrom, dateTo, status } = body

    // Build query
    let query = supabase
      .from("customer_requests")
      .select(`
        *,
        product_requests (*)
      `)
      .order("created_at", { ascending: false })

    if (dateFrom) {
      query = query.gte("created_at", dateFrom)
    }

    if (dateTo) {
      query = query.lte("created_at", dateTo)
    }

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error("Error fetching orders for export:", error)
      throw new Error("Error al obtener los pedidos para exportar")
    }

    if (format === "csv") {
      // Generate CSV
      const csvHeaders = [
        "ID",
        "Nombre",
        "Apellido",
        "Email",
        "Teléfono",
        "Estado",
        "Fecha Creación",
        "Productos",
        "Notas",
      ]

      const csvRows =
        orders?.map((order) => [
          order.id,
          order.name,
          order.lastname,
          order.email,
          order.phone || "",
          order.status,
          new Date(order.created_at).toLocaleDateString("es-ES"),
          order.product_requests?.length || 0,
          order.notes || "",
        ]) || []

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="pedidos_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      data: orders || [],
      exportedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in admin export API:", error)

    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { exportOrdersToGoogleSheets } from "@/lib/google-sheets"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check admin authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Get all orders with products
    const { data: orders, error: ordersError } = await supabase
      .from("customer_requests")
      .select(`
        *,
        product_requests (*)
      `)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
      return NextResponse.json({ success: false, message: "Error al obtener pedidos" }, { status: 500 })
    }

    // Transform data for Google Sheets
    const sheetData = orders.map((order) => ({
      orderId: order.id.toString(),
      customerName: `${order.name} ${order.lastname}`,
      customerEmail: order.email,
      customerPhone: order.phone || "",
      submittedAt: order.created_at,
      status: order.status,
      products: order.product_requests.map((product: any) => ({
        productType: product.product_type,
        zoneOption1: product.zone_option_1,
        zoneOption2: product.zone_option_2,
        zoneOption3: product.zone_option_3,
        zoneOption4: product.zone_option_4,
        zoneOption5: product.zone_option_5,
        heelHeight: product.heel_height,
        posteriorWedge: product.posterior_wedge,
      })),
    }))

    // Export to Google Sheets
    const exportSuccess = await exportOrdersToGoogleSheets(sheetData)

    if (!exportSuccess) {
      return NextResponse.json(
        {
          success: false,
          message: "Error al exportar a Google Sheets. Verifica la configuración.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `${orders.length} pedidos exportados exitosamente a Google Sheets`,
      exportedCount: orders.length,
    })
  } catch (error) {
    console.error("Error in Google Sheets export:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}

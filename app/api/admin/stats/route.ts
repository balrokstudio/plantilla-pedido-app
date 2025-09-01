import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    // Get total orders count
    const { count: totalOrders } = await supabase.from("customer_requests").select("*", { count: "exact", head: true })

    // Get orders by status
    const { data: ordersByStatus } = await supabase.from("customer_requests").select("status")

    const statusCounts =
      ordersByStatus?.reduce(
        (acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentOrders } = await supabase
      .from("customer_requests")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString())

    // Get orders by day for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: dailyOrders } = await supabase
      .from("customer_requests")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at")

    // Group orders by day
    const ordersByDay =
      dailyOrders?.reduce(
        (acc, order) => {
          const date = new Date(order.created_at).toISOString().split("T")[0]
          acc[date] = (acc[date] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    // Get product type statistics
    const { data: productStats } = await supabase.from("product_requests").select("product_type")

    const productTypeCounts =
      productStats?.reduce(
        (acc, product) => {
          acc[product.product_type] = (acc[product.product_type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    return NextResponse.json({
      success: true,
      data: {
        totalOrders: totalOrders || 0,
        recentOrders: recentOrders || 0,
        statusCounts: {
          pending: statusCounts.pending || 0,
          processing: statusCounts.processing || 0,
          completed: statusCounts.completed || 0,
          cancelled: statusCounts.cancelled || 0,
        },
        ordersByDay,
        productTypeCounts,
      },
    })
  } catch (error) {
    console.error("Error in admin stats API:", error)

    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

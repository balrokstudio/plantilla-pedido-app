import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import Link from "next/link"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentOrders } from "@/components/admin/recent-orders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/admin/login")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Resumen general del sistema de pedidos</p>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders />

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Tareas comunes de administración</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/orders">
                  <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">📋</div>
                      <div className="text-sm font-medium">Ver Pedidos</div>
                    </div>
                  </Card>
                </Link>
                <Link href="/admin/product-options">
                  <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">⚙️</div>
                      <div className="text-sm font-medium">Opciones</div>
                    </div>
                  </Card>
                </Link>
                <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">📊</div>
                    <div className="text-sm font-medium">Exportar</div>
                  </div>
                </Card>
                <Link href="/admin/form-config">
                  <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">🔧</div>
                      <div className="text-sm font-medium">Configuración</div>
                    </div>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

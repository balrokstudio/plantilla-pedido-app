import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportsTools } from "@/components/admin/reports-tools"
import { ReportsDashboard } from "@/components/admin/reports-dashboard"

export default async function AdminReportsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reportes</h1>
          <p className="text-gray-600 dark:text-gray-400">Exporta y analiza los pedidos con filtros por fecha y estado</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exportación de Pedidos</CardTitle>
            <CardDescription>Genera un archivo CSV o consulta datos en JSON usando el endpoint ya disponible</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsTools />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas Visuales</CardTitle>
            <CardDescription>Distribución por estado, tipo de plantilla y color</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsDashboard />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

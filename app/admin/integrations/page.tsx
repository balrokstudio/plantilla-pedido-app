import { AdminLayout } from "@/components/admin/admin-layout"
import { GoogleSheetsManager } from "@/components/admin/google-sheets-manager"

export default function IntegrationsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integraciones</h1>
          <p className="text-muted-foreground">Gestiona las integraciones externas del sistema</p>
        </div>

        <GoogleSheetsManager />
      </div>
    </AdminLayout>
  )
}

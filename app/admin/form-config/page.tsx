import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormConfigManager } from "@/components/admin/form-config-manager"

export default async function AdminFormConfigPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración de Formulario</h1>
          <p className="text-gray-600 dark:text-gray-400">Activa o desactiva los campos visibles en el formulario de pedidos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campos visibles</CardTitle>
            <CardDescription>Personaliza qué campos verá el usuario al realizar un pedido</CardDescription>
          </CardHeader>
          <CardContent>
            <FormConfigManager />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ProductOptionsManager } from "@/components/admin/product-options-manager"

export default async function AdminProductOptionsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Opciones de Producto</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestione las opciones disponibles para los productos</p>
        </div>

        <ProductOptionsManager />
      </div>
    </AdminLayout>
  )
}

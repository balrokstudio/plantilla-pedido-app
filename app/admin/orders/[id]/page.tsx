import { redirect } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { createClient } from "@/lib/supabase/server"
import OrderDetail from "@/components/admin/order-detail"

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
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
      <OrderDetail id={params.id} />
    </AdminLayout>
  )
}

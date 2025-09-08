"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface OrderDetailProps {
  id: string
}

export default function OrderDetail({ id }: OrderDetailProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any | null>(null)
  const [status, setStatus] = useState<string>("pending")
  const [notes, setNotes] = useState<string>("")

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${id}`, { cache: "no-store" })
        if (!res.ok) throw new Error("No se pudo cargar el pedido")
        const json = await res.json()
        setOrder(json.data)
        setStatus(json.data.status || "pending")
        setNotes(json.data.notes || "")
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // Modo solo-lectura: sin guardado ni edición

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!order) {
    return <p className="text-gray-500">Pedido no encontrado</p>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pedido de {order.name} {order.lastname}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Estado</div>
              <Badge>{status}</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-sm font-medium">{order.email}</div>
            </div>
            {order.phone && (
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Teléfono</div>
                <div className="text-sm font-medium">{order.phone}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Nombre</div>
              <div className="text-sm font-medium">{order.name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Apellido</div>
              <div className="text-sm font-medium">{order.lastname}</div>
            </div>
          </div>

          {notes && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Notas</div>
              <div className="text-sm whitespace-pre-wrap">{notes}</div>
            </div>
          )}

          <Separator />
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => router.push("/admin/orders")}>Volver</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {order.products?.length ? (
            <div className="space-y-4">
              {order.products.map((p: any) => (
                <div key={p.id} className="p-4 border rounded-md">
                  <div className="font-medium">{p.product_type}</div>
                  <div className="text-sm text-gray-600">Creado: {new Date(p.created_at).toLocaleString()}</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-sm">
                    {[
                      ["Nombre Paciente", p.patient_name],
                      ["Apellido Paciente", p.patient_lastname],
                      ["Color", p.template_color],
                      ["Talle", p.template_size],
                      ["Antepié - Zona metatarsal", p.forefoot_metatarsal],
                      ["Cuña Anterior", p.anterior_wedge],
                      ["Mediopié - Zona arco", p.midfoot_arch],
                      ["Cuña Mediopié Externa", p.midfoot_external_wedge],
                      ["Retropié - Zona calcáneo", p.rearfoot_calcaneus],
                      ["Realce en talón (mm)", p.heel_raise_mm],
                      ["Cuña Posterior", p.posterior_wedge],
                    ].map(([label, value]) => (
                      value ? (
                        <div key={String(label)} className="flex justify-between gap-2">
                          <span className="text-gray-500">{String(label)}</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Sin productos</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

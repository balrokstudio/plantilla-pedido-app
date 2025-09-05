"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

interface OrderDetailProps {
  id: string
}

export default function OrderDetail({ id }: OrderDetailProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      })
      if (!res.ok) throw new Error("No se pudo actualizar el pedido")
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

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
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Estado:</span>
            <Badge>{status}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Actualizar estado</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="processing">Procesando</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <Input value={order.email} readOnly className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Nombre</label>
              <Input value={`${order.name}`} readOnly className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Apellido</label>
              <Input value={`${order.lastname}`} readOnly className="mt-1" />
            </div>
            {order.phone && (
              <div>
                <label className="text-sm text-gray-600">Teléfono</label>
                <Input value={`${order.phone}`} readOnly className="mt-1" />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600">Notas</label>
            <Textarea
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              className="mt-1"
            />
          </div>

          <Separator />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/admin/orders")}>Volver</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm">
                    {Object.entries(p).map(([k, v]) => {
                      if (["id", "customer_request_id", "product_type", "created_at"].includes(k)) return null
                      return (
                        <div key={k} className="flex justify-between gap-2">
                          <span className="text-gray-500">{k}</span>
                          <span className="font-medium">{String(v)}</span>
                        </div>
                      )
                    })}
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

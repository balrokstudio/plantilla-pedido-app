"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Customer = {
  id: string
  email: string
  status: string
  created_at: string
}

type ProductRow = {
  id: string
  customer_request_id: string
  product_type: string | null
  template_color: string | null
  created_at: string
}

function PieChart({ data, size = 160, thickness = 24 }: { data: { label: string; value: number; color: string }[]; size?: number; thickness?: number }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0)
  const radius = (size - thickness) / 2
  let cumulative = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={thickness} />
      {data.map((d, i) => {
        const portion = total > 0 ? d.value / total : 0
        const startAngle = 2 * Math.PI * cumulative
        const endAngle = 2 * Math.PI * (cumulative + portion)
        cumulative += portion

        const x1 = size / 2 + radius * Math.sin(startAngle)
        const y1 = size / 2 - radius * Math.cos(startAngle)
        const x2 = size / 2 + radius * Math.sin(endAngle)
        const y2 = size / 2 - radius * Math.cos(endAngle)
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

        const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`

        return (
          <path key={i} d={pathData} stroke={d.color} strokeWidth={thickness} fill="none" />
        )
      })}
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-sm">
        {total}
      </text>
    </svg>
  )
}

const palette = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#ec4899", "#f97316", "#14b8a6",
]

export function ReportsDashboard() {
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<ProductRow[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const [{ data: cust }, { data: prod }] = await Promise.all([
          supabase.from("customer_requests").select("id,email,status,created_at"),
          supabase.from("product_requests").select("id,customer_request_id,product_type,template_color,created_at"),
        ])
        setCustomers(cust || [])
        setProducts(prod || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const emailsUnique = useMemo(() => {
    const set = new Set<string>()
    for (const c of customers) {
      if (c.email) set.add(c.email.toLowerCase())
    }
    return Array.from(set).sort()
  }, [customers])

  const statusData = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of customers) map.set(c.status || "pending", (map.get(c.status || "pending") || 0) + 1)
    const labels = Array.from(map.keys())
    return labels.map((l, i) => ({ label: l, value: map.get(l) || 0, color: palette[i % palette.length] }))
  }, [customers])

  const byProductType = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) if (p.product_type) map.set(p.product_type, (map.get(p.product_type) || 0) + 1)
    const labels = Array.from(map.keys())
    return labels.map((l, i) => ({ label: l, value: map.get(l) || 0, color: palette[i % palette.length] }))
  }, [products])

  const byColor = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) if (p.template_color) map.set(p.template_color, (map.get(p.template_color) || 0) + 1)
    const labels = Array.from(map.keys())
    return labels.map((l, i) => ({ label: l, value: map.get(l) || 0, color: palette[i % palette.length] }))
  }, [products])

  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(emailsUnique.join(", "))
    } catch (e) {
      console.error("No se pudo copiar emails", e)
    }
  }

  if (loading) {
    return <div className="h-32 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <PieChart data={statusData} />
              <ul className="text-sm space-y-1">
                {statusData.map((d) => (
                  <li key={d.label} className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded" style={{ background: d.color }} />
                    <span className="text-gray-600 dark:text-gray-300">{d.label}</span>
                    <span className="ml-auto font-medium">{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Tipo de Plantilla</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <PieChart data={byProductType} />
              <ul className="text-sm space-y-1">
                {byProductType.map((d) => (
                  <li key={d.label} className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded" style={{ background: d.color }} />
                    <span className="text-gray-600 dark:text-gray-300">{d.label}</span>
                    <span className="ml-auto font-medium">{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <PieChart data={byColor} />
              <ul className="text-sm space-y-1 max-h-40 overflow-auto">
                {byColor.map((d) => (
                  <li key={d.label} className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded" style={{ background: d.color }} />
                    <span className="text-gray-600 dark:text-gray-300">{d.label}</span>
                    <span className="ml-auto font-medium">{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emails únicos de clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total: {emailsUnique.length}</div>
            <Button variant="outline" size="sm" onClick={copyEmails}>Copiar</Button>
          </div>
          <div className="text-xs border rounded p-3 max-h-60 overflow-auto bg-gray-50 dark:bg-gray-900">
            {emailsUnique.join(", ")}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

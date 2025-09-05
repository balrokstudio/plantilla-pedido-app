"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2, Download, FileJson } from "lucide-react"

export function ReportsTools() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [jsonPreview, setJsonPreview] = useState<any[] | null>(null)

  const buildPayload = () => ({
    format: "csv",
    dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    dateTo: dateTo ? new Date(new Date(dateTo).setHours(23, 59, 59, 999)).toISOString() : undefined,
    status,
  })

  const exportCSV = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildPayload(), format: "csv" }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || "Error al exportar CSV")
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const previewJSON = async () => {
    setLoading(true)
    setJsonPreview(null)
    try {
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildPayload(), format: "json" }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al obtener datos")
      }
      setJsonPreview(Array.isArray(data.data) ? data.data.slice(0, 20) : [])
    } catch (e) {
      console.error(e)
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="from">Desde</Label>
          <Input id="from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">Hasta</Label>
          <Input id="to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En proceso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={exportCSV} disabled={loading} className="w-full md:w-auto">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Exportar CSV
          </Button>
          <Button onClick={previewJSON} variant="outline" disabled={loading} className="w-full md:w-auto">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileJson className="w-4 h-4 mr-2" />}
            Ver JSON
          </Button>
        </div>
      </div>

      <Separator />

      {jsonPreview && (
        <div className="overflow-auto text-sm max-h-96 border rounded-md p-3 bg-gray-50 dark:bg-gray-900">
          <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{JSON.stringify(jsonPreview, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

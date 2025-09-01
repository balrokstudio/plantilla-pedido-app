"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Download, TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react"

export function GoogleSheetsManager() {
  const [isExporting, setIsExporting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "error">("unknown")
  const { toast } = useToast()

  const testConnection = async () => {
    setIsTesting(true)
    try {
      const response = await fetch("/api/admin/google-sheets/test")
      const data = await response.json()

      if (data.success) {
        setConnectionStatus("connected")
        toast({
          title: "Conexión exitosa",
          description: "Google Sheets está configurado correctamente",
        })
      } else {
        setConnectionStatus("error")
        toast({
          title: "Error de conexión",
          description: data.message || "No se pudo conectar con Google Sheets",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("error")
      toast({
        title: "Error",
        description: "Error al probar la conexión",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const exportToSheets = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/admin/google-sheets/export", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Exportación exitosa",
          description: `${data.exportedCount} pedidos exportados a Google Sheets`,
        })
      } else {
        toast({
          title: "Error en la exportación",
          description: data.message || "No se pudo exportar a Google Sheets",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al exportar los datos",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "connected":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <TestTube className="w-3 h-3 mr-1" />
            Sin probar
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Integración con Google Sheets
            {getStatusBadge()}
          </CardTitle>
          <CardDescription>
            Gestiona la sincronización automática de pedidos con Google Sheets para backup y procesamiento externo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={testConnection} disabled={isTesting} variant="outline" className="flex-1 bg-transparent">
              {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
              Probar Conexión
            </Button>
            <Button onClick={exportToSheets} disabled={isExporting} className="flex-1">
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Exportar Todos los Pedidos
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Configuración Requerida</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                • <strong>GOOGLE_SHEETS_CLIENT_EMAIL:</strong> Email de la cuenta de servicio
              </p>
              <p>
                • <strong>GOOGLE_SHEETS_PRIVATE_KEY:</strong> Clave privada de la cuenta de servicio
              </p>
              <p>
                • <strong>GOOGLE_SHEETS_SPREADSHEET_ID:</strong> ID de la hoja de cálculo
              </p>
              <p>
                • <strong>GOOGLE_SHEETS_SHEET_NAME:</strong> Nombre de la hoja (opcional, por defecto "Pedidos")
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Funcionalidades</h4>
            <div className="text-sm text-green-800 space-y-1">
              <p>✓ Sincronización automática de nuevos pedidos</p>
              <p>✓ Exportación manual de todos los pedidos</p>
              <p>✓ Creación automática de hojas y encabezados</p>
              <p>✓ Formato profesional con colores y estilos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

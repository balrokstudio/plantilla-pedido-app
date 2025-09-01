import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ZonesHelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Formulario
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Guía de Zonas del Pie</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprenda las diferentes zonas del pie para seleccionar las opciones correctas
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600 dark:text-blue-400">Zona 1 - Antepié</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Área de los dedos y metatarsianos. Incluye las cabezas de los metatarsianos y los dedos del pie.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Opciones disponibles:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Almohadilla metatarsal: Para aliviar presión en cabezas metatarsales</li>
                    <li>Barra retrocapital: Redistribuye la carga del antepié</li>
                    <li>Descarga 1er metatarsiano: Específica para problemas del primer metatarsiano</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">Zona 2 - Mediopié</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Área del arco longitudinal del pie. Incluye el arco interno y la zona navicular.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Opciones disponibles:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Soporte arco longitudinal: Para pie plano o arco caído</li>
                    <li>Almohadilla navicular: Soporte específico del hueso navicular</li>
                    <li>Corrección pronación: Para corregir exceso de pronación</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600 dark:text-purple-400">Zona 3 - Retropié</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Área del talón y calcáneo. Incluye toda la zona posterior del pie.
                </p>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Opciones disponibles:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Talonera: Amortiguación y soporte del talón</li>
                    <li>Descarga calcáneo: Para aliviar presión en el hueso calcáneo</li>
                    <li>Corrección varo/valgo: Para corregir desviaciones del retropié</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600 dark:text-orange-400">Zona 4 - Dedos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Área específica de los dedos del pie. Para correcciones y alivio de presión digital.
                </p>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Opciones disponibles:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Separador dedos: Para separar dedos superpuestos</li>
                    <li>Almohadilla digital: Protección y amortiguación de dedos</li>
                    <li>Corrección hallux: Específica para problemas del dedo gordo</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Zona 5 - Borde Externo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Borde lateral del pie. Incluye el área del quinto metatarsiano y borde externo.
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Opciones disponibles:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Almohadilla lateral: Protección del borde externo</li>
                    <li>Descarga 5to metatarsiano: Para problemas del quinto metatarsiano</li>
                    <li>Corrección supinación: Para corregir exceso de supinación</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Link href="/">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Volver al Formulario de Pedido
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

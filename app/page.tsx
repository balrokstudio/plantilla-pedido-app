import { OrderForm } from "@/components/order-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-balance">Sistema de Pedidos</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 text-balance">
              Plantillas Ortopédicas Personalizadas
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800 dark:text-gray-100">Nuevo Pedido</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Complete el formulario para solicitar sus plantillas ortopédicas personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

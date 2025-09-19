import { OrderForm } from "@/components/order-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 pt-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:gap-6">
              <div className="shrink-0">
                <Image
                  src="/Logo-Under-Feet-green-.png"
                  alt="Under Feet logo"
                  width={320}
                  height={320}
                  className="w-32 h-auto md:w-40 lg:w-48 drop-shadow-md"
                  priority
                />
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-4xl font-bold text-gray-600 dark:text-white leading-tight text-balance">Sistema de Pedidos</h1>
                <p className="mt-1 text-lg md:text-xl text-gray-600 dark:text-gray-300 text-balance">Plantillas Ortopédicas Personalizadas</p>
              </div>
            </div>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
               
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

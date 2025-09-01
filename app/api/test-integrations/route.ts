import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const testResults = {
      database: { status: "unknown", message: "" },
      email: { status: "unknown", message: "" },
      googleSheets: { status: "unknown", message: "" },
    }

    // Test database connection
    try {
      const { data, error } = await supabase.from("app_settings").select("key").limit(1)

      if (error) throw error

      testResults.database = {
        status: "success",
        message: "Conexión a base de datos exitosa",
      }
    } catch (error) {
      testResults.database = {
        status: "error",
        message: "Error de conexión a base de datos",
      }
    }

    // Test email integration (placeholder)
    testResults.email = {
      status: "pending",
      message: "Integración de email no configurada",
    }

    // Test Google Sheets integration (placeholder)
    testResults.googleSheets = {
      status: "pending",
      message: "Integración de Google Sheets no configurada",
    }

    const allSuccessful = Object.values(testResults).every((test) => test.status === "success")

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful
        ? "Todas las integraciones funcionan correctamente"
        : "Algunas integraciones requieren atención",
      results: testResults,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in test integrations API:", error)

    return NextResponse.json({ success: false, message: "Error al probar las integraciones" }, { status: 500 })
  }
}

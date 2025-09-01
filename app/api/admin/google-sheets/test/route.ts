import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { testGoogleSheetsConnection } from "@/lib/google-sheets"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check admin authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Test Google Sheets connection
    const connectionSuccess = await testGoogleSheetsConnection()

    return NextResponse.json({
      success: connectionSuccess,
      message: connectionSuccess
        ? "Conexión con Google Sheets exitosa"
        : "Error de conexión con Google Sheets. Verifica la configuración.",
    })
  } catch (error) {
    console.error("Error testing Google Sheets connection:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';

export async function GET() {
  try {
    console.log('🔍 Iniciando prueba de Google Sheets...');
    
    // Probar conexión básica
    const testData = {
      orderId: `TEST-${Date.now()}`,
      firstName: 'Test',
      lastName: 'User',
      customerEmail: 'test@example.com',
      customerPhone: '123456789',
      submittedAt: new Date().toISOString(),
      status: 'test',
      products: [
        {
          productType: 'Test Product',
          zoneOption1: 'Test 1',
          zoneOption2: 'Test 2',
          zoneOption3: 'Test 3',
          zoneOption4: 'Test 4',
          zoneOption5: 'Test 5',
          heelHeight: 'Test',
          posteriorWedge: 'Test',
        }
      ],
      notes: 'Esta es una prueba de conexión con Google Sheets'
    };

    console.log('📤 Enviando datos de prueba a Google Sheets...');
    const result = await googleSheetsService.addOrderToSheet(testData);
    
    if (result.success) {
      console.log('✅ Prueba exitosa! Los datos se han enviado correctamente a Google Sheets');
      return NextResponse.json({
        success: true,
        message: 'Conexión exitosa con Google Sheets',
        details: result.details
      });
    } else {
      console.error('❌ Error al enviar los datos a Google Sheets:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Error desconocido',
          details: result.details
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error en la prueba de Google Sheets:', error);
    
    let errorMessage = 'Error desconocido';
    let statusCode = 500;
    
    if (error.response) {
      // Error de la API de Google
      errorMessage = `Error de la API de Google (${error.response.status})`;
      statusCode = error.response.status;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error.response?.data || {}
      },
      { status: statusCode }
    );
  }
}

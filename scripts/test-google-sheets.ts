import dotenv from 'dotenv';

dotenv.config();

async function testGoogleSheets() {
  console.log('=== Iniciando prueba de Google Sheets ===');
  
  // Verificar variables de entorno
  const requiredVars = [
    'GOOGLE_SHEETS_CLIENT_EMAIL',
    'GOOGLE_SHEETS_PRIVATE_KEY',
    'GOOGLE_SHEETS_SPREADSHEET_ID',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌ Error: La variable de entorno ${varName} no está definida`);
      return;
    }
  }

  console.log('✅ Variables de entorno verificadas correctamente');

  try {
    // Usar el servicio exportado desde ../lib/google-sheets
    const { googleSheetsService } = await import('../lib/google-sheets');

    // 1. Probar conexión
    console.log('\n🔌 Probando conexión...');
    const canConnect = await googleSheetsService.testConnection();
    console.log(canConnect ? '✅ Conexión OK' : '⚠️ No se pudo verificar la conexión');

    // 2. Probar escritura con el formato esperado por OrderSheetData
    console.log('\n✏️ Probando escritura en la hoja...');
    const testData = {
      orderId: `TEST-${Date.now()}`,
      firstName: 'Test',
      lastName: 'User',
      customerEmail: 'test@example.com',
      customerPhone: '123456789',
      submittedAt: new Date().toISOString(),
      status: 'pendiente',
      products: [
        {
          productType: 'Plantilla',
          posteriorWedge: 'N/A',
          templateColor: 'Rojo',
          templateSize: 'M',
          forefootMetatarsal: 'Normal',
          anteriorWedge: 'N/A',
          midfootArch: 'Medio',
          midfootExternalWedge: 'N/A',
          rearfootCalcaneus: 'Neutro',
          heelRaiseMm: '0',
        },
      ],
      notes: 'Esta es una prueba de conexión',
    };

    console.log('Enviando datos de prueba a Google Sheets...');
    const result = await googleSheetsService.addOrderToSheet(testData);
    
    if (result.success) {
      console.log('✅ Prueba exitosa! Los datos se han enviado correctamente a Google Sheets');
      console.log('Resultado:', result);
    } else {
      console.error('❌ Error al enviar los datos a Google Sheets');
      console.error('Error:', result.error);
    }
  } catch (error: unknown) {
    console.error('❌ Error en la prueba de Google Sheets:');
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(error);
    }
    
    // Manejo de errores con forma similar a Axios (error.response)
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const resp = (error as { response?: { status?: unknown; data?: unknown } }).response;
      console.error('Detalles del error de la API de Google:');
      console.error('Status:', resp?.status);
      console.error('Data:', resp?.data);
    }
  }
}

testGoogleSheets().catch(console.error);

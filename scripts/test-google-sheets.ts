import { GoogleSheetsService } from '../lib/google-sheets';
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
    const service = new GoogleSheetsService();
    
    // 1. Obtener información de la hoja
    console.log('\n🔍 Obteniendo información de la hoja...');
    const sheets = await service['getSheets']();
    console.log('Hojas disponibles en el documento:');
    sheets.forEach(sheet => {
      console.log(`- ${sheet.properties?.title} (ID: ${sheet.properties?.sheetId})`);
    });

    // 2. Probar escritura
    console.log('\n✏️ Probando escritura en la hoja...');
    const testData = {
      fecha: new Date().toISOString(),
      nombre: 'Test User',
      email: 'test@example.com',
      telefono: '123456789',
      direccion: 'Calle de prueba 123',
      notas: 'Esta es una prueba de conexión',
      productos: [
        { nombre: 'Producto de prueba 1', cantidad: 1, talla: 'M', color: 'Rojo' },
        { nombre: 'Producto de prueba 2', cantidad: 2, talla: 'L', color: 'Azul' }
      ]
    };

    console.log('Enviando datos de prueba a Google Sheets...');
    const result = await service.addOrderToSheet(testData);
    
    if (result.success) {
      console.log('✅ Prueba exitosa! Los datos se han enviado correctamente a Google Sheets');
      console.log('Resultado:', result);
    } else {
      console.error('❌ Error al enviar los datos a Google Sheets');
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Error en la prueba de Google Sheets:');
    console.error(error);
    
    if (error.response) {
      console.error('Detalles del error de la API de Google:');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testGoogleSheets().catch(console.error);

// @ts-check
const { google } = require('googleapis');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Iniciando prueba de conexión a Google Sheets...');
  
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // 1. Probar autenticación
    console.log('🔑 Probando autenticación...');
    await auth.authorize();
    console.log('✅ Autenticación exitosa');

    // 2. Obtener información de la hoja
    console.log('📄 Obteniendo información de la hoja...');
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      fields: 'properties.title,sheets.properties.title',
    });

    console.log('\n📊 Información del documento:');
    const title = response?.data?.properties?.title ?? '(sin título)';
    console.log(`Título: ${title}`);
    console.log('Hojas disponibles:');
    const sheetList = response?.data?.sheets;
    if (Array.isArray(sheetList)) {
      sheetList.forEach((sheet, i) => {
        const sheetTitle = sheet?.properties?.title ?? '(sin nombre)';
        console.log(`  ${i + 1}. ${sheetTitle}`);
      });
    } else {
      console.log('  (ninguna hoja encontrada)');
    }

    console.log('\n✅ Prueba completada con éxito');
  } catch (error) {
    console.error('\n❌ Error en la prueba de conexión:');
    
    if (error.code === 403) {
      console.error('Error 403: Permiso denegado');
      console.error('Por favor verifica que:');
      console.error('1. La cuenta de servicio tenga acceso a la hoja de cálculo');
      console.error('2. El ID de la hoja de cálculo sea correcto');
      console.error('3. La clave privada sea la correcta y esté bien formateada');
    } else if (error.code === 404) {
      console.error('Error 404: No se encontró la hoja de cálculo');
      console.error('Verifica que el ID de la hoja de cálculo sea correcto');
    } else if (error.errors) {
      error.errors.forEach(err => {
        console.error(`- ${err.message}`);
      });
    } else {
      console.error(error);
    }
  }
}

testConnection().catch(console.error);

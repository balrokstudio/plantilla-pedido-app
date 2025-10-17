import { GoogleAuth } from "google-auth-library"
import { type sheets_v4, google } from "googleapis"

interface OrderSheetData {
  orderId: string
  // Nuevo formato: nombre y apellido por separado
  firstName?: string
  lastName?: string
  // Compatibilidad previa: nombre completo (se dividirá si no se proveen first/last)
  customerName?: string
  customerEmail?: string
  customerPhone: string
  submittedAt: string
  status?: string
  products: Array<{
    productType: string
    // Datos del paciente por producto
    patientName?: string
    patientLastname?: string
    // Legacy (opcionales con el nuevo esquema)
    zoneOption1?: string
    zoneOption2?: string
    zoneOption3?: string
    zoneOption4?: string
    zoneOption5?: string
    heelHeight?: string
    // Nuevos campos
    templateColor?: string
    templateSize?: string
    forefootMetatarsal?: string
    forefootMetatarsalLeft?: string
    anteriorWedge?: string
    anteriorWedgeMm?: string
    anteriorWedgeLeft?: string
    anteriorWedgeLeftMm?: string
    midfootArch?: string
    midfootArchLeft?: string
    midfootExternalWedge?: string
    rearfootCalcaneus?: string
    rearfootCalcaneusLeft?: string
    heelRaiseMm?: string
    heelRaiseLeftMm?: string
    posteriorWedge?: string
    posteriorWedgeMm?: string
    posteriorWedgeLeft?: string
    posteriorWedgeLeftMm?: string
  }>
  notes?: string
}
class GoogleSheetsService {
  private auth: GoogleAuth
  private sheets: sheets_v4.Sheets

  constructor() {
    try {
      console.log(' Inicializando GoogleSheetsService...');
      
      // Sanitize private key: remove surrounding quotes and normalize newlines
      const rawPrivateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
      console.log(' Raw private key from env:', rawPrivateKey ? '***PRIVATE_KEY_PRESENT***' : 'MISSING');
      
      const privateKey = rawPrivateKey
        ?.replace(/^"|"$/g, '')  // Remove surrounding quotes if present
        ?.replace(/\\n/g, '\n');  // Convert escaped newlines to actual newlines
      
      const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

      console.log(' Configuración:');
      console.log('- Client Email:', clientEmail || 'MISSING');
      console.log('- Spreadsheet ID:', spreadsheetId || 'MISSING');
      console.log('- Private Key:', privateKey ? '***PRESENT***' : 'MISSING');

      if (!clientEmail || !privateKey || !spreadsheetId) {
        const missing = [];
        if (!clientEmail) missing.push('GOOGLE_SHEETS_CLIENT_EMAIL');
        if (!privateKey) missing.push('GOOGLE_SHEETS_PRIVATE_KEY');
        if (!spreadsheetId) missing.push('GOOGLE_SHEETS_SPREADSHEET_ID');
        
        const errorMsg = `Missing required Google Sheets environment variables: ${missing.join(', ')}`;
        console.error(' Error:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log(' Inicializando autenticación...');
      this.auth = new GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      console.log(' Inicializando cliente de Google Sheets...');
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      console.log(' GoogleSheetsService inicializado correctamente');
    } catch (error) {
      console.error(' Error al inicializar GoogleSheetsService:', error);
      throw error; // Relanzar para manejo posterior
    }
  }

  async ensureSheetExists(sheetName: string): Promise<boolean> {
    try {
      console.log(` Verificando si la hoja '${sheetName}' existe...`);
      
      // Primero, obtener información de la hoja de cálculo
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        fields: 'sheets.properties.title',
      });

      // Mostrar todas las hojas disponibles
      const sheetTitles = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title) || [];
      console.log(' Hojas disponibles:', sheetTitles.join(', '));

      // Verificar si la hoja ya existe
      const sheetExists = spreadsheet.data.sheets?.some(
        (sheet) => sheet.properties?.title === sheetName
      );

      if (!sheetExists) {
        console.log(` La hoja '${sheetName}' no existe, creándola...`);
        // Crear la hoja si no existe
        const response = await this.sheets.spreadsheets.batchUpdate(
          {
            spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: sheetName,
                      gridProperties: {
                        rowCount: 1000,
                        columnCount: 30,
                      },
                    },
                  },
                },
              ],
            },
          },
          {}
        );
        
        console.log(` Hoja '${sheetName}' creada exitosamente`);
        console.log('Respuesta de creación de hoja:', JSON.stringify(response.data, null, 2));
      } else {
        console.log(` La hoja '${sheetName}' ya existe`);
      }

      return true;
    } catch (error: any) {
      console.error(" Error al verificar/crear la hoja:", error);
      if (error.response) {
        console.error('Detalles del error de la API de Google:');
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      return false;
    }
  }

  private async addHeaders(sheetName: string): Promise<boolean> {
    try {
      console.log(` Agregando encabezados a la hoja '${sheetName}'...`);
      
      const layout = process.env.GOOGLE_SHEETS_LAYOUT === "rows" ? "rows" : "columns"
      console.log(` Layout de encabezados: ${layout}`);
      
      const headers =
        layout === "rows"
          ? [
              // Una fila por pedido (metadatos) y un set de producto; productos extra se apilan en filas siguientes
              "Timestamp",
              "Orden ID",
              "Empresa / Profesional",
              "Email",
              "Teléfono",
              "Nombre del Paciente",
              "Apellido del Paciente",
              "Tipo Plantilla",
              "Talle",
              "Color",
              "Antepié - Zona metatarsal (Pie Izquierdo)",
              "Antepié - Zona metatarsal (Pie Derecho)",
              "Cuña Anterior (Pie Izquierdo)",
              "Cuña Anterior Espesor - Pie Izquierdo (mm)",
              "Cuña Anterior (Pie Derecho)",
              "Cuña Anterior Espesor - Pie Derecho (mm)",
              "Mediopié - Zona del arco (Pie Izquierdo)",
              "Mediopié - Zona del arco (Pie Derecho)",
              "Retropié - Zona calcáneo (Pie Izquierdo)",
              "Realce en talón - Pie Izquierdo (mm)",
              "Retropié - Zona calcáneo (Pie Derecho)",
              "Realce en talón - Pie Derecho (mm)",
              "Cuña Posterior (Pie Izquierdo)",
              "Cuña Posterior Espesor - Pie Izquierdo (mm)",
              "Cuña Posterior (Pie Derecho)",
              "Cuña Posterior Espesor - Pie Derecho (mm)",
              "Observaciones",
            ]
          : [
              // Layout horizontal: misma estructura en una fila, un solo set de producto
              "Timestamp",
              "Orden ID",
              "Empresa / Profesional",
              "Email",
              "Teléfono",
              "Nombre del Paciente",
              "Apellido del Paciente",
              "Tipo Plantilla",
              "Talle",
              "Color",
              "Antepié - Zona metatarsal (Pie Izquierdo)",
              "Antepié - Zona metatarsal (Pie Derecho)",
              "Cuña Anterior (Pie Izquierdo)",
              "Cuña Anterior Espesor - Pie Izquierdo (mm)",
              "Cuña Anterior (Pie Derecho)",
              "Cuña Anterior Espesor - Pie Derecho (mm)",
              "Mediopié - Zona del arco (Pie Izquierdo)",
              "Mediopié - Zona del arco (Pie Derecho)",
              "Retropié - Zona calcáneo (Pie Izquierdo)",
              "Realce en talón - Pie Izquierdo (mm)",
              "Retropié - Zona calcáneo (Pie Derecho)",
              "Realce en talón - Pie Derecho (mm)",
              "Cuña Posterior (Pie Izquierdo)",
              "Cuña Posterior Espesor - Pie Izquierdo (mm)",
              "Cuña Posterior (Pie Derecho)",
              "Cuña Posterior Espesor - Pie Derecho (mm)",
              "Observaciones",
            ]

      console.log(' Actualizando encabezados de la hoja');
      const updateResponse = await this.sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: `${sheetName}!A1:AZ1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [headers],
        },
      })

      if (updateResponse.status !== 200) {
        console.warn(` La actualización de encabezados respondió con status ${updateResponse.status}`)
        return false
      }
    
      // Format headers (best-effort): resolve sheetId dynamically to avoid hardcoded 0
      console.log(' Aplicando formato a los encabezados');
      try {
        const meta = await this.sheets.spreadsheets.get({ 
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          fields: 'sheets(properties(sheetId,title))'
        })
        const targetSheet = meta.data.sheets?.find((s) => s.properties?.title === sheetName)
        const sheetId = targetSheet?.properties?.sheetId
        
        if (sheetId != null) {
          console.log(` Encontrado sheetId: ${sheetId} para la hoja '${sheetName}'`)
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: headers.length,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.2, green: 0.6, blue: 0.9 },
                      textFormat: {
                        foregroundColor: { red: 1, green: 1, blue: 1 },
                        bold: true,
                      },
                    },
                  },
                  fields: "userEnteredFormat(backgroundColor,textFormat)",
                },
              },
            ],
          },
        })
      } else {
        // If we cannot resolve the sheetId, skip formatting but keep headers written
        const warningMsg = ` No se pudo encontrar el sheetId para la hoja '${sheetName}'. Se omitirá el formato de los encabezados.`
        console.warn(warningMsg)
        return true // Headers were still written, just not formatted
      }
    } catch (fmtErr) {
      // Do not block sheet creation if formatting fails
      console.warn(" Se omitió el formato de los encabezados debido a un error:", fmtErr)
      return true // Headers were still written, just not formatted
    }
    
    console.log(' Encabezados actualizados exitosamente')
    return true
    
    } catch (error: any) {
      const errorMsg = ` Error al agregar encabezados: ${error instanceof Error ? error.message : String(error)}`
      console.error(errorMsg)
      return false
    }
  }

  private buildOrderRows(orderData: OrderSheetData): any[][] {
    // Genera múltiples filas para un pedido: la primera con metadatos + primer producto,
    // filas siguientes solo con datos de producto desde la columna H.
    const firstName = orderData.firstName || orderData.customerName?.split(' ')[0] || ''
    const lastName = orderData.lastName || orderData.customerName?.split(' ').slice(1).join(' ') || ''

    const products = orderData.products && orderData.products.length > 0 ? orderData.products : [{} as any]

    const rows: any[][] = []

    // Formatear timestamp en zona horaria de Argentina (UTC-3)
    const formatTimestamp = () => {
      const date = new Date()
      // Convertir a zona horaria de Argentina (America/Argentina/Buenos_Aires)
      const argDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
      const year = argDate.getFullYear()
      const month = String(argDate.getMonth() + 1).padStart(2, '0')
      const day = String(argDate.getDate()).padStart(2, '0')
      const hours = String(argDate.getHours()).padStart(2, '0')
      const minutes = String(argDate.getMinutes()).padStart(2, '0')
      const seconds = String(argDate.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    products.forEach((p, idx) => {
      const baseCols = idx === 0
        ? [
            formatTimestamp(), // Timestamp en zona horaria Argentina
            orderData.orderId || '',
            `${firstName} ${lastName}`.trim(), // Empresa / Profesional
            orderData.customerEmail || '',
            orderData.customerPhone || '',
          ]
        : [
            '', // Timestamp vacío para filas de productos adicionales
            '', // Orden ID
            '', // Empresa / Profesional
            '', // Email
            '', // Teléfono
          ]

      const productCols = [
        p.patientName || '',
        p.patientLastname || '',
        p.productType || '',
        p.templateSize || '',
        p.templateColor || '',
        p.forefootMetatarsalLeft || '',
        p.forefootMetatarsal || '',
        p.anteriorWedgeLeft || '',
        p.anteriorWedgeLeftMm || '',
        p.anteriorWedge || '',
        p.anteriorWedgeMm || '',
        p.midfootArchLeft || '',
        p.midfootArch || '',
        p.rearfootCalcaneusLeft || '',
        p.heelRaiseLeftMm || '',
        p.rearfootCalcaneus || '',
        p.heelRaiseMm || '',
        p.posteriorWedgeLeft || '',
        p.posteriorWedgeLeftMm || '',
        p.posteriorWedge || '',
        p.posteriorWedgeMm || '',
      ]

      const noteCol = idx === 0 ? [orderData.notes || ''] : ['']

      rows.push([...baseCols, ...productCols, ...noteCol])
    })

    return rows
  }

  async addOrderToSheet(orderData: OrderSheetData): Promise<{
    success: boolean
    error?: string
    details?: any
  }> {
    console.log(' Iniciando addOrderToSheet...');
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Pedidos';
    
    try {
      console.log(` Procesando orden para la hoja: '${sheetName}'`);
      console.log(' Datos de la orden:', JSON.stringify(orderData, null, 2));

      // 1. Verificar que la hoja exista
      console.log(' Verificando existencia de la hoja...');
      const sheetExists = await this.ensureSheetExists(sheetName);
      if (!sheetExists) {
        const errorMsg = `No se pudo verificar/crear la hoja: ${sheetName}`;
        console.error(' Error:', errorMsg);
        return { success: false, error: errorMsg };
      }

      // 2. Agregar encabezados si es necesario
      console.log(' Verificando encabezados...');
      await this.addHeaders(sheetName);

      // 3. Formatear los datos (múltiples filas por pedido si hay varios productos)
      console.log(' Formateando datos de la orden...');
      const rows = this.buildOrderRows(orderData);
      console.log(' Filas formateadas para la hoja:', rows);

      // 4. Preparar la solicitud
      const request = {
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: `${sheetName}!A:AZ`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        includeValuesInResponse: true,
        requestBody: {
          values: rows,
        },
      };

      console.log(' Enviando datos a Google Sheets...');
      console.log('URL de la hoja:', `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_SPREADSHEET_ID}/edit#gid=0`);
      
      // 5. Enviar los datos
      const response = await this.sheets.spreadsheets.values.append(request);
      
      console.log(' Datos agregados exitosamente a Google Sheets');
      console.log(' Respuesta de la API:', JSON.stringify({
        updatedRange: response.data.updates?.updatedRange,
        updatedRows: response.data.updates?.updatedRows,
        updatedColumns: response.data.updates?.updatedColumns,
        updatedCells: response.data.updates?.updatedCells,
      }, null, 2));
      
      return { 
        success: true, 
        details: {
          updatedRange: response.data.updates?.updatedRange,
          updatedCells: response.data.updates?.updatedCells,
        }
      };
      
    } catch (error: any) {
      console.error(' Error en addOrderToSheet:');
      console.error(error);
      
      let errorMessage = 'Error desconocido al agregar a la hoja';
      let errorDetails = {};
      
      if (error.response) {
        // Error de la API de Google
        errorMessage = `Error de la API de Google (${error.response.status})`;
        errorDetails = {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        };
        
        if (error.response.status === 403) {
          errorMessage = 'Permiso denegado. Verifica que la cuenta de servicio tenga acceso a la hoja.';
        } else if (error.response.status === 404) {
          errorMessage = 'Hoja de cálculo no encontrada. Verifica el ID de la hoja.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Detalles del error:', JSON.stringify(errorDetails, null, 2));
      
      return { 
        success: false, 
        error: errorMessage,
        details: errorDetails,
      };
    }
  }

  async exportAllOrders(orders: OrderSheetData[]): Promise<boolean> {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
      const sheetName = `Export_${new Date().toISOString().split("T")[0]}`

      if (!spreadsheetId) {
        console.error(" Error: GOOGLE_SHEETS_SPREADSHEET_ID no configurado")
        return false
      }

      // Create new sheet for export
      const sheetReady = await this.ensureSheetExists(sheetName)
      if (!sheetReady) {
        return false
      }

      // Encabezados para la hoja de exportación
      await this.addHeaders(sheetName)

      // Preparar datos: múltiples filas por pedido
      const allRows = orders.flatMap((order) => this.buildOrderRows(order))

      // Escribir todas las filas de una vez
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A2:AZ${allRows.length + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: allRows,
        },
      })

      return true
    } catch (error) {
      console.error(" Error exporting orders to sheet:", error)
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
      const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL
      const rawPrivateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY
      const privateKey = rawPrivateKey?.replace(/^"|"$/g, "")?.replace(/\\n/g, "\n")

      if (!clientEmail || !privateKey || !spreadsheetId) {
        console.warn(
          " Error: variables incompletas. Requiere GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY y GOOGLE_SHEETS_SPREADSHEET_ID",
          "Google Sheets: variables incompletas. Requiere GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY y GOOGLE_SHEETS_SPREADSHEET_ID",
        )
        return false
      }

      await this.sheets.spreadsheets.get({ spreadsheetId })
      return true
    } catch (error) {
      console.error("Google Sheets: prueba de conexión fallida:", error)
      return false
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()

export async function addOrderToGoogleSheets(orderData: OrderSheetData): Promise<boolean> {
  const res = await googleSheetsService.addOrderToSheet(orderData)
  return res.success === true
}

export async function exportOrdersToGoogleSheets(orders: OrderSheetData[]): Promise<boolean> {
  return await googleSheetsService.exportAllOrders(orders)
}

export async function testGoogleSheetsConnection(): Promise<boolean> {
  return await googleSheetsService.testConnection()
}

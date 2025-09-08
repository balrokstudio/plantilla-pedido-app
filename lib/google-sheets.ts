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
    // Legacy (opcionales con el nuevo esquema)
    zoneOption1?: string
    zoneOption2?: string
    zoneOption3?: string
    zoneOption4?: string
    zoneOption5?: string
    heelHeight?: string
    posteriorWedge: string
    // Nuevos campos
    templateColor?: string
    templateSize?: string
    forefootMetatarsal?: string
    anteriorWedge?: string
    midfootArch?: string
    midfootExternalWedge?: string
    rearfootCalcaneus?: string
    heelRaiseMm?: string
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
            // Layout por fila (una fila por producto)
            "Timestamp",
            "Orden ID",
            "Estado",
            "Nombre",
            "Apellido",
            "Teléfono",
            "Producto - Tipo",
            "Color",
            "Talle",
            "Zona 1",
            "Zona 2",
            "Zona 3",
            "Zona 4",
            "Zona 5",
            "Antepié (Metatarsal)",
            "Cuña Anterior",
            "Mediopié (Arco)",
            "Cuña Mediopié Externa",
            "Retropié (Calcáneo)",
            "Realce Talón (mm)",
            "Altura Talón",
            "Cuña Posterior",
            "Observaciones",
          ]
        : [
            // Layout horizontal (existente)
            "Timestamp",
            "Nombre",
            "Apellido",
            "Teléfono",
            // Campos de productos (horizontal)
            "Producto 1 - Tipo",
            "Producto 1 - Color",
            "Producto 1 - Talle",
            "Producto 1 - Zona 1",
            "Producto 1 - Zona 2",
            "Producto 1 - Zona 3",
            "Producto 1 - Zona 4",
            "Producto 1 - Zona 5",
            "Producto 1 - Antepié (Metatarsal)",
            "Producto 1 - Cuña Anterior",
            "Producto 1 - Mediopié (Arco)",
            "Producto 1 - Cuña Mediopié Externa",
            "Producto 1 - Retropié (Calcáneo)",
            "Producto 1 - Realce Talón (mm)",
            "Producto 1 - Altura Talón",
            "Producto 1 - Cuña Posterior",
            "Producto 2 - Tipo",
            "Producto 2 - Color",
            "Producto 2 - Talle",
            "Producto 2 - Zona 1",
            "Producto 2 - Zona 2",
            "Producto 2 - Zona 3",
            "Producto 2 - Zona 4",
            "Producto 2 - Zona 5",
            "Producto 2 - Antepié (Metatarsal)",
            "Producto 2 - Cuña Anterior",
            "Producto 2 - Mediopié (Arco)",
            "Producto 2 - Cuña Mediopié Externa",
            "Producto 2 - Retropié (Calcáneo)",
            "Producto 2 - Realce Talón (mm)",
            "Producto 2 - Altura Talón",
            "Producto 2 - Cuña Posterior",
            // Notas al final
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

  private formatOrderData(orderData: OrderSheetData): any[] {
    // Formato de datos para Google Sheets
    const rowData = [
      new Date().toISOString(), // Timestamp
      orderData.orderId || '',
      orderData.status || 'pendiente',
      orderData.firstName || orderData.customerName?.split(' ')[0] || '',
      orderData.lastName || orderData.customerName?.split(' ').slice(1).join(' ') || '',
      orderData.customerEmail || '',
      orderData.customerPhone || '',
      '', // Dirección (no está en el tipo actual)
      '', // Código Postal
      '', // Ciudad
      '', // Provincia
      '', // País
      // Producto 1
      orderData.products[0]?.productType || '',
      orderData.products[0]?.zoneOption1 || '',
      orderData.products[0]?.zoneOption2 || '',
      orderData.products[0]?.zoneOption3 || '',
      orderData.products[0]?.zoneOption4 || '',
      orderData.products[0]?.zoneOption5 || '',
      orderData.products[0]?.templateColor || '',
      orderData.products[0]?.templateSize || '',
      orderData.products[0]?.forefootMetatarsal || '',
      orderData.products[0]?.anteriorWedge || '',
      orderData.products[0]?.midfootArch || '',
      orderData.products[0]?.midfootExternalWedge || '',
      orderData.products[0]?.rearfootCalcaneus || '',
      orderData.products[0]?.heelRaiseMm || '',
      orderData.products[0]?.heelHeight || '',
      orderData.products[0]?.posteriorWedge || '',
      // Producto 2 (si existe)
      orderData.products[1]?.productType || '',
      orderData.products[1]?.zoneOption1 || '',
      orderData.products[1]?.zoneOption2 || '',
      orderData.products[1]?.zoneOption3 || '',
      orderData.products[1]?.zoneOption4 || '',
      orderData.products[1]?.zoneOption5 || '',
      orderData.products[1]?.templateColor || '',
      orderData.products[1]?.templateSize || '',
      orderData.products[1]?.forefootMetatarsal || '',
      orderData.products[1]?.anteriorWedge || '',
      orderData.products[1]?.midfootArch || '',
      orderData.products[1]?.midfootExternalWedge || '',
      orderData.products[1]?.rearfootCalcaneus || '',
      orderData.products[1]?.heelRaiseMm || '',
      orderData.products[1]?.heelHeight || '',
      orderData.products[1]?.posteriorWedge || '',
      // Notas
      orderData.notes || ''
    ];

    return rowData;
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

      // 3. Formatear los datos
      console.log(' Formateando datos de la orden...');
      const rowData = this.formatOrderData(orderData);
      console.log(' Datos formateados para la hoja:', rowData);

      // 4. Preparar la solicitud
      const request = {
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        includeValuesInResponse: true,
        requestBody: {
          values: [rowData],
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

      // Prepare all data
      const allData = orders.map((order) => {
        const rowData = [
          order.orderId,
          new Date(order.submittedAt).toLocaleDateString("es-ES"),
          order.customerName,
          order.customerEmail,
          order.customerPhone || "",
          order.status,
        ]

        // Add product data
        for (let i = 0; i < 2; i++) {
          const product = order.products[i]
          if (product) {
            rowData.push(
              product.productType,
              product.templateColor || "",
              product.templateSize || "",
              product.zoneOption1,
              product.zoneOption2,
              product.zoneOption3,
              product.zoneOption4,
              product.zoneOption5,
              product.forefootMetatarsal || "",
              product.anteriorWedge || "",
              product.midfootArch || "",
              product.midfootExternalWedge || "",
              product.rearfootCalcaneus || "",
              product.heelRaiseMm || "",
              product.heelHeight,
              product.posteriorWedge,
            )
          } else {
            rowData.push(
              "", // Tipo
              "", // Color
              "", // Talle
              "", // Zona 1
              "", // Zona 2
              "", // Zona 3
              "", // Zona 4
              "", // Zona 5
              "", // Antepié
              "", // Cuña Anterior
              "", // Mediopié Arco
              "", // Cuña Mediopié Externa
              "", // Retropié Calcáneo
              "", // Realce mm
              "", // Altura Talón
              "", // Cuña Posterior
            )
          }
        }

        // Observaciones al final
        rowData.push(order.notes || "")

        return rowData
      })

      // Write all data at once
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A2:AZ${allData.length + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: allData,
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

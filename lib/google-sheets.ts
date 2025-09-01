import { GoogleAuth } from "google-auth-library"
import { type sheets_v4, google } from "googleapis"

interface OrderSheetData {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  submittedAt: string
  status: string
  products: Array<{
    productType: string
    zoneOption1: string
    zoneOption2: string
    zoneOption3: string
    zoneOption4: string
    zoneOption5: string
    heelHeight: string
    posteriorWedge: string
  }>
}

class GoogleSheetsService {
  private auth: GoogleAuth
  private sheets: sheets_v4.Sheets

  constructor() {
    this.auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    this.sheets = google.sheets({ version: "v4", auth: this.auth })
  }

  async ensureSheetExists(spreadsheetId: string, sheetName: string): Promise<boolean> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      })

      const sheetExists = response.data.sheets?.some((sheet) => sheet.properties?.title === sheetName)

      if (!sheetExists) {
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName,
                    gridProperties: {
                      rowCount: 1000,
                      columnCount: 20,
                    },
                  },
                },
              },
            ],
          },
        })

        // Add headers
        await this.addHeaders(spreadsheetId, sheetName)
      }

      return true
    } catch (error) {
      console.error("Error ensuring sheet exists:", error)
      return false
    }
  }

  private async addHeaders(spreadsheetId: string, sheetName: string): Promise<void> {
    const headers = [
      "ID Pedido",
      "Fecha",
      "Cliente",
      "Email",
      "Teléfono",
      "Estado",
      "Producto 1 - Tipo",
      "Producto 1 - Zona 1",
      "Producto 1 - Zona 2",
      "Producto 1 - Zona 3",
      "Producto 1 - Zona 4",
      "Producto 1 - Zona 5",
      "Producto 1 - Altura Talón",
      "Producto 1 - Cuña Posterior",
      "Producto 2 - Tipo",
      "Producto 2 - Zona 1",
      "Producto 2 - Zona 2",
      "Producto 2 - Zona 3",
      "Producto 2 - Zona 4",
      "Producto 2 - Zona 5",
    ]

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:T1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers],
      },
    })

    // Format headers
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
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
  }

  async addOrderToSheet(orderData: OrderSheetData): Promise<boolean> {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
      const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Pedidos"

      if (!spreadsheetId) {
        console.error("Google Sheets spreadsheet ID not configured")
        return false
      }

      // Ensure sheet exists
      const sheetReady = await this.ensureSheetExists(spreadsheetId, sheetName)
      if (!sheetReady) {
        return false
      }

      // Prepare row data
      const rowData = [
        orderData.orderId,
        new Date(orderData.submittedAt).toLocaleDateString("es-ES"),
        orderData.customerName,
        orderData.customerEmail,
        orderData.customerPhone || "",
        orderData.status,
      ]

      // Add product data (up to 2 products for now)
      for (let i = 0; i < 2; i++) {
        const product = orderData.products[i]
        if (product) {
          rowData.push(
            product.productType,
            product.zoneOption1,
            product.zoneOption2,
            product.zoneOption3,
            product.zoneOption4,
            product.zoneOption5,
            product.heelHeight,
            product.posteriorWedge,
          )
        } else {
          // Fill empty columns for missing products
          rowData.push("", "", "", "", "", "", "", "")
        }
      }

      // Append the row
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:T`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [rowData],
        },
      })

      return true
    } catch (error) {
      console.error("Error adding order to sheet:", error)
      return false
    }
  }

  async exportAllOrders(orders: OrderSheetData[]): Promise<boolean> {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
      const sheetName = `Export_${new Date().toISOString().split("T")[0]}`

      if (!spreadsheetId) {
        console.error("Google Sheets spreadsheet ID not configured")
        return false
      }

      // Create new sheet for export
      const sheetReady = await this.ensureSheetExists(spreadsheetId, sheetName)
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
              product.zoneOption1,
              product.zoneOption2,
              product.zoneOption3,
              product.zoneOption4,
              product.zoneOption5,
              product.heelHeight,
              product.posteriorWedge,
            )
          } else {
            rowData.push("", "", "", "", "", "", "", "")
          }
        }

        return rowData
      })

      // Write all data at once
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A2:T${allData.length + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: allData,
        },
      })

      return true
    } catch (error) {
      console.error("Error exporting orders to sheet:", error)
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
      if (!spreadsheetId) {
        return false
      }

      await this.sheets.spreadsheets.get({ spreadsheetId })
      return true
    } catch (error) {
      console.error("Google Sheets connection test failed:", error)
      return false
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()

export async function addOrderToGoogleSheets(orderData: OrderSheetData): Promise<boolean> {
  return await googleSheetsService.addOrderToSheet(orderData)
}

export async function exportOrdersToGoogleSheets(orders: OrderSheetData[]): Promise<boolean> {
  return await googleSheetsService.exportAllOrders(orders)
}

export async function testGoogleSheetsConnection(): Promise<boolean> {
  return await googleSheetsService.testConnection()
}

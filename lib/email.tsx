// Email sending via Brevo (Sendinblue) HTTP API
// Docs: https://developers.brevo.com/reference/sendtransacemail

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
const BREVO_API_KEY = process.env.BREVO_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@example.com"
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Sistema"
// Public URL of the logo used in emails (must be HTTPS and publicly accessible)
const PUBLIC_LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  "https://pedido-producto-icyembant-balrok-studios-projects.vercel.app/Logo-Under-Feet-green-.png"

export interface OrderEmailData {
  customerName: string
  customerEmail: string
  orderNumber: string
  products: Array<{
    productType: string
    quantity: number
    options: Record<string, any>
  }>
  totalProducts: number
  submittedAt: string
  notes?: string
}

export async function sendCustomerConfirmationEmail(data: OrderEmailData) {
  try {
    if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY no configurado")

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: EMAIL_FROM, name: EMAIL_FROM_NAME },
        to: [{ email: data.customerEmail }],
        subject: `Confirmación de pedido #${data.orderNumber}`,
        htmlContent: generateCustomerEmailTemplate(data),
      }),
    })

    if (!response.ok) {
      const err = await safeJson(response)
      console.error("Error sending customer email:", err)
      return { success: false, error: err }
    }

    const emailData = await response.json()
    return { success: true, data: emailData }
  } catch (error) {
    console.error("Error sending customer email:", error)
    return { success: false, error }
  }
}

export async function sendAdminNotificationEmail(data: OrderEmailData) {
  try {
    if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY no configurado")
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: EMAIL_FROM, name: EMAIL_FROM_NAME },
        to: [{ email: adminEmail }],
        subject: `Nuevo pedido recibido #${data.orderNumber}`,
        htmlContent: generateAdminEmailTemplate(data),
      }),
    })

    if (!response.ok) {
      const err = await safeJson(response)
      console.error("Error sending admin email:", err)
      return { success: false, error: err }
    }

    const emailData = await response.json()
    return { success: true, data: emailData }
  } catch (error) {
    console.error("Error sending admin email:", error)
    return { success: false, error }
  }
}

export async function sendTestEmail(toEmail?: string) {
  try {
    if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY no configurado")
    const recipient = toEmail || process.env.ADMIN_EMAIL || EMAIL_FROM
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: EMAIL_FROM, name: EMAIL_FROM_NAME },
        to: [{ email: recipient }],
        subject: "Prueba de integraciones - Sistema de Pedidos",
        htmlContent: `
          <div style="font-family:Arial,Helvetica,sans-serif;">
            <p>Este es un email de prueba enviado desde el entorno de desarrollo.</p>
            <p>Fecha: ${new Date().toISOString()}</p>
            <p>App: ${appUrl}</p>
            <div style="text-align:center; margin-top:8px;">
              <img src="${PUBLIC_LOGO_URL}" alt="Underfeet Logo" width="48" height="48" style="display:block; margin:0 auto; outline:none; text-decoration:none; border:0; -ms-interpolation-mode:bicubic;" />
            </div>
            <p style="font-size:12px; color:#94a3b8; margin-top:8px; text-align:center;">Logo URL: ${PUBLIC_LOGO_URL}</p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const err = await safeJson(response)
      console.error("Error sending test email:", err)
      return { success: false, error: err }
    }

    const emailData = await response.json()
    return { success: true, data: emailData }
  } catch (error) {
    console.error("Error sending test email:", error)
    return { success: false, error }
  }
}

function generateCustomerEmailTemplate(data: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 32px 24px; }
        .order-info { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .product-item { border-left: 4px solid #0ea5e9; padding: 16px; margin: 16px 0; background: #f8fafc; border-radius: 0 8px 8px 0; }
        .footer { background: #f1f5f9; padding: 24px; text-align: center; color: #64748b; font-size: 14px; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0; }
        .highlight { color: #0ea5e9; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Pedido Confirmado!</h1>
          <p>Gracias por confiar en nosotros</p>
        </div>
        
        <div class="content">
          <p>Estimado/a <strong>${data.customerName}</strong>,</p>
          
          <p>Hemos recibido correctamente su pedido de plantillas ortopédicas. A continuación encontrará los detalles:</p>
          
          <div class="order-info">
            <h3>Información del Pedido</h3>
            <p><strong>Número de pedido:</strong> <span class="highlight">#${data.orderNumber}</span></p>
            <p><strong>Fecha:</strong> ${new Date(data.submittedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p><strong>Total de productos:</strong> ${data.totalProducts}</p>
            ${data.notes ? `<p><strong>Observaciones:</strong> ${data.notes}</p>` : ""}
          </div>
          
          <h3>Productos Solicitados</h3>
          ${data.products
            .map(
              (product, index) => `
            <div class="product-item">
              <h4>Producto ${index + 1}: ${product.productType}</h4>
              <p><strong>Cantidad:</strong> ${product.quantity}</p>
              <p><strong>Configuración detallada:</strong></p>
              <div style="margin-left: 0; line-height: 1.8;">
                ${Object.entries(product.options)
                  .map(
                    ([key, value]) => {
                      const displayValue = Array.isArray(value) ? value.join(", ") : (value || "-");
                      return `<div style="margin: 4px 0;"><strong>${key}:</strong> ${displayValue}</div>`;
                    }
                  )
                  .join("")}
              </div>
            </div>
          `,
            )
            .join("")}
          
          <p>Nuestro equipo revisará su pedido y se pondrá en contacto con usted en las próximas 24-48 horas.</p>
          
          <p>Si tiene alguna pregunta o necesita realizar cambios en su pedido, no dude en contactarnos.</p>
        </div>
        
        <div class="footer">
          <p>Este es un email automático, por favor no responda a este mensaje.</p>
          © 2025 <a href="https://www.underfeet.com.ar" target="_blank" style="display:inline; margin:0 4px;">Underfeet.com.ar</a> - Todos los derechos reservados.
           
          
        </div>
      </div>
    </body>
    </html>
  `
}

// Helper to safely parse JSON error payloads from Brevo
async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return { status: res.status, statusText: res.statusText }
  }
}

function generateAdminEmailTemplate(data: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo Pedido Recibido</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #fbbf24 0%, #fb923c 100%); color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 32px 24px; }
        .alert { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 16px 0; color: #c2410c; }
        .customer-info { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .product-item { border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0; background: #f8fafc; border-radius: 0 8px 8px 0; }
        .footer { background: #f1f5f9; padding: 24px; text-align: center; color: #64748b; font-size: 14px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 16px 0; border: 1px solid transparent; }
        .button:hover { background: #f97316; color: #ffffff !important; }
        .button-green { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 16px 0; border: 1px solid transparent; }
        .button-green:hover { background: #059669; color: #ffffff !important; }
        .button-container { display: table; width: 100%; margin: 16px 0; }
        .button-cell { display: table-cell; width: 50%; padding: 0 8px; text-align: center; }
        .highlight { color: #f59e0b; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Nuevo Pedido</h1>
          <p>Requiere atención inmediata</p>
        </div>
        
        <div class="content">
           
          
          <div class="customer-info">
            <h3>Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Número de pedido:</strong> <span class="highlight">#${data.orderNumber}</span></p>
            <p><strong>Fecha de envío:</strong> ${new Date(data.submittedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            ${data.notes ? `<p><strong>Observaciones:</strong> ${data.notes}</p>` : ""}
          </div>
          
          <h3>Resumen del Pedido</h3>
          <p><strong>Total de productos:</strong> ${data.totalProducts}</p>
          
          ${data.products
            .map(
              (product, index) => `
            <div class="product-item">
              <h4>Producto ${index + 1}: ${product.productType}</h4>
              <p><strong>Cantidad:</strong> ${product.quantity}</p>
              <p><strong>Configuración detallada:</strong></p>
              <div style="margin-left: 0; line-height: 1.8;">
                ${Object.entries(product.options)
                  .map(
                    ([key, value]) => {
                      const displayValue = Array.isArray(value) ? value.join(", ") : (value || "-");
                      return `<div style="margin: 4px 0;"><strong>${key}:</strong> ${displayValue}</div>`;
                    }
                  )
                  .join("")}
              </div>
            </div>
          `,
            )
            .join("")}
          
          <h3>Acciones Recomendadas</h3>
          <ol>
            <li>Revisar la configuración técnica de cada producto</li>
            <li>Contactar al cliente en las próximas 24 horas</li>
            <li>Verificar disponibilidad de materiales</li>
            <li>Programar cita para toma de medidas si es necesario</li>
            <li>Actualizar el estado del pedido en el sistema</li>
          </ol>
          
          <div class="button-container">
            <div class="button-cell">
              <a href="https://docs.google.com/spreadsheets/d/1ZoHMTdBBhCkfaAWhfaF6TrW4_VLwbQO-R9VqkFsZeyw/edit?pli=1&gid=934464996#gid=934464996" class="button-green" style="color:#ffffff !important; font-weight:500; text-decoration:none !important;">Ver en Google Sheets</a>
            </div>
            <div class="button-cell">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders" class="button" style="color:#ffffff !important; font-weight:500; text-decoration:none !important;">Ver en Panel de Administración</a>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Sistema de Gestión de Pedidos - Plantillas Ortopédicas</p>
          © 2025 <a href="https://www.underfeet.com.ar" target="_blank" style="display:inline; margin:0 4px;">Underfeet.com.ar</a> - Todos los derechos reservados.
          
        </div>
      </div>
    </body>
    </html>
  `
}

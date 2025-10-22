# Buenas Prácticas Implementadas

## 1. Arquitectura y Organización del Código

### Separación de Responsabilidades (SoC)

#### ✅ Servicios Dedicados
```typescript
// lib/google-sheets.ts - Solo lógica de Google Sheets
class GoogleSheetsService {
  private auth: GoogleAuth
  private sheets: sheets_v4.Sheets
  
  constructor() {
    // Inicialización y validación
  }
  
  async addOrderToSheet(orderData: OrderSheetData) {
    // Lógica específica de Google Sheets
  }
  
  async testConnection() {
    // Testing de conexión
  }
}

export const googleSheetsService = new GoogleSheetsService()
```

#### ✅ Componentes UI Puros
```typescript
// components/order-form.tsx - Solo UI y estado local
export function OrderForm() {
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema)
  })
  
  const onSubmit = async (data: OrderFormData) => {
    // Solo llamada a API, no lógica de negocio
    const response = await fetch("/api/submit-order", {
      method: "POST",
      body: JSON.stringify(data)
    })
  }
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

#### ✅ API Routes como Controladores
```typescript
// app/api/submit-order/route.ts - Orquestación
export async function POST(request: Request) {
  try {
    // 1. Validación
    const validatedData = orderFormSchema.parse(body)
    
    // 2. Llamadas a servicios
    await supabaseService.createOrder(validatedData)
    await googleSheetsService.addOrder(validatedData)
    await emailService.sendConfirmation(validatedData)
    
    // 3. Respuesta
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
```

### Estructura de Carpetas por Dominio

```
lib/
├── supabase/           # Todo relacionado a Supabase
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts
├── google-sheets.ts    # Servicio de Google Sheets
├── email.tsx           # Servicio de email
├── types.ts            # Tipos compartidos
├── validations.ts      # Validaciones compartidas
└── utils.ts            # Utilidades generales
```

---

## 2. Tipado Fuerte con TypeScript

### Interfaces Claras y Descriptivas

```typescript
// ✅ BUENA PRÁCTICA: Interfaces bien definidas
export interface ProductRequest {
  id: string
  customer_request_id: string
  
  // Datos del paciente
  patient_name: string
  patient_lastname: string
  
  // Configuración del producto
  product_type: string
  template_size?: string | null
  template_color?: string | null
  
  // Configuración por zona - Pie Derecho
  forefoot_metatarsal?: string | null
  anterior_wedge?: string | null
  anterior_wedge_mm?: string | null
  
  // Configuración por zona - Pie Izquierdo
  forefoot_metatarsal_left?: string | null
  anterior_wedge_left?: string | null
  anterior_wedge_left_mm?: string | null
  
  created_at: string
}
```

### Tipos de Utilidad

```typescript
// ✅ BUENA PRÁCTICA: Reutilizar tipos
type CreateProductRequest = Omit<ProductRequest, 'id' | 'created_at'>
type UpdateProductRequest = Partial<CreateProductRequest>
type ProductRequestWithCustomer = ProductRequest & {
  customer: CustomerRequest
}
```

### Type Guards

```typescript
// ✅ BUENA PRÁCTICA: Type guards para validación en runtime
function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isProductRequest(obj: unknown): obj is ProductRequest {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'product_type' in obj &&
    'patient_name' in obj
  )
}
```

### Enums vs Union Types

```typescript
// ✅ BUENA PRÁCTICA: Union types para valores conocidos
type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

// ✅ BUENA PRÁCTICA: Const objects para opciones
const FOOT_ZONES = {
  FOREFOOT: 'forefoot',
  MIDFOOT: 'midfoot',
  REARFOOT: 'rearfoot'
} as const

type FootZone = typeof FOOT_ZONES[keyof typeof FOOT_ZONES]
```

---

## 3. Validación de Datos

### Validación con Zod

#### Esquemas Reutilizables

```typescript
// ✅ BUENA PRÁCTICA: Esquemas modulares
const patientSchema = z.object({
  patient_name: z.string()
    .min(1, "El nombre es requerido")
    .max(100, "Nombre muy largo"),
  patient_lastname: z.string()
    .min(1, "El apellido es requerido")
    .max(100, "Apellido muy largo")
})

const productConfigSchema = z.object({
  product_type: z.string().min(1, "Debe seleccionar un tipo"),
  template_size: z.string().optional(),
  template_color: z.string().optional()
})

// Composición de esquemas
const productSchema = z.object({
  ...patientSchema.shape,
  ...productConfigSchema.shape,
  // Más campos...
})
```

#### Validación Condicional

```typescript
// ✅ BUENA PRÁCTICA: Validaciones dependientes
const productSchema = z.object({
  anterior_wedge: z.string().optional(),
  anterior_wedge_mm: z.string().optional()
}).refine(
  (data) => {
    // Si hay cuña, debe haber medida en mm
    if (data.anterior_wedge && data.anterior_wedge !== "Ninguna") {
      return data.anterior_wedge_mm && data.anterior_wedge_mm.length > 0
    }
    return true
  },
  {
    message: "Debe especificar el espesor en mm",
    path: ["anterior_wedge_mm"]
  }
)
```

#### Transformaciones

```typescript
// ✅ BUENA PRÁCTICA: Transformar datos durante validación
const emailSchema = z.string()
  .email("Email inválido")
  .transform(email => email.toLowerCase().trim())

const phoneSchema = z.string()
  .transform(phone => phone.replace(/\D/g, '')) // Solo dígitos
  .refine(phone => phone.length >= 8, "Teléfono inválido")
```

### Validación en Capas

```typescript
// ✅ BUENA PRÁCTICA: Validar en múltiples capas

// 1. Cliente (React Hook Form)
const form = useForm<OrderFormData>({
  resolver: zodResolver(orderFormSchema),
  mode: 'onChange'
})

// 2. Servidor (API Route)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = orderFormSchema.parse(body)
    // Procesar...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, issues: error.issues },
        { status: 400 }
      )
    }
  }
}

// 3. Base de Datos (Constraints)
// CREATE TABLE customer_requests (
//   email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@...')
// )
```

---

## 4. Manejo de Errores

### Try-Catch con Mensajes Descriptivos

```typescript
// ✅ BUENA PRÁCTICA: Manejo robusto de errores
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = orderFormSchema.parse(body)
    
    const result = await processOrder(validatedData)
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    })
    
  } catch (error) {
    console.error("Error en submit-order:", error)
    
    // Errores de validación
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Datos inválidos", 
          issues: error.issues 
        },
        { status: 400 }
      )
    }
    
    // Errores de Supabase
    if (error instanceof SupabaseError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Error de base de datos" 
        },
        { status: 500 }
      )
    }
    
    // Error genérico
    return NextResponse.json(
      { 
        success: false, 
        message: "Error interno del servidor" 
      },
      { status: 500 }
    )
  }
}
```

### Logging Estructurado

```typescript
// ✅ BUENA PRÁCTICA: Logs informativos y estructurados
async addOrderToSheet(orderData: OrderSheetData) {
  console.log('📊 Iniciando addOrderToSheet...')
  console.log(`📄 Procesando orden para la hoja: '${sheetName}'`)
  console.log('📦 Datos de la orden:', JSON.stringify(orderData, null, 2))
  
  try {
    console.log('✅ Datos agregados exitosamente')
    return { success: true }
  } catch (error) {
    console.error('❌ Error en addOrderToSheet:', error)
    console.error('🔍 Detalles:', error.response?.data)
    return { success: false, error: errorMessage }
  }
}
```

### Errores Personalizados

```typescript
// ✅ BUENA PRÁCTICA: Clases de error personalizadas
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

class IntegrationError extends Error {
  constructor(
    message: string,
    public service: string,
    public originalError: Error
  ) {
    super(message)
    this.name = 'IntegrationError'
  }
}

// Uso
if (!isValidEmail(email)) {
  throw new ValidationError(
    'Email inválido',
    'email',
    email
  )
}
```

### Manejo de Errores en Integraciones

```typescript
// ✅ BUENA PRÁCTICA: No fallar todo si una integración falla
async function processOrder(data: OrderFormData) {
  const results = {
    database: false,
    googleSheets: false,
    email: false
  }
  
  try {
    // Crítico: debe funcionar
    await saveToDatabase(data)
    results.database = true
  } catch (error) {
    console.error('Database error:', error)
    throw error // Re-lanzar error crítico
  }
  
  try {
    // Importante pero no crítico
    await saveToGoogleSheets(data)
    results.googleSheets = true
  } catch (error) {
    console.error('Google Sheets error:', error)
    // No re-lanzar, solo loguear
  }
  
  try {
    // Nice to have
    await sendEmail(data)
    results.email = true
  } catch (error) {
    console.error('Email error:', error)
    // No re-lanzar, solo loguear
  }
  
  return results
}
```

---

## 5. Gestión de Variables de Entorno

### Validación al Inicializar

```typescript
// ✅ BUENA PRÁCTICA: Validar variables críticas temprano
constructor() {
  const requiredVars = {
    clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  }
  
  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }
  
  // Continuar con inicialización...
}
```

### Sanitización de Variables

```typescript
// ✅ BUENA PRÁCTICA: Sanitizar variables sensibles
const sanitizePrivateKey = (rawKey: string | undefined): string => {
  if (!rawKey) throw new Error('Private key is required')
  
  return rawKey
    .replace(/^"|"$/g, '')      // Remover comillas externas
    .replace(/\\n/g, '\n')      // Convertir \n escapados
    .trim()                      // Remover espacios
}

const privateKey = sanitizePrivateKey(process.env.GOOGLE_SHEETS_PRIVATE_KEY)
```

### Variables con Valores por Defecto

```typescript
// ✅ BUENA PRÁCTICA: Valores por defecto seguros
const config = {
  emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',
  emailFromName: process.env.EMAIL_FROM_NAME || 'Sistema',
  sheetsLayout: process.env.GOOGLE_SHEETS_LAYOUT || 'rows',
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  timeout: parseInt(process.env.TIMEOUT || '30000', 10)
}
```

### Archivo .env.example

```bash
# ✅ BUENA PRÁCTICA: Documentar variables requeridas
# .env.example

# Supabase (REQUERIDO)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Google Sheets (REQUERIDO)
GOOGLE_SHEETS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=1abc...xyz

# Google Sheets (OPCIONAL)
GOOGLE_SHEETS_SHEET_NAME=Pedidos
GOOGLE_SHEETS_LAYOUT=rows

# Brevo Email (REQUERIDO)
BREVO_API_KEY=xkeysib-...
EMAIL_FROM=pedidos@underfeet.com
EMAIL_FROM_NAME=Under Feet
EMAIL_ADMIN=admin@underfeet.com

# App (OPCIONAL)
NEXT_PUBLIC_LOGO_URL=https://yourdomain.com/logo.png
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 6. Optimización de Rendimiento

### Memoización de Cálculos

```typescript
// ✅ BUENA PRÁCTICA: useMemo para cálculos costosos
const filteredOptions = useMemo(() => {
  return options
    .filter(opt => opt.category === selectedCategory)
    .sort((a, b) => a.order_index - b.order_index)
}, [options, selectedCategory])

const productCount = useMemo(() => {
  return products.reduce((sum, p) => sum + p.quantity, 0)
}, [products])
```

### Callbacks Estables

```typescript
// ✅ BUENA PRÁCTICA: useCallback para funciones pasadas como props
const handleAddProduct = useCallback(() => {
  append({
    patient_name: "",
    patient_lastname: "",
    product_type: ""
  })
}, [append])

const handleRemoveProduct = useCallback((index: number) => {
  if (fields.length > 1) {
    remove(index)
  }
}, [fields.length, remove])
```

### Lazy Loading de Componentes

```typescript
// ✅ BUENA PRÁCTICA: Cargar componentes pesados bajo demanda
import dynamic from 'next/dynamic'

const AdminDashboard = dynamic(
  () => import('@/components/admin-dashboard'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false // No renderizar en servidor si no es necesario
  }
)

const ChartComponent = dynamic(
  () => import('@/components/charts'),
  { ssr: false }
)
```

### Debouncing de Inputs

```typescript
// ✅ BUENA PRÁCTICA: Debounce para búsquedas
import { useDebouncedCallback } from 'use-debounce'

const handleSearch = useDebouncedCallback(
  (searchTerm: string) => {
    fetchResults(searchTerm)
  },
  500 // 500ms de delay
)

<Input 
  onChange={(e) => handleSearch(e.target.value)}
  placeholder="Buscar..."
/>
```

### Paginación y Virtualización

```typescript
// ✅ BUENA PRÁCTICA: Paginar listas largas
const ITEMS_PER_PAGE = 20

const paginatedOrders = useMemo(() => {
  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  return orders.slice(start, end)
}, [orders, currentPage])
```

---

## 7. Accesibilidad (a11y)

### Componentes Accesibles

```typescript
// ✅ BUENA PRÁCTICA: Usar Radix UI con a11y integrada
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

<FormField
  control={form.control}
  name="patient_name"
  render={({ field }) => (
    <FormItem>
      <FormLabel htmlFor="patient_name">
        Nombre del Paciente
      </FormLabel>
      <FormControl>
        <Input 
          id="patient_name"
          placeholder="Ingrese nombre" 
          aria-invalid={!!form.formState.errors.patient_name}
          aria-describedby="patient_name-error"
          {...field}
        />
      </FormControl>
      <FormMessage id="patient_name-error" />
    </FormItem>
  )}
/>
```

### ARIA Labels y Roles

```typescript
// ✅ BUENA PRÁCTICA: ARIA labels descriptivos
<button
  type="button"
  onClick={addProduct}
  aria-label="Agregar nuevo producto al pedido"
>
  <Plus className="h-4 w-4" />
  Agregar Producto
</button>

<div role="alert" aria-live="polite">
  {successMessage}
</div>

<nav aria-label="Navegación principal">
  <ul>
    <li><a href="/">Inicio</a></li>
    <li><a href="/orders">Pedidos</a></li>
  </ul>
</nav>
```

### Navegación por Teclado

```typescript
// ✅ BUENA PRÁCTICA: Soporte completo de teclado
<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Radix maneja automáticamente:
        - Escape para cerrar
        - Tab para navegar
        - Focus trap dentro del modal
    */}
  </DialogContent>
</Dialog>
```

### Contraste de Colores

```css
/* ✅ BUENA PRÁCTICA: Contraste WCAG AA mínimo */
.button-primary {
  background: #2563eb; /* Azul */
  color: #ffffff;      /* Blanco - Ratio 8.59:1 */
}

.text-secondary {
  color: #6b7280;      /* Gris */
  /* Ratio 4.54:1 sobre fondo blanco */
}
```

---

## 8. Seguridad

### Row Level Security (RLS)

```sql
-- ✅ BUENA PRÁCTICA: Políticas granulares
CREATE POLICY "Allow public read of active options" 
ON product_options
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow public insert to customer requests" 
ON customer_requests
FOR INSERT 
WITH CHECK (true);

-- Solo admin puede actualizar/eliminar
CREATE POLICY "Allow admin full access to orders"
ON customer_requests
FOR ALL
USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');
```

### Sanitización de Inputs

```typescript
// ✅ BUENA PRÁCTICA: Sanitizar antes de usar
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')           // Remover < y >
    .replace(/javascript:/gi, '')   // Remover javascript:
    .slice(0, 1000)                 // Limitar longitud
}

const sanitizedNotes = sanitizeInput(formData.notes)
```

### Validación de Tipos de Archivo

```typescript
// ✅ BUENA PRÁCTICA: Validar uploads
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

function validateFile(file: File): boolean {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido')
  }
  
  if (file.size > MAX_SIZE) {
    throw new Error('Archivo muy grande')
  }
  
  return true
}
```

### Rate Limiting

```typescript
// ✅ BUENA PRÁCTICA: Limitar requests
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // Procesar request...
}
```

### Secrets en Variables de Entorno

```typescript
// ✅ BUENA PRÁCTICA: Nunca hardcodear secrets
// ❌ MAL
const apiKey = "sk_live_abc123..."

// ✅ BIEN
const apiKey = process.env.BREVO_API_KEY

// ✅ MEJOR: Validar que existe
if (!process.env.BREVO_API_KEY) {
  throw new Error('BREVO_API_KEY is required')
}
const apiKey = process.env.BREVO_API_KEY
```

---

## 9. Testing y Debugging

### Scripts de Testing

```typescript
// ✅ BUENA PRÁCTICA: Scripts dedicados para testing
// scripts/test-google-sheets.ts
import { googleSheetsService } from '@/lib/google-sheets'

async function testGoogleSheetsIntegration() {
  console.log('🧪 Testing Google Sheets integration...')
  
  try {
    // Test 1: Conexión
    console.log('Test 1: Connection')
    const connected = await googleSheetsService.testConnection()
    console.log(connected ? '✅ Connected' : '❌ Failed')
    
    // Test 2: Crear hoja
    console.log('Test 2: Create sheet')
    const created = await googleSheetsService.ensureSheetExists('Test')
    console.log(created ? '✅ Created' : '❌ Failed')
    
    // Test 3: Agregar datos
    console.log('Test 3: Add data')
    const result = await googleSheetsService.addOrderToSheet({
      orderId: 'TEST-001',
      customerName: 'Test User',
      // ...
    })
    console.log(result.success ? '✅ Added' : '❌ Failed')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testGoogleSheetsIntegration()
```

### Endpoints de Health Check

```typescript
// ✅ BUENA PRÁCTICA: Endpoint para verificar estado
// app/api/health/route.ts
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    services: {
      database: await checkDatabase(),
      googleSheets: await checkGoogleSheets(),
      email: await checkEmail()
    }
  }
  
  const allHealthy = Object.values(checks.services).every(s => s.status === 'ok')
  
  return NextResponse.json(
    checks,
    { status: allHealthy ? 200 : 503 }
  )
}

async function checkDatabase() {
  try {
    const { error } = await supabase.from('product_options').select('count')
    return { status: error ? 'error' : 'ok', message: error?.message }
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}
```

### Logging para Debugging

```typescript
// ✅ BUENA PRÁCTICA: Logs condicionales por ambiente
const isDev = process.env.NODE_ENV === 'development'

function debugLog(...args: any[]) {
  if (isDev) {
    console.log('[DEBUG]', ...args)
  }
}

function errorLog(...args: any[]) {
  console.error('[ERROR]', new Date().toISOString(), ...args)
}

// Uso
debugLog('Processing order:', orderId)
errorLog('Failed to send email:', error)
```

### Error Boundaries

```typescript
// ✅ BUENA PRÁCTICA: Error boundaries para componentes
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Algo salió mal</h2>
          <p>{this.state.error?.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}

// Uso
<ErrorBoundary fallback={<ErrorFallback />}>
  <OrderForm />
</ErrorBoundary>
```

---

## 10. Documentación del Código

### Comentarios JSDoc

```typescript
/**
 * Agrega un pedido a Google Sheets
 * 
 * @param orderData - Datos del pedido a agregar
 * @returns Objeto con success y detalles del resultado
 * 
 * @example
 * ```typescript
 * const result = await addOrderToSheet({
 *   orderId: 'ORD-001',
 *   customerName: 'Juan Pérez',
 *   products: [...]
 * })
 * ```
 */
async addOrderToSheet(orderData: OrderSheetData): Promise<{
  success: boolean
  error?: string
  details?: any
}> {
  // Implementación...
}
```

### README por Módulo

```markdown
# Google Sheets Service

Servicio para integración con Google Sheets API.

## Configuración

Requiere las siguientes variables de entorno:
- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID`

## Uso

\`\`\`typescript
import { googleSheetsService } from '@/lib/google-sheets'

const result = await googleSheetsService.addOrderToSheet(orderData)
\`\`\`

## Troubleshooting

### Error 403: Permission Denied
Asegúrate de que la service account tenga acceso a la hoja.
```

### Tipos Documentados

```typescript
/**
 * Datos de un pedido para Google Sheets
 */
interface OrderSheetData {
  /** ID único del pedido */
  orderId: string
  
  /** Nombre del cliente/profesional */
  customerName: string
  
  /** Email de contacto */
  customerEmail: string
  
  /** Lista de productos en el pedido */
  products: Array<{
    /** Tipo de plantilla */
    productType: string
    
    /** Configuración del antepié */
    forefootMetatarsal?: string
    
    // ... más campos
  }>
  
  /** Notas adicionales del pedido */
  notes?: string
}
```

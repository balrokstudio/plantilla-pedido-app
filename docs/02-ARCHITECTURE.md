# Arquitectura y Stack Tecnológico

## Stack Tecnológico Completo

### Frontend

#### Framework y Librerías Core
- **Next.js 14.2.16** - Framework React con App Router
- **React 18** - Librería UI
- **TypeScript 5.9.2** - Tipado estático
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **PostCSS 8.5** - Procesador CSS

#### UI Components y Styling
- **Radix UI** - Componentes accesibles sin estilos
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-select`
  - `@radix-ui/react-accordion`
  - `@radix-ui/react-toast`
  - Y más...
- **shadcn/ui** - Componentes pre-estilizados basados en Radix
- **class-variance-authority** - Variantes de componentes
- **clsx** + **tailwind-merge** - Utilidades para clases CSS
- **tailwindcss-animate** - Animaciones con Tailwind
- **lucide-react** - Iconos SVG

#### Formularios y Validación
- **react-hook-form** - Gestión de formularios
- **@hookform/resolvers** - Resolvers para validación
- **zod 3.24.1** - Validación de esquemas TypeScript-first

#### Otros
- **next-themes** - Gestión de temas (claro/oscuro)
- **date-fns** - Manipulación de fechas
- **sonner** - Toast notifications
- **cmdk** - Command menu
- **embla-carousel-react** - Carruseles
- **recharts** - Gráficos y visualizaciones

### Backend

#### Runtime y Framework
- **Node.js** - Runtime de JavaScript
- **Next.js API Routes** - Endpoints del servidor
- **TypeScript** - Tipado en el servidor

#### Base de Datos
- **Supabase** - Backend as a Service
  - `@supabase/supabase-js` - Cliente JavaScript
  - `@supabase/ssr` - Server-Side Rendering support
- **PostgreSQL** - Base de datos relacional (via Supabase)

#### Integraciones Externas
- **Google APIs**
  - `googleapis` - Cliente oficial de Google APIs
  - `google-auth-library` - Autenticación OAuth2
- **Brevo (Sendinblue)** - Servicio de email transaccional
- **@react-email/render** - Renderizado de emails React

#### DevDependencies
- **ts-node** - Ejecutar TypeScript directamente
- **dotenv** - Gestión de variables de entorno
- **@types/node** - Tipos de Node.js
- **@types/react** - Tipos de React
- **@types/react-dom** - Tipos de React DOM

### Deployment y Analytics
- **Vercel** - Plataforma de hosting
- **@vercel/analytics** - Analytics integrado

---

## Arquitectura del Sistema

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ React Pages  │  │  Components  │  │    Hooks     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTP/HTTPS
┌────────────────────────────┼─────────────────────────────────┐
│                    NEXT.JS SERVER                            │
│  ┌─────────────────────────┴──────────────────────────┐     │
│  │              API Routes (Endpoints)                 │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │     │
│  │  │  Public  │  │  Admin   │  │ Webhooks │         │     │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘         │     │
│  └───────┼─────────────┼─────────────┼────────────────┘     │
│          │             │             │                       │
│  ┌───────┴─────────────┴─────────────┴────────────────┐     │
│  │              Services Layer                         │     │
│  │  ┌──────────────┐  ┌──────────────┐               │     │
│  │  │ Google       │  │  Email       │               │     │
│  │  │ Sheets       │  │  Service     │               │     │
│  │  │ Service      │  │  (Brevo)     │               │     │
│  │  └──────┬───────┘  └──────┬───────┘               │     │
│  └─────────┼──────────────────┼────────────────────────┘     │
└────────────┼──────────────────┼──────────────────────────────┘
             │                  │
    ┌────────┴────────┐  ┌──────┴───────┐
    │  Google Sheets  │  │ Brevo API    │
    │  API            │  │              │
    └─────────────────┘  └──────────────┘
             
┌────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Tables     │  │     RLS      │  │   Triggers   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

#### 1. Envío de Pedido

```
Usuario → OrderForm Component
  ↓
React Hook Form (validación cliente)
  ↓
POST /api/submit-order
  ↓
Validación Zod (servidor)
  ↓
┌─────────────────────────────────┐
│ Operaciones Paralelas:          │
│                                  │
│ 1. Guardar en Supabase          │
│    ├─ customer_requests         │
│    └─ product_requests          │
│                                  │
│ 2. Registrar en Google Sheets   │
│    └─ googleSheetsService       │
│                                  │
│ 3. Enviar Emails                │
│    ├─ Email al cliente          │
│    └─ Email al admin            │
└─────────────────────────────────┘
  ↓
Response al cliente
  ↓
Toast de confirmación
```

#### 2. Carga de Opciones de Productos

```
Component Mount
  ↓
useFormConfig Hook
  ↓
GET /api/form-config
  ↓
Supabase Query
  ├─ product_options (WHERE is_active = true)
  └─ app_settings (products_colors_mapping)
  ↓
Cache en cliente
  ↓
Renderizado de opciones
```

#### 3. Panel Administrativo

```
Admin Dashboard
  ↓
GET /api/admin/orders
  ↓
Supabase Query con JOIN
  ├─ customer_requests
  └─ product_requests
  ↓
Transformación de datos
  ↓
Renderizado de tabla
```

---

## Estructura de Directorios Detallada

```
plantilla-pedido-app/
│
├── app/                                    # Next.js App Router
│   ├── api/                               # API Routes
│   │   ├── admin/                         # Endpoints administrativos
│   │   │   ├── export/
│   │   │   │   └── route.ts              # Exportar pedidos a CSV
│   │   │   ├── form-config/
│   │   │   │   └── route.ts              # Config del formulario (admin)
│   │   │   ├── google-sheets/
│   │   │   │   ├── export/
│   │   │   │   │   └── route.ts          # Exportar a Google Sheets
│   │   │   │   └── test/
│   │   │   │       └── route.ts          # Test de conexión
│   │   │   ├── orders/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts          # GET/PUT/DELETE pedido
│   │   │   │   └── route.ts              # GET/POST pedidos
│   │   │   ├── product-options/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts          # PUT/DELETE opción
│   │   │   │   └── route.ts              # GET/POST opciones
│   │   │   ├── products-colors/
│   │   │   │   └── route.ts              # Gestión de colores
│   │   │   └── stats/
│   │   │       └── route.ts              # Estadísticas
│   │   ├── form-config/
│   │   │   └── route.ts                  # Config pública del form
│   │   ├── product-options/
│   │   │   └── route.ts                  # Opciones públicas
│   │   ├── products-colors/
│   │   │   └── route.ts                  # Colores públicos
│   │   ├── submit-order/
│   │   │   └── route.ts                  # Envío de pedidos
│   │   ├── test-google-sheets/
│   │   │   └── route.ts                  # Test de Google Sheets
│   │   ├── test-integrations/
│   │   │   └── route.ts                  # Test de todas las integraciones
│   │   ├── health/
│   │   │   └── route.ts                  # Health check
│   │   └── webhooks/
│   │       └── supabase/
│   │           └── order-created/
│   │               └── route.ts          # Webhook de Supabase
│   ├── zones-help/
│   │   └── page.tsx                      # Página de ayuda
│   ├── globals.css                        # Estilos globales
│   ├── layout.tsx                         # Layout raíz
│   └── page.tsx                           # Página principal
│
├── components/                            # Componentes React
│   ├── ui/                               # Componentes base (shadcn/ui)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── ... (más componentes)
│   ├── footer.tsx                        # Footer global
│   ├── form-progress-bar.tsx             # Barra de progreso
│   ├── order-form.tsx                    # Formulario principal
│   ├── product-form.tsx                  # Formulario de producto
│   └── theme-provider.tsx                # Proveedor de temas
│
├── lib/                                   # Lógica de negocio y utilidades
│   ├── supabase/                         # Cliente de Supabase
│   │   ├── client.ts                     # Cliente del navegador
│   │   ├── middleware.ts                 # Middleware de auth
│   │   └── server.ts                     # Cliente del servidor
│   ├── email.tsx                         # Servicio de email
│   ├── google-sheets.ts                  # Servicio de Google Sheets
│   ├── types.ts                          # Definiciones de tipos
│   ├── utils.ts                          # Utilidades generales
│   └── validations.ts                    # Esquemas de validación Zod
│
├── hooks/                                 # Custom React Hooks
│   ├── use-form-config.ts                # Hook para config del form
│   └── use-toast.ts                      # Hook para toasts
│
├── scripts/                               # Scripts de BD y testing
│   ├── 001_create_database_schema.sql    # Esquema inicial
│   ├── 002_seed_initial_data.sql         # Datos iniciales
│   ├── 003_alter_product_requests_add_new_fields.sql
│   ├── 004_alter_product_requests_add_patient_names.sql
│   ├── 005_alter_product_requests_add_forefoot_left.sql
│   ├── 006_alter_product_requests_add_left_foot_fields.sql
│   ├── 007_alter_product_requests_add_right_foot_mm_fields.sql
│   ├── simple-test.js                    # Test simple
│   └── test-google-sheets.ts             # Test de Google Sheets
│
├── public/                                # Archivos estáticos
│   ├── Logo-Under-Feet-green-.png        # Logo de la empresa
│   └── ... (otros assets)
│
├── styles/                                # Estilos adicionales
│
├── docs/                                  # Documentación
│   ├── 01-OVERVIEW.md
│   ├── 02-ARCHITECTURE.md               # Este archivo
│   └── ... (más documentos)
│
├── middleware.ts                          # Middleware de Next.js
├── tailwind.config.ts                     # Config de Tailwind
├── tsconfig.json                          # Config de TypeScript
├── next.config.mjs                        # Config de Next.js
├── postcss.config.mjs                     # Config de PostCSS
├── components.json                        # Config de shadcn/ui
├── package.json                           # Dependencias
├── .env.local                            # Variables de entorno
├── .gitignore                            # Archivos ignorados por Git
└── README.md                             # README del proyecto
```

---

## Patrones de Diseño Utilizados

### 1. Service Layer Pattern
Separación de lógica de negocio en servicios dedicados:
- `GoogleSheetsService` - Gestión de Google Sheets
- `EmailService` - Envío de emails
- `SupabaseService` - Operaciones de BD

### 2. Repository Pattern
Abstracción de acceso a datos:
```typescript
// lib/supabase/repositories/orders.ts
export class OrdersRepository {
  async create(data: CreateOrderDTO) { ... }
  async findById(id: string) { ... }
  async findAll(filters: OrderFilters) { ... }
}
```

### 3. Factory Pattern
Creación de clientes de Supabase según contexto:
```typescript
// Cliente del navegador
export const createClient = () => createBrowserClient(...)

// Cliente del servidor
export const createServerClient = () => createServerClient(...)
```

### 4. Strategy Pattern
Diferentes layouts para Google Sheets:
```typescript
const layout = process.env.GOOGLE_SHEETS_LAYOUT === "rows" ? "rows" : "columns"
```

### 5. Observer Pattern
React Hook Form observa cambios en el formulario y ejecuta validaciones.

### 6. Singleton Pattern
Instancia única de servicios:
```typescript
export const googleSheetsService = new GoogleSheetsService()
```

---

## Decisiones de Arquitectura

### ¿Por qué Next.js?
- **SSR y SSG:** Mejor SEO y performance
- **API Routes:** Backend y frontend en un solo proyecto
- **App Router:** Routing moderno con layouts anidados
- **Optimizaciones:** Image optimization, code splitting automático

### ¿Por qué Supabase?
- **PostgreSQL:** Base de datos robusta y escalable
- **RLS:** Seguridad a nivel de fila
- **Real-time:** Capacidades de tiempo real (futuro)
- **Auth:** Sistema de autenticación integrado (futuro)

### ¿Por qué Google Sheets?
- **Familiaridad:** Los clientes ya usan Sheets
- **Colaboración:** Fácil compartir y editar
- **Backup:** Copia de seguridad automática
- **Análisis:** Fácil crear reportes y gráficos

### ¿Por qué Brevo?
- **Confiabilidad:** Alta tasa de entrega
- **Templates:** Soporte para HTML
- **Precio:** Plan gratuito generoso
- **API:** Simple y bien documentada

### ¿Por qué TailwindCSS?
- **Productividad:** Desarrollo rápido
- **Consistencia:** Design system coherente
- **Performance:** CSS optimizado en producción
- **Customización:** Fácil de personalizar

### ¿Por qué shadcn/ui?
- **Accesibilidad:** Componentes accesibles por defecto
- **Customización:** Código en tu proyecto, no en node_modules
- **Calidad:** Componentes bien diseñados
- **Comunidad:** Gran ecosistema y soporte

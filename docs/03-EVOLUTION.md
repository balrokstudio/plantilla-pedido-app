# Cambios y Evolución del Sistema

## Cronología de Desarrollo

### Fase 1: Fundación (Scripts 001-002)
**Objetivo:** Establecer la base de datos y estructura inicial del proyecto

#### Script 001: Creación del Esquema de Base de Datos

**Tablas Creadas:**

1. **`product_options`** - Opciones configurables de productos
```sql
CREATE TABLE product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,        -- 'product_type', 'zone_option_1', etc.
  label TEXT NOT NULL,            -- Texto mostrado al usuario
  value TEXT NOT NULL,            -- Valor almacenado
  order_index INTEGER DEFAULT 0, -- Orden de visualización
  is_active BOOLEAN DEFAULT true, -- Activar/desactivar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **`customer_requests`** - Datos del cliente/profesional
```sql
CREATE TABLE customer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. **`product_requests`** - Productos individuales del pedido
```sql
CREATE TABLE product_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_request_id UUID REFERENCES customer_requests(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  zone_option_1 TEXT DEFAULT 'Ninguna',
  zone_option_2 TEXT DEFAULT 'Ninguna',
  zone_option_3 TEXT DEFAULT 'Ninguna',
  zone_option_4 TEXT DEFAULT 'Ninguna',
  zone_option_5 TEXT DEFAULT 'Ninguna',
  heel_height TEXT DEFAULT 'Ninguna',
  posterior_wedge TEXT DEFAULT 'No',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. **`app_settings`** - Configuración del sistema
```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Políticas de Seguridad (RLS):**
- Lectura pública de opciones activas
- Inserción pública de pedidos
- Políticas de desarrollo para operaciones administrativas

#### Script 002: Datos Iniciales (Seed)

**Tipos de Plantillas:**
- Estándar
- Deportiva
- Confort
- Infantil

**Opciones por Zona:**
- Zona 1: Elevación, Descarga, Ninguna
- Zona 2: Elevación, Descarga, Ninguna
- Zona 3: Elevación, Descarga, Ninguna
- Zona 4: Elevación, Descarga, Ninguna
- Zona 5: Elevación, Descarga, Ninguna

**Configuración de Colores:**
```json
{
  "Estándar": ["Negro", "Azul", "Beige"],
  "Deportiva": ["Negro", "Rojo", "Azul"],
  "Confort": ["Beige", "Gris", "Marrón"],
  "Infantil": ["Rosa", "Celeste", "Verde", "Amarillo"]
}
```

**Aprendizajes de esta fase:**
- ✅ Estructura modular permite fácil extensión
- ✅ RLS proporciona seguridad desde el inicio
- ✅ Opciones configurables evitan hardcodear valores
- ⚠️ Nombres genéricos de zonas (zone_option_1) poco descriptivos

---

### Fase 2: Expansión de Campos (Scripts 003-004)
**Objetivo:** Agregar campos específicos para configuración detallada

#### Script 003: Nuevos Campos de Configuración

**Campos Agregados a `product_requests`:**

```sql
-- Información básica del producto
ALTER TABLE product_requests ADD COLUMN template_size TEXT DEFAULT NULL;
ALTER TABLE product_requests ADD COLUMN template_color TEXT DEFAULT NULL;

-- Configuración del antepié
ALTER TABLE product_requests ADD COLUMN forefoot_metatarsal TEXT DEFAULT NULL;
ALTER TABLE product_requests ADD COLUMN anterior_wedge TEXT DEFAULT NULL;
ALTER TABLE product_requests ADD COLUMN anterior_wedge_mm TEXT DEFAULT NULL;

-- Configuración del mediopié
ALTER TABLE product_requests ADD COLUMN midfoot_arch TEXT DEFAULT NULL;
ALTER TABLE product_requests ADD COLUMN midfoot_external_wedge TEXT DEFAULT NULL;

-- Configuración del retropié
ALTER TABLE product_requests ADD COLUMN rearfoot_calcaneus TEXT DEFAULT NULL;
ALTER TABLE product_requests ADD COLUMN heel_raise_mm TEXT DEFAULT NULL;
```

**Razón del cambio:**
- Los campos genéricos `zone_option_1-5` no eran suficientemente descriptivos
- Se necesitaba especificar exactamente qué zona del pie se estaba configurando
- Algunos ajustes requieren medidas en milímetros (cuñas, realces)

**Impacto:**
- ✅ Mayor claridad en la especificación de pedidos
- ✅ Reducción de errores de interpretación
- ✅ Facilita validaciones específicas por campo
- ⚠️ Aún no soporta configuración bilateral

#### Script 004: Separación de Nombres de Paciente

**Campos Agregados:**
```sql
ALTER TABLE product_requests ADD COLUMN patient_name TEXT DEFAULT NULL;
ALTER TABLE product_requests ADD COLUMN patient_lastname TEXT DEFAULT NULL;
```

**Razón del cambio:**
- Cada producto puede ser para un paciente diferente
- Separar nombre y apellido facilita búsquedas y reportes
- Permite mejor organización en Google Sheets

**Impacto:**
- ✅ Soporte para múltiples pacientes en un pedido
- ✅ Mejor trazabilidad de productos por paciente
- ✅ Facilita exportaciones y reportes

---

### Fase 3: Configuración Bilateral (Scripts 005-007)
**Objetivo:** Implementar configuración independiente para pie izquierdo y derecho

#### Script 005: Campo de Antepié Izquierdo

**Campo Agregado:**
```sql
ALTER TABLE product_requests 
ADD COLUMN forefoot_metatarsal_left TEXT DEFAULT NULL;
```

**Razón del cambio:**
- Muchos pacientes requieren configuraciones diferentes en cada pie
- Asimetrías biomecánicas son comunes
- Primera implementación de configuración bilateral

**Aprendizaje:**
- ⚠️ Agregar campos uno por uno es ineficiente
- 💡 Mejor planificar todos los campos bilaterales de una vez

#### Script 006: Campos Completos de Pie Izquierdo

**Campos Agregados:**
```sql
-- Antepié izquierdo
ALTER TABLE product_requests 
ADD COLUMN anterior_wedge_left TEXT DEFAULT NULL;

ALTER TABLE product_requests 
ADD COLUMN anterior_wedge_left_mm TEXT DEFAULT NULL;

-- Mediopié izquierdo
ALTER TABLE product_requests 
ADD COLUMN midfoot_arch_left TEXT DEFAULT NULL;

-- Retropié izquierdo
ALTER TABLE product_requests 
ADD COLUMN rearfoot_calcaneus_left TEXT DEFAULT NULL;
```

**Razón del cambio:**
- Completar la configuración bilateral para todas las zonas
- Consistencia en el naming: `_left` para pie izquierdo

**Impacto:**
- ✅ Configuración completa e independiente por pie
- ✅ Mayor precisión en pedidos personalizados
- ✅ Mejor experiencia para profesionales de la salud

#### Script 007: Campos Finales de Configuración Bilateral

**Campos Agregados:**
```sql
-- Realce de talón izquierdo
ALTER TABLE product_requests 
ADD COLUMN heel_raise_left_mm TEXT DEFAULT NULL;

-- Cuña posterior (ambos pies)
ALTER TABLE product_requests 
ADD COLUMN posterior_wedge TEXT DEFAULT NULL;

ALTER TABLE product_requests 
ADD COLUMN posterior_wedge_mm TEXT DEFAULT NULL;

ALTER TABLE product_requests 
ADD COLUMN posterior_wedge_left TEXT DEFAULT NULL;

ALTER TABLE product_requests 
ADD COLUMN posterior_wedge_left_mm TEXT DEFAULT NULL;
```

**Razón del cambio:**
- Completar la configuración de retropié para ambos pies
- Agregar cuña posterior que faltaba en el esquema inicial

**Impacto:**
- ✅ Esquema de base de datos completo
- ✅ Soporte total para configuración bilateral
- ✅ Todas las zonas del pie cubiertas

**Convención de Naming Final:**
- Sin sufijo = Pie derecho (por defecto)
- Sufijo `_left` = Pie izquierdo
- Sufijo `_mm` = Medida en milímetros

---

### Fase 4: Mejoras en la Interfaz de Usuario

#### Implementación del Formulario Dinámico

**Características Agregadas:**

1. **Multi-Producto con useFieldArray**
```typescript
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "products",
})

const addProduct = () => {
  append({
    patient_name: "",
    patient_lastname: "",
    product_type: "",
    // ... más campos
  })
}
```

**Beneficios:**
- ✅ Agregar/eliminar productos dinámicamente
- ✅ Validación independiente por producto
- ✅ Mejor UX para pedidos múltiples

2. **Validación en Tiempo Real**
```typescript
const form = useForm<OrderFormData>({
  resolver: zodResolver(orderFormSchema),
  mode: 'onChange' // Validación mientras escribe
})
```

**Beneficios:**
- ✅ Feedback inmediato al usuario
- ✅ Reducción de errores en envío
- ✅ Mejor experiencia de usuario

3. **Barra de Progreso**
```typescript
<FormProgressBar 
  currentStep={currentStep} 
  totalSteps={totalSteps} 
/>
```

**Beneficios:**
- ✅ Usuario sabe dónde está en el proceso
- ✅ Motivación para completar el formulario
- ✅ Mejor percepción de progreso

#### Componente ProductForm Mejorado

**Características:**

1. **Secciones Colapsables por Zona**
```typescript
<Accordion type="single" collapsible>
  <AccordionItem value="forefoot">
    <AccordionTrigger>Antepié</AccordionTrigger>
    <AccordionContent>
      {/* Campos de antepié */}
    </AccordionContent>
  </AccordionItem>
  {/* Más zonas... */}
</Accordion>
```

2. **Campos Condicionales**
```typescript
{anteriorWedge !== "Ninguna" && (
  <FormField
    name="anterior_wedge_mm"
    render={({ field }) => (
      <Input 
        type="number" 
        placeholder="Espesor en mm" 
        {...field} 
      />
    )}
  />
)}
```

3. **Configuración Bilateral con Tabs**
```typescript
<Tabs defaultValue="right">
  <TabsList>
    <TabsTrigger value="right">Pie Derecho</TabsTrigger>
    <TabsTrigger value="left">Pie Izquierdo</TabsTrigger>
  </TabsList>
  <TabsContent value="right">
    {/* Campos pie derecho */}
  </TabsContent>
  <TabsContent value="left">
    {/* Campos pie izquierdo */}
  </TabsContent>
</Tabs>
```

**Beneficios:**
- ✅ Interfaz organizada y limpia
- ✅ Fácil navegación entre zonas
- ✅ Configuración bilateral intuitiva

#### Página de Ayuda (/zones-help)

**Contenido:**
- Diagrama visual del pie con zonas marcadas
- Descripción de cada zona
- Ejemplos de configuraciones comunes
- Guía de cuándo usar cada opción

**Beneficios:**
- ✅ Reduce consultas al soporte
- ✅ Mejora la precisión de los pedidos
- ✅ Educa a los usuarios

#### Tema Claro/Oscuro

**Implementación:**
```typescript
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

**Beneficios:**
- ✅ Mejor experiencia en diferentes condiciones de luz
- ✅ Preferencia del usuario respetada
- ✅ Reducción de fatiga visual

---

### Fase 5: Integraciones Externas

#### Google Sheets Integration

**Evolución:**

1. **Versión Inicial:** Layout simple en columnas
2. **Versión 2:** Layout configurable (rows/columns)
3. **Versión 3:** Soporte multi-producto con múltiples filas
4. **Versión 4:** Timestamp en zona horaria Argentina
5. **Versión Final:** Encabezados formateados y columnas organizadas

**Problemas Resueltos:**

1. **Private Key con formato incorrecto**
```typescript
// ❌ Problema: Key con \n escapados
const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY

// ✅ Solución: Sanitizar la key
const privateKey = rawPrivateKey
  ?.replace(/^"|"$/g, '')  // Remover comillas
  ?.replace(/\\n/g, '\n')  // Convertir \n a saltos reales
```

2. **SheetId hardcodeado**
```typescript
// ❌ Problema: sheetId: 0 (asume primera hoja)
const sheetId = 0

// ✅ Solución: Resolver dinámicamente
const meta = await this.sheets.spreadsheets.get({
  spreadsheetId,
  fields: 'sheets(properties(sheetId,title))'
})
const targetSheet = meta.data.sheets?.find(s => s.properties?.title === sheetName)
const sheetId = targetSheet?.properties?.sheetId
```

3. **Zona horaria incorrecta**
```typescript
// ❌ Problema: Timestamp en UTC
const timestamp = new Date().toISOString()

// ✅ Solución: Timestamp en zona Argentina
const argDate = new Date(date.toLocaleString('en-US', { 
  timeZone: 'America/Argentina/Buenos_Aires' 
}))
const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
```

#### Brevo Email Integration

**Evolución:**

1. **Versión Inicial:** Email simple de texto
2. **Versión 2:** Template HTML básico
3. **Versión 3:** Template con logo y estilos
4. **Versión Final:** Template responsive con detalles completos

**Template Features:**
- Logo de la empresa
- Información del pedido
- Detalles de cada producto
- Configuración por zona
- Notas adicionales
- Footer con información de contacto

---

## Resumen de Cambios por Tabla

### `product_requests` - Evolución Completa

| Fase | Campos Agregados | Propósito |
|------|------------------|-----------|
| 1 | `product_type`, `zone_option_1-5`, `heel_height`, `posterior_wedge` | Estructura inicial |
| 2 | `template_size`, `template_color` | Información básica |
| 2 | `forefoot_metatarsal`, `anterior_wedge`, `anterior_wedge_mm` | Configuración antepié |
| 2 | `midfoot_arch`, `midfoot_external_wedge` | Configuración mediopié |
| 2 | `rearfoot_calcaneus`, `heel_raise_mm` | Configuración retropié |
| 2 | `patient_name`, `patient_lastname` | Datos del paciente |
| 3 | `forefoot_metatarsal_left` | Inicio bilateral |
| 3 | `anterior_wedge_left`, `anterior_wedge_left_mm` | Antepié izquierdo |
| 3 | `midfoot_arch_left` | Mediopié izquierdo |
| 3 | `rearfoot_calcaneus_left` | Retropié izquierdo |
| 3 | `heel_raise_left_mm` | Realce izquierdo |
| 3 | `posterior_wedge`, `posterior_wedge_mm` | Cuña posterior derecha |
| 3 | `posterior_wedge_left`, `posterior_wedge_left_mm` | Cuña posterior izquierda |

**Total de campos:** 30+ campos en la tabla final

---

## Lecciones de la Evolución

### ✅ Qué Funcionó Bien

1. **Migraciones Incrementales**
   - Cambios pequeños y frecuentes
   - Fácil de revertir si hay problemas
   - Mejor trazabilidad de cambios

2. **Valores por Defecto NULL**
   - No rompe datos existentes
   - Permite migración gradual
   - Facilita testing

3. **Naming Consistente**
   - Convención `_left` para pie izquierdo
   - Convención `_mm` para medidas
   - Fácil de entender y mantener

4. **Separación de Responsabilidades**
   - Servicios dedicados para cada integración
   - Componentes reutilizables
   - Código mantenible

### ⚠️ Qué Podría Mejorarse

1. **Planificación Inicial**
   - Debimos planificar configuración bilateral desde el inicio
   - Evitaría múltiples migraciones

2. **Naming de Campos Iniciales**
   - `zone_option_1-5` muy genéricos
   - Mejor usar nombres descriptivos desde el inicio

3. **Testing**
   - Agregar tests automatizados más temprano
   - Evitaría regresiones en integraciones

4. **Documentación**
   - Documentar decisiones mientras se toman
   - No esperar al final del proyecto

### 💡 Mejores Prácticas Aprendidas

1. **Validar Variables de Entorno Temprano**
   - Fallar rápido si falta configuración
   - Mensajes de error descriptivos

2. **Logging Detallado en Integraciones**
   - Facilita debugging de problemas
   - Especialmente importante en producción

3. **Sanitización de Datos**
   - Siempre sanitizar inputs externos
   - Especialmente claves privadas y secrets

4. **Configuración Flexible**
   - Usar variables de entorno para comportamiento
   - Facilita diferentes configuraciones por ambiente

5. **Feedback Visual al Usuario**
   - Toasts para confirmaciones
   - Loading states
   - Mensajes de error claros

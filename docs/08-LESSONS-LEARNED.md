# Lecciones Aprendidas

## 1. Planificación y Diseño

### ✅ Qué Funcionó Bien

#### Migraciones Incrementales
- **Decisión:** Hacer cambios pequeños y frecuentes en la base de datos
- **Resultado:** Fácil de rastrear, revertir y debuggear
- **Aprendizaje:** Las migraciones pequeñas son más seguras que grandes refactorizaciones

#### Separación de Responsabilidades
- **Decisión:** Servicios dedicados para cada integración
- **Resultado:** Código mantenible y testeable
- **Aprendizaje:** La arquitectura modular facilita el crecimiento del proyecto

#### Validación en Múltiples Capas
- **Decisión:** Validar en cliente, servidor y base de datos
- **Resultado:** Datos consistentes y menos errores
- **Aprendizaje:** La redundancia en validación es una buena práctica

### ⚠️ Qué Podría Mejorarse

#### Planificación de Configuración Bilateral
- **Problema:** No se planificó desde el inicio la configuración por pie
- **Impacto:** Múltiples migraciones (005-007) para agregar campos
- **Lección:** Investigar todos los requisitos antes de diseñar el esquema

#### Naming de Campos Iniciales
- **Problema:** Campos genéricos como `zone_option_1-5`
- **Impacto:** Confusión y necesidad de refactorización
- **Lección:** Usar nombres descriptivos desde el principio

#### Testing Automatizado
- **Problema:** Tests agregados tarde en el desarrollo
- **Impacto:** Algunos bugs llegaron a producción
- **Lección:** Implementar tests desde el inicio del proyecto

---

## 2. Integraciones Externas

### Google Sheets API

#### Problema: Private Key con Formato Incorrecto
**Situación:**
```typescript
// La key venía con \n escapados
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0..."
```

**Solución:**
```typescript
const privateKey = rawPrivateKey
  .replace(/^"|"$/g, '')      // Remover comillas
  .replace(/\\n/g, '\n')      // Convertir \n a saltos reales
```

**Lección:** Siempre sanitizar variables de entorno sensibles

#### Problema: SheetId Hardcodeado
**Situación:**
```typescript
// Asumíamos que el sheetId siempre era 0
const sheetId = 0
```

**Solución:**
```typescript
// Resolver dinámicamente
const meta = await this.sheets.spreadsheets.get({
  spreadsheetId,
  fields: 'sheets(properties(sheetId,title))'
})
const targetSheet = meta.data.sheets?.find(
  s => s.properties?.title === sheetName
)
const sheetId = targetSheet?.properties?.sheetId
```

**Lección:** No asumir valores; siempre consultar dinámicamente

#### Problema: Zona Horaria Incorrecta
**Situación:**
```typescript
// Timestamps en UTC
const timestamp = new Date().toISOString()
```

**Solución:**
```typescript
// Timestamp en zona Argentina
const argDate = new Date(
  date.toLocaleString('en-US', { 
    timeZone: 'America/Argentina/Buenos_Aires' 
  })
)
```

**Lección:** Considerar zonas horarias desde el inicio

### Brevo Email API

#### Problema: Emails en Spam
**Situación:** Los emails llegaban a spam

**Solución:**
1. Verificar dominio en Brevo
2. Configurar SPF y DKIM records
3. Usar templates profesionales con HTML válido

**Lección:** La configuración de dominio es crítica para deliverability

#### Problema: Límite de Envíos
**Situación:** Plan gratuito con límite de 300 emails/día

**Solución:**
- Implementar rate limiting
- Priorizar emails críticos (confirmación al cliente)
- Emails al admin como "nice to have"

**Lección:** Considerar límites de servicios gratuitos en el diseño

---

## 3. Base de Datos y Supabase

### Row Level Security (RLS)

#### Problema: Políticas Muy Restrictivas
**Situación:** Queries bloqueadas por RLS en desarrollo

**Solución:**
```sql
-- Políticas de desarrollo más permisivas
CREATE POLICY "Allow all for development" 
ON table_name
FOR ALL 
USING (true) 
WITH CHECK (true);
```

**Lección:** Tener políticas diferentes para dev y producción

#### Problema: Cascada de Eliminación
**Situación:** Eliminar un pedido no eliminaba los productos

**Solución:**
```sql
-- Agregar ON DELETE CASCADE
ALTER TABLE product_requests
ADD CONSTRAINT fk_customer
FOREIGN KEY (customer_request_id)
REFERENCES customer_requests(id)
ON DELETE CASCADE;
```

**Lección:** Definir comportamiento de cascada desde el inicio

### Migraciones

#### Problema: Datos Existentes
**Situación:** Agregar columnas NOT NULL rompía datos existentes

**Solución:**
```sql
-- Usar NULL por defecto
ALTER TABLE product_requests 
ADD COLUMN new_field TEXT DEFAULT NULL;

-- Migrar datos existentes
UPDATE product_requests 
SET new_field = 'valor_default' 
WHERE new_field IS NULL;

-- Opcional: cambiar a NOT NULL después
ALTER TABLE product_requests 
ALTER COLUMN new_field SET NOT NULL;
```

**Lección:** Migraciones en pasos para no romper datos existentes

---

## 4. Frontend y UX

### React Hook Form

#### Problema: Re-renders Excesivos
**Situación:** El formulario se re-renderizaba en cada cambio

**Solución:**
```typescript
// Usar mode: 'onBlur' en lugar de 'onChange'
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur' // Validar al salir del campo
})

// Memoizar callbacks
const handleSubmit = useCallback(async (data) => {
  // ...
}, [])
```

**Lección:** Optimizar validación para mejor performance

#### Problema: Validación de Campos Condicionales
**Situación:** Validar campos que dependen de otros

**Solución:**
```typescript
const schema = z.object({
  anterior_wedge: z.string().optional(),
  anterior_wedge_mm: z.string().optional()
}).refine(
  (data) => {
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

**Lección:** Usar `refine` para validaciones complejas

### UI/UX

#### Problema: Formulario Abrumador
**Situación:** Demasiados campos visibles a la vez

**Solución:**
- Usar Accordion para secciones colapsables
- Tabs para pie izquierdo/derecho
- Barra de progreso para motivación

**Lección:** Dividir formularios largos en secciones manejables

#### Problema: Feedback Insuficiente
**Situación:** Usuario no sabía si el pedido se envió

**Solución:**
- Toast notifications
- Loading states
- Página de confirmación

**Lección:** El feedback visual es crítico para la confianza del usuario

---

## 5. Desarrollo y Deployment

### Variables de Entorno

#### Problema: Variables Faltantes en Producción
**Situación:** App funcionaba en dev pero fallaba en producción

**Solución:**
1. Crear archivo `.env.example` con todas las variables
2. Validar variables al inicializar servicios
3. Usar Vercel dashboard para configurar variables

**Lección:** Documentar y validar todas las variables requeridas

#### Problema: Secrets en el Código
**Situación:** API keys accidentalmente en el código

**Solución:**
- Usar `.gitignore` para `.env.local`
- Code review para detectar secrets
- Usar variables de entorno siempre

**Lección:** Nunca commitear secrets al repositorio

### Deployment en Vercel

#### Problema: Build Failures
**Situación:** Builds fallaban por tipos incorrectos

**Solución:**
```typescript
// Usar type checking estricto
"strict": true,
"noImplicitAny": true,

// Corregir todos los errores de tipos antes de deploy
npm run build
```

**Lección:** Configurar TypeScript estricto desde el inicio

#### Problema: Environment Variables
**Situación:** Variables no disponibles en build time

**Solución:**
- Variables con `NEXT_PUBLIC_` para cliente
- Variables sin prefijo para servidor
- Configurar en Vercel dashboard

**Lección:** Entender la diferencia entre build time y runtime

---

## 6. Performance

### Optimizaciones Implementadas

#### Lazy Loading
```typescript
const AdminDashboard = dynamic(
  () => import('@/components/admin-dashboard'),
  { loading: () => <LoadingSpinner />, ssr: false }
)
```

**Resultado:** Reducción de 40% en bundle inicial

#### Memoización
```typescript
const filteredOptions = useMemo(() => {
  return options.filter(opt => opt.category === selectedCategory)
}, [options, selectedCategory])
```

**Resultado:** Menos re-renders, UI más fluida

#### Image Optimization
```typescript
<Image
  src="/logo.png"
  alt="Logo"
  width={320}
  height={320}
  priority
/>
```

**Resultado:** Carga más rápida de imágenes

**Lección:** Next.js ofrece optimizaciones out-of-the-box, usarlas

---

## 7. Seguridad

### Implementaciones de Seguridad

#### Row Level Security
- Políticas granulares en Supabase
- Acceso público limitado a lectura
- Operaciones admin protegidas

#### Sanitización de Inputs
- Remover caracteres peligrosos
- Validación con Zod
- Límites de longitud

#### HTTPS Everywhere
- Todas las integraciones usan HTTPS
- Vercel proporciona SSL automático

**Lección:** La seguridad debe ser parte del diseño, no un agregado

---

## 8. Documentación

### Qué Documentar

#### Código
- JSDoc para funciones públicas
- Comentarios para lógica compleja
- README por módulo

#### Decisiones
- Por qué se eligió una tecnología
- Trade-offs considerados
- Alternativas evaluadas

#### Configuración
- Variables de entorno requeridas
- Pasos de setup
- Troubleshooting común

**Lección:** La documentación es tan importante como el código

---

## 9. Colaboración y Comunicación

### Con el Cliente

#### Iteraciones Frecuentes
- Mostrar progreso regularmente
- Obtener feedback temprano
- Ajustar según necesidades reales

#### Demos
- Demostrar funcionalidad en ambiente de staging
- Permitir que el cliente pruebe
- Documentar feedback

**Lección:** La comunicación frecuente previene malentendidos

### Con el Equipo

#### Code Reviews
- Revisar código antes de merge
- Compartir conocimiento
- Mantener calidad consistente

#### Pair Programming
- Resolver problemas complejos juntos
- Transferir conocimiento
- Reducir bugs

**Lección:** La colaboración mejora la calidad del código

---

## 10. Mejores Prácticas Generales

### Do's ✅

1. **Validar en múltiples capas** (cliente, servidor, BD)
2. **Usar TypeScript estricto** desde el inicio
3. **Implementar logging detallado** en integraciones
4. **Sanitizar variables de entorno** sensibles
5. **Hacer migraciones incrementales** pequeñas
6. **Documentar decisiones** importantes
7. **Usar nombres descriptivos** para variables y funciones
8. **Implementar error handling** robusto
9. **Optimizar performance** desde el inicio
10. **Testear en diferentes ambientes** (dev, staging, prod)

### Don'ts ❌

1. **No hardcodear valores** que puedan cambiar
2. **No asumir valores** sin validar
3. **No ignorar errores** silenciosamente
4. **No commitear secrets** al repositorio
5. **No hacer cambios grandes** sin planificar
6. **No saltear validación** por rapidez
7. **No usar `any`** en TypeScript sin razón
8. **No ignorar warnings** del compilador
9. **No deployar sin testear** localmente
10. **No dejar TODOs** sin resolver

---

## Conclusiones

### Éxitos del Proyecto

1. ✅ Sistema funcional y en producción
2. ✅ Integraciones estables con servicios externos
3. ✅ Arquitectura escalable y mantenible
4. ✅ Validación robusta en múltiples capas
5. ✅ Experiencia de usuario fluida
6. ✅ Código bien tipado con TypeScript
7. ✅ Documentación completa

### Áreas de Mejora

1. 🔄 Agregar tests automatizados
2. 🔄 Implementar autenticación de usuarios
3. 🔄 Mejorar dashboard administrativo
4. 🔄 Agregar notificaciones en tiempo real
5. 🔄 Implementar sistema de reportes
6. 🔄 Optimizar queries de base de datos
7. 🔄 Agregar monitoreo y alertas

### Recomendaciones para Futuros Proyectos

1. **Planificar el esquema de BD completamente** antes de empezar
2. **Implementar tests desde el día 1**
3. **Documentar mientras se desarrolla**, no al final
4. **Usar feature flags** para despliegues graduales
5. **Implementar CI/CD** desde el inicio
6. **Considerar internacionalización** si es necesario
7. **Planificar escalabilidad** desde el diseño
8. **Establecer convenciones de código** temprano
9. **Usar herramientas de monitoreo** en producción
10. **Mantener dependencias actualizadas** regularmente

---

## Recursos Útiles

### Documentación Oficial
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Brevo API](https://developers.brevo.com/)
- [Zod Documentation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)

### Herramientas
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Regex101](https://regex101.com/)
- [JSON Formatter](https://jsonformatter.org/)
- [Vercel Dashboard](https://vercel.com/dashboard)

### Comunidades
- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com/)
- [Stack Overflow](https://stackoverflow.com/)

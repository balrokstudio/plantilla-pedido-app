# Documentación de Desarrollo - Sistema de Pedidos de Plantillas Ortopédicas

## Índice General
1. [Visión General](01-OVERVIEW.md) ← Estás aquí
2. [Arquitectura y Stack](02-ARCHITECTURE.md)
3. [Cambios y Evolución](03-EVOLUTION.md)
4. [Buenas Prácticas](04-BEST-PRACTICES.md)
5. [Integraciones](05-INTEGRATIONS.md)
6. [Base de Datos](06-DATABASE.md)
7. [Configuración](07-CONFIGURATION.md)
8. [Lecciones Aprendidas](08-LESSONS-LEARNED.md)

---

## Visión General del Proyecto

**Nombre:** Sistema de Pedidos de Plantillas Ortopédicas - Under Feet  
**Propósito:** Aplicación web para gestionar pedidos personalizados de plantillas ortopédicas con configuraciones específicas por zona del pie.

### Características Principales

#### 1. Formulario Dinámico Multi-Producto
- Agregar/eliminar productos dinámicamente
- Validación en tiempo real con React Hook Form + Zod
- Barra de progreso visual del formulario
- Guardado automático de estado (opcional)

#### 2. Configuración Bilateral del Pie
- Configuración independiente para pie izquierdo y derecho
- Campos específicos por zona:
  - **Antepié:** Zona metatarsal, cuña anterior con espesor en mm
  - **Mediopié:** Zona del arco, cuña externa
  - **Retropié:** Zona calcáneo, realce de talón en mm, cuña posterior

#### 3. Gestión de Pacientes
- Datos separados del profesional y del paciente
- Múltiples productos por pedido
- Cada producto puede ser para un paciente diferente

#### 4. Integraciones Externas
- **Google Sheets:** Registro automático de pedidos
- **Brevo (Sendinblue):** Notificaciones por email
- **Supabase:** Base de datos PostgreSQL con RLS

#### 5. Panel Administrativo
- Gestión de opciones de productos
- Configuración de colores por tipo de plantilla
- Visualización y exportación de pedidos
- Estadísticas de ventas

#### 6. Experiencia de Usuario
- Diseño responsive (mobile-first)
- Tema claro/oscuro
- Página de ayuda con información de zonas del pie
- Feedback visual en tiempo real

### Flujo de Trabajo

```
1. Cliente/Profesional accede al formulario
   ↓
2. Completa datos del profesional
   ↓
3. Agrega uno o más productos
   - Datos del paciente
   - Tipo de plantilla
   - Talle y color
   - Configuración por zona del pie
   ↓
4. Envía el formulario
   ↓
5. Sistema procesa el pedido:
   - Valida datos
   - Guarda en Supabase
   - Registra en Google Sheets
   - Envía emails de confirmación
   ↓
6. Confirmación al usuario
   ↓
7. Administrador recibe notificación
```

### Tecnologías Clave

- **Frontend:** Next.js 14 + React 18 + TailwindCSS
- **Backend:** Next.js API Routes + Node.js
- **Base de Datos:** Supabase (PostgreSQL)
- **UI Components:** Radix UI + shadcn/ui
- **Validación:** Zod + React Hook Form
- **Integraciones:** Google Sheets API + Brevo API
- **Deployment:** Vercel

### Métricas del Proyecto

- **Líneas de código:** ~15,000+
- **Componentes React:** 20+
- **API Endpoints:** 18+
- **Migraciones de BD:** 7
- **Tiempo de desarrollo:** Iterativo (múltiples fases)

### Usuarios del Sistema

1. **Profesionales de la Salud**
   - Podólogos
   - Traumatólogos
   - Fisioterapeutas
   - Ortopedistas

2. **Administradores**
   - Gestión de opciones de productos
   - Revisión de pedidos
   - Configuración del sistema

3. **Clientes Finales (Indirecto)**
   - Pacientes que reciben las plantillas
   - No interactúan directamente con el sistema

### Objetivos del Proyecto

#### Objetivos Funcionales
- ✅ Simplificar el proceso de pedido de plantillas personalizadas
- ✅ Reducir errores en la especificación de configuraciones
- ✅ Automatizar el registro y notificación de pedidos
- ✅ Permitir configuraciones asimétricas (bilateral)
- ✅ Facilitar la gestión administrativa

#### Objetivos Técnicos
- ✅ Arquitectura escalable y mantenible
- ✅ Validación robusta en múltiples capas
- ✅ Integración con servicios externos confiables
- ✅ Experiencia de usuario fluida y responsive
- ✅ Código bien documentado y tipado

#### Objetivos de Negocio
- ✅ Mejorar la eficiencia operativa
- ✅ Reducir tiempo de procesamiento de pedidos
- ✅ Minimizar errores de comunicación
- ✅ Facilitar el seguimiento de pedidos
- ✅ Mejorar la satisfacción del cliente

### Estado Actual

**Versión:** 1.0.0  
**Estado:** Producción  
**Última actualización:** 2024  
**Deployment:** [Vercel](https://vercel.com/balrok-studios-projects/v0-plantilla-ortopedica-app)

### Próximos Pasos

1. **Autenticación de Usuarios**
   - Sistema de login para profesionales
   - Historial de pedidos por usuario

2. **Dashboard Mejorado**
   - Gráficos de estadísticas
   - Filtros avanzados de pedidos

3. **Notificaciones en Tiempo Real**
   - WebSockets para actualizaciones
   - Notificaciones push

4. **Exportación Avanzada**
   - PDF de pedidos
   - Reportes personalizados

5. **Integración con ERP**
   - Sincronización con sistema de inventario
   - Gestión de producción

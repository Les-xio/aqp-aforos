# Informe de Avance — AQP Aforos
## Período: Mayo – Junio 2026

---

## Semana 1 — Fundación y Autenticación

### Login y Recuperación de Contraseña
- Rediseño completo de `LoginPage`: gradiente azul `#003DA5 → #0D5BFF`, avatar circular con logo, campos redondeados, botón gradiente, círculos decorativos de fondo
- Creación de `RecuperarPasswordPage`: formulario para solicitar enlace de recuperación. Se detectó que el backend tenía `emailService: null`, por lo que se modificó la página para mostrar el enlace directamente con un botón "Ir a restablecer contraseña"
- Creación de `RestablecerPasswordPage`: formulario con nueva contraseña, confirmación, toggle de visibilidad, redirección automática al login tras éxito
- Rutas agregadas: `/recuperar-password`, `/restablecer-password/:token`

### Layout de Aforador
- AppBar simplificada: solo icono `RouteIcon` + "AQP AFOROS" + botón "Cerrar sesión"
- Prop `hideUserBar` para páginas que necesitan espacio completo (sin padding ni fondo blanco)

---

## Semana 2 — Módulo Aforador (Registro de Datos)

### FranjasPage
- Migración a MUI v9 Grid: `item` → `size` prop
- Auto‑cierre de franjas: `Set` `cerradasAuto` para evitar 400 duplicados
- Fix: `useRef is not defined` por HMR al recargar con F5

### ConteoVehicularPage
- Timer con colores de semáforo (verde → amarillo → rojo)
- Auto‑cierre corregido: `prevSegundos` ref para evitar race conditions en React batching
- Punto/sentido obtenido desde `turnoService.getPuntos` (el objeto franja no incluye esos datos)
- `popstate` trap para bloquear navegación hacia atrás del navegador
- Inputs numéricos: `Math.max(0, ...)` en handlers + filtro onChange

### ParadasColasPage
- Rediseño completo emparejado con ConteoVehicularPage: misma tarjeta de timer, header gradiente, tabs, formularios
- Bloqueo de navegación hacia atrás
- Prevención de negativos

### ValidarFranjaPage
- Header rediseñado con tarjeta gradiente + información de punto/sentido
- Captura de foto con `evidenciaService`

### MenuPrincipalPage
- Título con `text-shadow`
- Botón color ámbar (`#a56800`)
- Bloqueo de navegación hacia atrás

---

## Semana 3 — Módulo Administrador y CRUDs

### Sidebar
- Tema oscuro `#1E293B`, íconos blancos, hover azul, indicador activo (borde izquierdo 3px)
- Módulos reordenados: Turnos, Franjas con icono `PublicIcon`

### AdminLayout
- Fondo degradado `#f8fafc → #eef2f7`

### Dashboard
- 4 tarjetas KPI con degradados de colores
- Header de bienvenida con último acceso y estado del sistema
- Grid de módulos con `hover: scale(1.03)`
- Tarjeta "Turnos" agregada, "Auditoría" al final, Franjas icono `PublicIcon`

### CRUDs — Usuarios, Categorías, Subcategorías, Vehículos, Puntos de Aforo
- Cards con header gradiente
- Botones gradientes
- Fondos de campos grises (`#F9FAFB`)
- Diálogos estilizados (Material UI Dialog)
- Select con `value={String(id)}` para coincidir tipo Controller (string vs number)
- Paginación: `rowsPerPage={Math.max(5, data.length)}`
- Label shrink forzado con `Controller` + `slotProps.inputLabel.shrink`
- Correo DNI: botón 🔍 azul que consulta API RENIEC vía proxy backend y autocompleta nombres + apellidos

### DataTable
- Headers en mayúsculas con fondo `#F8FAFC`
- Fuente Inter
- Card con bordes redondeados
- Hover `#EFF6FF`
- Botones circulares: edit (`#DBEAFE/#2563EB`), delete (`#FEE2E2/#DC2626`)

### TurnosPage (nuevo)
- Lista de aforadores con inputs de fecha/hora/horas (default: hoy, próximo cuarto, 4h)
- Botón "Generar Turno" con gradiente azul `#2563EB → #003DA5`
- Historial de turnos en tabla
- Header Paper con icono `AccessTime` gradiente y botón "Volver al inicio" inline

### FranjasAdminPage (nuevo)
- Lista de turnos con franjas expandibles
- Modal de detalle con foto GPS + embed Google Maps
- Icono `PublicIcon`

---

## Semana 4 — Reportes, Auditoría, PostGIS, PWA y Offline

### BuscarPage
- Header gradiente + subtítulo
- Totales por tipo en tarjetas gradientes
- Fila de total en tabla
- Chips con iconos para vehículo/acción/estado
- Colores alternados en filas
- Spinner durante búsqueda
- Botones de exportación visibles solo con resultados
- Columna "Acciones" eliminada + imports no usados

### ReportesPage
- Filtros: punto, aforador, fecha desde/hasta
- Exportaciones CSV/XLSX con parámetros
- Tabs: Subidas/Bajadas + Cola Vehicular
- Fix: `rol: 'aforador'` en minúsculas (solución a error 500)
- Tab switch ya no auto-carga datos
- Headers de tabla correctos por tab (colas sin columna "Vehículo")
- `alignItems` en `sx` (no DOM prop)

### AuditoriaPage
- Header gradiente con `SecurityIcon` morado
- "Volver al inicio" con `HomeIcon`
- Columna Usuario: fallback `correo → username → ID` cuando el usuario fue eliminado
- Columna Detalle: sin truncado, `whiteSpace: pre-wrap`, `JSON.stringify` indentado

### PostGIS (backend)
- Docker images: `postgis/postgis:16-3.4`
- `init-db.sql`: `CREATE EXTENSION postgis`, columna `ubicacion GEOGRAPHY(Point,4326)`, trigger `sync_evidencia_ubicacion`, índice GIST
- `migrate-postgis.sql`: migración idempotente para BD existentes
- `EvidenciaFotoRepository.findByProximity(lat, lon, radioMetros)` con `ST_DWithin`
- Nuevo endpoint `GET /api/evidencias-foto/cercanas`

### Generación de Turnos (backend)
- `GenerarTurnoAdminUseCase`: crea turno + `horas × 4` franjas, acepta `fechaInicio` opcional
- `POST /api/turnos/generar-admin`
- `UsuarioRepository.findAll` acepta filtro `rol`

### Exportaciones (backend)
- `sendExport` acepta 6º parámetro opcional `totals`
- CSV/XLSX para conteos y ocupación: apéndice "Totales por tipo de vehículo"
- `calcularTotales` agrupa por `vehiculo.tipo`
- Backward compatible (paradas no afectado)

### PWA — Progressive Web App
- `vite-plugin-pwa` instalado y configurado
- Service Worker con `autoUpdate`
- Precache de `*.{js,css,html,svg,png,ico,json,woff,woff2}`
- API calls: estrategia `NetworkFirst` con timeout de 5s
- Google Fonts: `CacheFirst` con expiración de 30 días
- Manifest: nombre "AQP Aforos", color `#003DA5`, icono SVG, `display: standalone`
- Meta tags: `apple-touch-icon`, `theme-color`, `status-bar-style`
- Icono PWA en `public/pwa-icon.svg` (512×512, escudo con "A")

### Offline — Almacenamiento y Sincronización
- `idb` (IndexedDB wrapper) instalado
- `offlineStorage.js` reemplazó `localStorage` por IndexedDB (misma API, mayor capacidad, sin bloqueo)
  - 5 stores: `conteos`, `ocupaciones`, `paradas`, `colas`, `evidencias`
  - Cada item con `idTemp`, `estado: 'PENDIENTE'`, `createdAt`
- `syncService.js`: procesa cola FIFO al recuperar conexión
  - Mapea cada store a su endpoint REST
  - Elimina items con errores 400/404/409 (datos inválidos)
  - Reporta progreso (`synced`, `total`)
- `SyncContext.jsx`: provee estado global de sincronización
  - Detecta `online`/`offline` vía event listeners
  - Sincronización automática al reconectar
  - Expone `pendingCount`, `syncing`, `syncNow()`
- `AforadorLayout`: chips en la AppBar según estado de conexión
  - 🟢 "En línea" (verde)
  - 🟡 "X pendientes" + animación de giro durante sincronización
  - 🔴 "Sin conexión" (rojo)

### Configuración del Turno del Aforador
- Backend: `generarAdmin` crea turno con `activo: false` (pendiente, no iniciado automáticamente)
- `TurnoRepository.findPendienteByUsuario`: busca turno `activo: false, fecha_fin: null`
- Endpoints: `GET /api/turnos/pendiente`, `PUT /api/turnos/activar-pendiente`
- `IniciarTurnoPage`: verifica turno pendiente asignado por admin
  - Si existe: muestra info + formulario punto/sentido + botón "INICIAR TURNO"
  - Si no existe: mensaje "El administrador debe asignarte un turno" + botón deshabilitado
- `TurnoContext`: nuevos métodos `verificarTurnoPendiente`, `activarTurnoPendiente`

---

## Resumen de Archivos Creados/Modificados

| Tipo | Cantidad |
|------|----------|
| Páginas nuevas (frontend) | 6 |
| Páginas rediseñadas (frontend) | 12 |
| Componentes nuevos/modificados | 4 |
| Servicios frontend nuevos | 4 |
| Contextos nuevos | 1 |
| Use cases backend nuevos | 2 |
| Controladores backend nuevos/modificados | 5 |
| Rutas backend nuevas | 3 |
| Repositorios backend modificados | 2 |
| Scripts BD | 3 |
| Archivos de configuración | 5 |

## Tecnologías Incorporadas
- `vite-plugin-pwa` — Service Worker + Manifest
- `idb` — IndexedDB wrapper para almacenamiento offline
- `postgis/postgis:16-3.4` — Extensiones espaciales PostgreSQL
- Google Maps Embed API (sin API key) — Visualización GPS

## Próximos Pasos (Sugeridos)
1. Sincronización offline de evidencias foto (archivos grandes)
2. Pantalla de carga inicial (splash screen) para la PWA
3. Notificaciones push para recordatorio de franjas
4. Dashboard con gráficos (Chart.js o Recharts)
5. Roles más granular (supervisor, etc.)

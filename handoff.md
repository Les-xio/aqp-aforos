# Handoff - AQP Aforos

## Resumen del Proyecto

Sistema de aforo vehicular para la ciudad de Arequipa. Permite a "aforadores" registrar conteos vehiculares, ocupación, subidas/bajadas de pasajeros y colas vehiculares en puntos de monitoreo, con turnos y franjas horarias de 15 minutos. Tiene un módulo administrador para gestión de usuarios, vehículos, categorías y reportes.

---

## 1. Estructura del Proyecto

```
aqp-aforos/
├── Metro_Aforo_Backend/     # API REST (Node.js + Express + PostgreSQL)
├── Metro_Aforo_Frontend/    # SPA (React + Vite + MUI)
```

---

## 2. Backend (`Metro_Aforo_Backend/`)

### Stack
- **Runtime:** Node.js 20 (CommonJS)
- **Framework:** Express v4.21.2
- **DB:** PostgreSQL 16 via Sequelize ORM v6.37.5
- **Auth:** JWT (`jsonwebtoken` v9) + bcryptjs
- **Puerto:** `3001` (desarrollo) / `3000` (contenedor Docker)
- **Patrón:** Clean Architecture (domain/infrastructure/presentation/shared)

### Endpoints Principales

| Grupo | Métodos | Auth |
|-------|---------|------|
| `/api/auth/*` | login, logout, me, cambiar-password, recuperación | Público / JWT |
| `/api/usuarios/*` | CRUD usuarios | JWT + admin |
| `/api/turnos/*` | iniciar, cerrar, listar, activo, franjas, puntos | JWT |
| `/api/franjas/*` | iniciar, cerrar, omitir por ID | JWT |
| `/api/conteos-vehiculares/*` | POST (registrar), GET (listar/exportar) | JWT |
| `/api/conteos-ocupacion/*` | POST (registrar), GET (listar/exportar) | JWT |
| `/api/puntos-aforo/*` | CRUD puntos de aforo | JWT + admin |
| `/api/vehiculos/*` | CRUD vehículos + categorías + subcategorías | JWT + admin (GET público autenticado) |
| `/api/evidencias-foto/*` | POST upload foto (multipart) | JWT |
| `/api/subidas-bajadas/*` | POST (registrar), GET (listar/exportar) | JWT |
| `/api/colas-vehiculares/*` | POST (registrar), GET (listar/exportar) | JWT |
| `/api/reportes/*` | GET exportar conteos/ocupacion/paradas (csv/xlsx) | JWT + admin |
| `/health` | Health check | Público |

### Modelos BD (15 tablas)

- `usuarios` — admins y aforadores (roles: `administrador`, `aforador`)
- `categorias_vehiculares` / `subcategorias_vehiculares` / `vehiculos` — catálogo vehicular jerárquico
- `puntos_aforo` — puntos de monitoreo
- `turnos` / `turnos_puntos` — turnos con puntos y sentidos asignados (N:M)
- `franjas_horarias` — franjas de 15 min (estados: pendiente/completada/omitida)
- `conteos_vehiculares` — conteo por tipo de vehículo (+1/-1)
- `conteos_ocupacion` — niveles: vacio/medio/lleno/rebosando
- `evidencias_foto` — fotos con GPS
- `paradas_subidas_bajadas` — suben/bajan/insatisfechos
- `colas_vehiculares` — longitud de cola + observaciones
- `password_resets` — tokens de recuperación
- `auditoria` — log de acciones

### CORS
```js
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
```
Default: `*`. En producción se configura vía env.

### Formato Respuesta API
```json
{ "ok": true, "message": "...", "data": {...} }
{ "ok": false, "message": "...", "code": "..." }
```

---

## 3. Frontend (`Metro_Aforo_Frontend/`)

### Stack
- **Framework:** React 19 (JSX, sin TypeScript)
- **Build:** Vite 8
- **UI:** Material UI v9
- **HTTP:** Axios 1.16
- **Forms:** React Hook Form 7 + Zod 4
- **Routing:** React Router DOM 6
- **Estado Global:** React Context (AuthContext + TurnoContext)
- **Server State:** TanStack React Query 5 (configurado pero **no usado**)
- **Puerto:** `5173` (dev) / `80` (Docker)

### Roles y Rutas

**Aforador** (`/aforador/*`):
- Iniciar Turno → seleccionar punto + sentido
- Menú Principal → Conteo Vehicular / Paradas y Colas
- Franjas → grilla de slots de 15 min
- Validar Franja → cámara + GPS antes de iniciar
- Conteo Vehicular → tally por tipo + ocupación
- Paradas y Colas → tabs: Subidas/Bajadas + Cola en Semáforo

**Administrador** (`/admin/*`):
- Dashboard, Usuarios, Categorías, Subcategorías, Vehículos, Puntos de Aforo, Buscar, Reportes, Auditoría

### Comunicación Backend ↔ Frontend

**Conexión directa en desarrollo:**
- `VITE_API_URL=http://localhost:3001/api` (en `.env`)
- Frontend en `localhost:5173` → llamadas directas a `localhost:3001/api/*`
- Sin proxy de Vite configurado

**Proxy vía Nginx en Docker:**
- Frontend en puerto `80` (nginx)
- `VITE_API_URL=/api` (ruta relativa, se pasa como build arg)
- Nginx proxy reverse: `/api/*` → `http://backend:3000/api/`
- También: `/uploads/*` → `http://backend:3000`

### Autenticación (Frontend)

- Login: `POST /api/auth/login` → recibe JWT + usuario
- Token guardado en `localStorage` (`aqp_token`, `aqp_usuario`)
- Axios interceptor: attach `Authorization: Bearer <token>` a cada request
- 401 → limpia estado, redirige a `/login`
- `AuthContext` provee `usuario`, `token`, `login()`, `logout()`

### Soporte Offline

- `offlineStorage.js` guarda datos en `localStorage` cuando falla la API
- Colas: `aqp_pending_conteos`, `aqp_pending_ocupacion`, `aqp_pending_paradas`, `aqp_pending_colas`, `aqp_pending_evidencias`, `aqp_pending_turnos`
- `AforadorLayout` monitorea `navigator.onLine` con chip indicador

### Variables de Entorno

| Variable | Default desarrollo | Docker |
|----------|-------------------|--------|
| `VITE_API_URL` | `http://localhost:3001/api` | `/api` |

---

## 4. Docker / Deployment

### Desarrollo (`docker-compose.yml`)
- Postgres 16 (puerto `5432`)
- Backend (puerto `3001`)
- Frontend (puerto `5173`)

### Producción (`docker-compose.prod.yml`)
- Postgres 16
- Backend (con Nginx reverse proxy, vía Traefik)
- Frontend (build multi-stage, servido por nginx)

### Dockerfiles
- Backend: `node:20-alpine` (multi-stage: npm ci → node app)
- Frontend: `node:20-alpine` build → `nginx:alpine` (copia `dist/` + `nginx.conf`)

---

## 5. Issues Fixeados (Junio 2026)

### Problema principal: Pantalla en blanco al iniciar frontend

**Causa raíz:** El `AuthContext` inicializaba con datos corruptos o stale de `localStorage` (token + usuario de sesiones anteriores). Si el `JSON.parse` del usuario fallaba o si el token estaba expirado, la app redirigía a rutas protegidas que no podían cargar, resultando en pantalla en blanco.

**Fix:**
- `AuthContext.jsx`: Se agregó `try-catch` al `JSON.parse` para manejar datos corruptos en localStorage
- `AuthContext.jsx`: Ahora siempre verifica el token contra el backend (`GET /auth/me`) al iniciar, incluso si hay datos en localStorage. Si el token es inválido/expirado, limpia localStorage y redirige al login
- `IniciarTurnoPage.jsx`: Se eliminó código debug (console.log) y código comentado

### Otros fixes aplicados:

| Archivo | Fix |
|---------|-----|
| `AuthContext.jsx` | Manejo de errores en JSON.parse de localStorage |
| `AuthContext.jsx` | Verificación de token contra backend al startup |
| `IniciarTurnoPage.jsx` | Limpieza de código debug y comentado |
| `UsuariosPage.jsx` | Campo `user` → `username` (consistente con backend) |
| `AuditoriaPage.jsx` | Usa `usuarioService.getAuditoria()` en vez de `axiosClient` directo |
| `AppRoutes.jsx` | Rutas `/cambiar-password` y `/recuperar-password` agregadas |
| `index.html` | Favicon corregido: `vite.svg` → `favicon.svg` |
| Backend: `usuario.controller.js` | Nuevo método `listarAuditoria` |
| Backend: `usuario.routes.js` | Nueva ruta `GET /auditoria` |
| Backend: `controllers.js` | Inyección de `auditoriaRepository` al `UsuarioController` |
| Backend: `usuario.entity.js` | Acepta `username` además de `user` |
| Backend: `usuario.validator.js` | Valida `username` en vez de `user` |

## 6. Observaciones / Notas

1. **TanStack React Query está instalado pero no se usa** — toda la data fetching es con useEffect + useState directo. Se podría migrar o limpiar.
2. **Sin TypeScript** en frontend — todo en JSX plano.
3. **Sin WebSockets** — comunicación puramente REST (request-response).
4. **Evidencias foto** se guardan en `/uploads/` del backend, servidas estáticamente.
5. **Sincronización offline** implementada vía localStorage pero **no hay un mecanismo de re-intento automático** al volver online (solo almacena en cola).
6. **Categoría vehicular** es jerárquica: Categoría → Subcategoría → Vehículo.
7. **GPS** tiene fallback hardcodeado a coordenadas de Arequipa (-16.4090, -71.5375).
8. **Seed inicial** (`scripts/seed.js`) crea admin, aforador, categorías y puntos de aforo de ejemplo.
9. **Los reportes** se exportan como descarga de archivo (CSV o XLSX), no hay vista previa.
10. **El frontend está diseñado mobile-first** para uso en campo con tablets.

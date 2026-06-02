# AQP Aforos

Sistema de registro de aforos vehiculares.

## Estructura del proyecto

```
aqp-aforos/
├── Metro_Aforo_Backend/      # API REST (Node.js + Express + PostgreSQL)
│   ├── docker-compose.yml    # Orquestación de todos los servicios
│   ├── Dockerfile
│   └── ...
├── Metro_Aforo_Frontend/     # Interfaz React (Vite + MUI)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ...
└── README.md
```

## Requisitos

- Docker y Docker Compose instalados
- Puertos disponibles: 5432, 3001, 80

## Inicio rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/aqp-aforos.git
cd aqp-aforos/Metro_Aforo_Backend

# 2. Iniciar todos los servicios
docker compose up -d

# 3. Poblar la base de datos con datos iniciales
docker compose exec backend node scripts/seed.js

# 4. Acceder
#    Frontend: http://localhost
#    Backend:  http://localhost:3001/api
```

## Credenciales por defecto

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| Administrador | admin@aqpaforos.com | Admin123456 |
| Aforador | aforador@aqpaforos.com | Aforador123 |

## Servicios

| Servicio | Puerto interno | Puerto host | Descripción |
|----------|---------------|-------------|-------------|
| postgres | 5432 | 5432 | Base de datos |
| backend | 3000 | 3001 | API REST |
| frontend | 80 | 80 | Interfaz web (Nginx) |

## Comandos útiles

```bash
# Ver logs
docker compose logs -f backend
docker compose logs -f frontend

# Ejecutar seed (si no hay datos)
docker compose exec backend node scripts/seed.js

# Detener servicios
docker compose down

# Detener y eliminar volúmenes (borra datos)
docker compose down -v

# Reconstruir imágenes
docker compose build --no-cache
```

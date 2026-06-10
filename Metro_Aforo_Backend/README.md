# AQP Aforos

Sistema de registro de aforos vehiculares.

## Estructura del proyecto

```
aqp-aforos/
├── Metro_Aforo_Backend/          # API REST (Node.js + Express + PostgreSQL)
│   ├── docker-compose.yml        # Desarrollo local
│   ├── docker-compose.prod.yml   # Producción con SSL
│   ├── nginx-ssl.conf            # Config Nginx con HTTPS
│   ├── Dockerfile
│   └── ...
├── Metro_Aforo_Frontend/         # Interfaz React (Vite + MUI)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ...
└── README.md
```

## Desarrollo local

### Requisitos
- Docker y Docker Compose
- Puertos: 5432, 3001, 80

### Inicio rápido
```bash
git clone https://github.com/tu-usuario/aqp-aforos.git
cd aqp-aforos/Metro_Aforo_Backend
docker compose up -d
docker compose exec backend node scripts/seed.js
```
Frontend: http://localhost  |  Backend: http://localhost:3001/api

---

## Despliegue en producción (Proxmox + Ubuntu Server)

### 1. Infraestructura
Crear VM en Proxmox con Ubuntu Server 22.04/24.04:
- CPU: 2-4 vCPUs
- RAM: 4-8 GB
- Disco: 40-80 GB
- Red: Bridge vmbr0 con IP fija

### 2. Instalar Docker
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(amd64) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Clonar y configurar
```bash
cd /opt
sudo git clone https://github.com/tu-usuario/aqp-aforos.git
sudo chown -R $USER:$USER aqp-aforos
cd aqp-aforos/Metro_Aforo_Backend
cp .env.production.example .env
nano .env   # <-- editar con valores reales
```

### 4. Obtener certificado SSL (Let's Encrypt)
```bash
sudo apt install -y certbot
sudo certbot certonly --standalone -d aforos.tudominio.com
sudo mkdir -p /opt/ssl
sudo cp /etc/letsencrypt/live/aforos.tudominio.com/fullchain.pem /opt/ssl/cert.pem
sudo cp /etc/letsencrypt/live/aforos.tudominio.com/privkey.pem /opt/ssl/key.pem
```

> Para auto-firma de pruebas:
> ```bash
> sudo mkdir -p /opt/ssl
> sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
>   -keyout /opt/ssl/key.pem -out /opt/ssl/cert.pem \
>   -subj "/C=PE/ST=Arequipa/O=AQP Aforos/CN=aforos.local"
> ```

### 5. Desplegar
```bash
export $(cat .env | xargs)
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec backend node scripts/seed.js
```

### 6. Firewall
```bash
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw --force enable
```

### 7. Acceder
- https://aforos.tudominio.com
- https://aforos.tudominio.com/api/health

---

## Credenciales por defecto

| Rol             | Correo                  | Contraseña     |
|-----------------|-------------------------|----------------|
| Administrador   | admin@aqpaforos.com     | Admin123456    |
| Aforador        | aforador@aqpaforos.com  | Aforador123    |

## Comandos útiles

```bash
# Logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Seed (si no hay datos)
docker compose -f docker-compose.prod.yml exec backend node scripts/seed.js

# Detener
docker compose -f docker-compose.prod.yml down

# Actualizar (reconstruir imágenes)
git pull
docker compose -f docker-compose.prod.yml up -d --build

# Backup BD
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres aqp_aforo > backup_$(date +%Y%m%d).sql

# Renovar SSL y recargar Nginx
sudo certbot renew
docker compose -f docker-compose.prod.yml exec frontend nginx -s reload
```

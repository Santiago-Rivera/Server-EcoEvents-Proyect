# Docker Setup para EcoEvents Server

Este directorio contiene la configuración de Docker para ejecutar el servidor EcoEvents en contenedores.

## Archivos Docker

- `Dockerfile`: Configuración para construir la imagen del servidor
- `docker-compose.yml`: Configuración para orquestar servicios
- `.dockerignore`: Archivos excluidos del contexto de construcción
- `.env.docker`: Variables de entorno de ejemplo para Docker

## Instrucciones de uso

### Opción 1: Docker Compose (Recomendado)

1. **Construir y ejecutar el servidor:**

   ```bash
   docker-compose up --build
   ```

2. **Ejecutar en segundo plano:**

   ```bash
   docker-compose up -d --build
   ```

3. **Ver logs:**

   ```bash
   docker-compose logs -f ecoevents-server
   ```

4. **Detener servicios:**

   ```bash
   docker-compose down
   ```

### Opción 2: Docker directo

1. **Construir la imagen:**

   ```bash
   docker build -t ecoevents-server .
   ```

2. **Ejecutar el contenedor:**

   ```bash
   docker run -p 4000:4000 -e DATABASE_URL="file:./dev.db" ecoevents-server
   ```

## Configuración

### Variables de entorno

Copia `.env.docker` a `.env` y ajusta las variables según tu entorno:

```bash
cp .env.docker .env
```

Variables importantes:

- `DATABASE_URL`: URL de conexión a la base de datos
- `JWT_SECRET`: Secreto para tokens JWT
- `PORT`: Puerto del servidor (por defecto 4000)

### Base de datos

#### SQLite (por defecto)

La configuración actual usa SQLite. La base de datos se crea automáticamente.

#### PostgreSQL (opcional)

Para usar PostgreSQL, descomenta el servicio `postgres` en `docker-compose.yml` y ajusta `DATABASE_URL`.

## Desarrollo

### Modo desarrollo con Docker

1. **Crear un docker-compose.dev.yml:**

   ```yaml
   version: '3.8'
   services:
     ecoevents-server:
       build: .
       ports:
         - "4000:4000"
       volumes:
         - .:/app
         - /app/node_modules
       environment:
         - NODE_ENV=development
       command: npm run dev
   ```

2. **Ejecutar en modo desarrollo:**

   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

## Producción

### Consideraciones para producción

1. **Cambiar JWT_SECRET** a un valor seguro
2. **Configurar CORS** con tus dominios reales
3. **Usar PostgreSQL** en lugar de SQLite para mayor rendimiento
4. **Configurar HTTPS** con un proxy reverso (nginx, Caddy)
5. **Implementar logging** y monitoreo

### Ejemplo con proxy reverso (nginx)

```yaml
# Agregar a docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - ./certs:/etc/nginx/certs
  depends_on:
    - ecoevents-server
```

## Comandos útiles

```bash
# Ver contenedores en ejecución
docker ps

# Entrar al contenedor
docker exec -it ecoevents-server sh

# Ver logs del contenedor
docker logs ecoevents-server

# Limpiar imágenes no utilizadas
docker system prune -a

# Reconstruir sin cache
docker-compose build --no-cache

# Ejecutar comandos de Prisma en el contenedor
docker exec ecoevents-server npx prisma studio --schema=src/prisma/schema.prisma
```

## Troubleshooting

### Problemas comunes

1. **Error de permisos**: Asegurate de que el usuario `nodeuser` tenga permisos
2. **Puerto ocupado**: Cambia el puerto en docker-compose.yml
3. **Base de datos**: Verifica la configuración de DATABASE_URL
4. **Dependencias nativas**: Alpine Linux necesita herramientas de compilación para bcrypt

### Health Check

El contenedor incluye un health check que verifica que el servidor responda en `/`. Puedes verificarlo con:

```bash
docker inspect ecoevents-server | grep -A 10 Health
```

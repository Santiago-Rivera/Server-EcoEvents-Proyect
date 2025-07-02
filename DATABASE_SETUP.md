# Configuración de la Base de Datos

## Requisitos

- PostgreSQL 12 o superior instalado y ejecutándose

## Pasos para configurar la base de datos

### 1. Instalar PostgreSQL (si no está instalado)

- **Windows**: Descargar desde [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

### 2. Configurar la base de datos

#### Opción A: Usar la configuración por defecto

1. Asegúrate de que PostgreSQL esté ejecutándose
2. Actualiza el archivo `.env` con tus credenciales:
   DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/eco_eventos?schema=public"

#### Opción B: Crear usuario específico

1. Conecta a PostgreSQL como superusuario:

   ```bash
   psql -U postgres
   ```

2. Ejecuta el script de inicialización:

   ```sql
   \i scripts/init-db.sql
   ```

3. Actualiza el archivo `.env` con las credenciales correctas

### 3. Generar y aplicar las migraciones de Prisma

```bash
# Desde la carpeta server/
npm run prisma:generate
npm run prisma:push
```

### 4. (Opcional) Abrir Prisma Studio para ver los datos

```bash
npm run prisma:studio
```

## Variables de entorno necesarias

Asegúrate de que tu archivo `.env` contenga:

```env
PORT=4000
DATABASE_URL="postgresql://tu_usuario:tu_contraseña@localhost:5432/eco_eventos?schema=public"
DB_NAME=eco_eventos
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
JWT_SECRET=clavesecreta123
```

## Verificación

1. Inicia el servidor: `npm run dev`
2. Deberías ver el mensaje: "🟢 Conexión a PostgreSQL establecida con Prisma."

3. La API estará disponible en: [http://localhost:4000](http://localhost:4000)

## Solución de problemas

### Error de conexión

- Verifica que PostgreSQL esté ejecutándose
- Confirma que las credenciales en `.env` sean correctas
- Asegúrate de que la base de datos `eco_eventos` exista

### Error de permisos

- Verifica que el usuario tenga permisos en la base de datos
- Intenta usar el usuario `postgres` temporalmente

### Puerto ocupado

- Cambia el puerto en `.env` si el 4000 está ocupado
- Asegúrate de actualizar también la URL en el frontend

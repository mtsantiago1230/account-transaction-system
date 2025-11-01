# 🚀 Guía de Despliegue a Railway.app

Esta guía te ayudará a desplegar tu aplicación Account Transaction System en Railway.app de forma gratuita.

## 📋 Requisitos previos

- ✅ Cuenta en [Railway.app](https://railway.app)
- ✅ Cuenta en GitHub (tu proyecto ya debe estar en GitHub)
- ✅ Este proyecto clonado localmente

## 🎯 Paso 1: Crear cuenta en Railway

1. Ve a https://railway.app
2. Haz clic en "Start a New Project"
3. Conecta tu cuenta de GitHub
4. Autoriza Railway para acceder a tus repositorios

## 🗄️ Paso 2: Crear la base de datos PostgreSQL

1. En Railway, haz clic en **"New Project"**
2. Selecciona **"Provision PostgreSQL"**
3. Railway creará automáticamente una base de datos PostgreSQL
4. Anota el nombre del servicio (ej: `postgres`)

### Obtener la URL de conexión:

1. Haz clic en el servicio **PostgreSQL**
2. Ve a la pestaña **"Variables"**
3. Copia el valor de `DATABASE_URL` (lo necesitarás después)

## 🔧 Paso 3: Desplegar el Backend

### A. Desde GitHub (Recomendado):

1. En Railway, en el mismo proyecto, haz clic en **"New Service"**
2. Selecciona **"GitHub Repo"**
3. Busca y selecciona tu repositorio: `account-transaction-system`
4. Railway detectará automáticamente el Dockerfile

### B. Configurar variables de entorno:

1. Haz clic en el servicio del **backend** que acabas de crear
2. Ve a la pestaña **"Variables"**
3. Agrega las siguientes variables:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=genera-un-string-aleatorio-de-64-caracteres-aqui
DB_SSL=true
PORT=3000
FRONTEND_URL=https://tu-frontend.vercel.app
```

> **⚠️ Nota sobre FRONTEND_URL**:
>
> 1. Primero despliega el backend **sin** `FRONTEND_URL` (o déjalo vacío)
> 2. Luego despliega el frontend y obtén su URL
> 3. Finalmente actualiza `FRONTEND_URL` en Railway con la URL real del frontend
> 4. El backend se reiniciará automáticamente

**Generar JWT_SECRET seguro:**

```bash
# En tu terminal local, ejecuta:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### C. Configurar el build:

1. En la pestaña **"Settings"** del backend
2. Asegúrate que:
   - **Build Command**: (vacío, usa Dockerfile)
   - **Start Command**: `node dist/main.js`
   - **Root Directory**: `/backend`

### D. Ejecutar migraciones:

Después del primer despliegue:

1. Ve a la pestaña **"Deploy Logs"** del backend
2. Espera a que el despliegue termine
3. En la pestaña **"Settings"** → **"Service"**
4. Anota el **Railway Service Domain** (ej: `backend-production-abc.up.railway.app`)

Para ejecutar migraciones, puedes:

- Usar Railway CLI (ver más abajo)
- O crear un script de post-deploy

## 🎨 Paso 4: Desplegar el Frontend

### Opción A: Railway (todo en un lugar)

1. En el mismo proyecto, haz clic en **"New Service"**
2. Selecciona **"GitHub Repo"**
3. Selecciona tu repositorio nuevamente
4. En **"Settings"** → **"Service"**:

   - **Root Directory**: `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx http-server dist/frontend/browser -p $PORT`

5. Agrega variable de entorno:
   ```env
   API_URL=https://tu-backend-url.up.railway.app
   ```

### Opción B: Vercel (Recomendado para frontend)

**Es más rápido y tiene mejor CDN para frontend:**

1. Ve a https://vercel.com
2. Conecta tu repositorio de GitHub
3. Configura:

   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/frontend/browser`

4. En **Environment Variables**:
   ```env
   API_URL=https://tu-backend-url.up.railway.app
   ```

Actualiza `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: process.env["API_URL"] || "https://tu-backend-url.up.railway.app",
};
```

## 🔑 Paso 5: Verificar configuración de CORS

El archivo `backend/src/main.ts` ya está configurado para leer automáticamente tu `FRONTEND_URL`:

```typescript
// ✅ CORS ya configurado dinámicamente
const allowedOrigins = [
  'http://localhost:4200', // Desarrollo local
  process.env.FRONTEND_URL, // URL de producción desde variable de entorno
    'https://tu-frontend.up.railway.app'
  ],
  credentials: true,
});
```

Haz commit y push de los cambios. Railway desplegará automáticamente.

## 🛠️ Paso 6: Railway CLI (Opcional pero útil)

### Instalar Railway CLI:

```powershell
# Windows (usando npm)
npm install -g @railway/cli

# O con scoop
scoop install railway
```

### Comandos útiles:

```powershell
# Login
railway login

# Ver logs en tiempo real
railway logs

# Ejecutar migraciones
railway run npm run migration:run

# Abrir shell en el contenedor
railway shell

# Ver variables de entorno
railway variables
```

## ✅ Paso 7: Verificar el despliegue

### Backend:

1. Accede a `https://tu-backend-url.up.railway.app`
2. Deberías ver una respuesta de la API
3. Prueba el endpoint de salud: `https://tu-backend-url.up.railway.app/`

### Frontend:

1. Accede a tu URL de Vercel o Railway
2. Deberías ver la aplicación funcionando
3. Intenta hacer login con:
   - Email: `test@example.com`
   - Password: `password123`

## 🔧 Paso 8: Ejecutar migraciones (Importante)

Necesitas ejecutar las migraciones después del primer despliegue:

```powershell
# Con Railway CLI
railway link
railway run npm run migration:run

# O crea un script de post-deploy
```

### Crear script de post-deploy:

Actualiza `backend/package.json`:

```json
{
  "scripts": {
    "deploy:railway": "npm run build && npm run migration:run && npm run start:prod"
  }
}
```

## 📊 Monitoreo

### En Railway:

1. **Metrics**: Ve uso de CPU, memoria y red
2. **Deploy Logs**: Ve logs de construcción
3. **Application Logs**: Ve logs de tu aplicación
4. **Usage**: Monitorea tu consumo de créditos

## 💰 Costos

Railway ofrece:

- ✅ **$5 USD** de crédito gratis al mes
- ✅ Suficiente para:
  - 1 backend NestJS
  - 1 base de datos PostgreSQL
  - Bajo tráfico

Si necesitas más, planes desde $5/mes adicionales.

## 🐛 Troubleshooting

### Error: "The server does not support SSL connections"

**Solución**: Asegúrate que `DB_SSL=true` en las variables de Railway.

### Error: "Cannot find module"

**Solución**:

1. Verifica que `NODE_ENV=production`
2. Asegúrate que el build se completó correctamente
3. Revisa los logs de despliegue

### Error: CORS

**Solución**: Agrega el dominio de tu frontend en la configuración CORS del backend.

### La base de datos está vacía

**Solución**: Ejecuta las migraciones:

```powershell
railway run npm run migration:run
```

### El backend no se conecta a la DB

**Solución**: Verifica que la variable `DATABASE_URL` está correctamente configurada con `${{Postgres.DATABASE_URL}}`.

## 📝 Checklist final

- [ ] Backend desplegado en Railway
- [ ] PostgreSQL creado y conectado
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Usuario de prueba creado (opcional)
- [ ] Frontend desplegado (Railway o Vercel)
- [ ] CORS configurado
- [ ] URLs actualizadas en environment.prod.ts
- [ ] Prueba de login exitosa

## 🔐 Seguridad Post-Deploy

1. **Cambia JWT_SECRET**: Usa uno generado aleatoriamente
2. **Revisa CORS**: Solo permite dominios necesarios
3. **Activa rate limiting**: Para prevenir abusos
4. **Monitorea logs**: Revisa actividad sospechosa
5. **Backups**: Railway hace backups automáticos de PostgreSQL

## 🚀 Próximos pasos

1. **Dominio personalizado**: Conecta tu propio dominio
2. **CI/CD**: Railway despliega automáticamente con cada push
3. **Monitoring**: Configura alertas para errores
4. **Scaling**: Railway escala automáticamente si es necesario

## 📚 Recursos adicionales

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Vercel Documentation](https://vercel.com/docs)

---

**¿Necesitas ayuda?** Revisa los logs en Railway o abre un issue en GitHub.

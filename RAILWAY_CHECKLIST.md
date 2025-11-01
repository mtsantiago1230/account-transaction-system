# ✅ Checklist de Deployment a Railway.app

## 📦 Archivos de configuración listos

- ✅ `railway.json` - Configuración de Railway
- ✅ `backend/dockerfile` - Imagen Docker del backend
- ✅ `DEPLOYMENT_GUIDE.md` - Guía completa paso a paso
- ✅ `backend/src/main.ts` - CORS y PORT dinámicos configurados
- ✅ `.env.example` - Template de variables de entorno

## 🎯 Orden de deployment (IMPORTANTE)

### 1️⃣ Crear cuenta y conectar repo (5 minutos)

1. Ir a https://railway.app
2. Sign up con GitHub
3. Conectar tu repositorio: `account-transaction-system`

### 2️⃣ Provisionar PostgreSQL (2 minutos)

1. En Railway dashboard → **New** → **Database** → **PostgreSQL**
2. Esperar a que se provisione
3. Railway creará automáticamente la variable `${{Postgres.DATABASE_URL}}`

### 3️⃣ Desplegar Backend (10 minutos)

#### A. Crear servicio:

- En Railway → **New** → **GitHub Repo** → Selecciona tu repo
- Root Directory: `/backend`

#### B. Variables de entorno:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<GENERAR_CON_COMANDO_ABAJO>
DB_SSL=true
PORT=3000
```

**Generar JWT_SECRET:**

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### C. Configurar build:

- **Build Command**: (vacío - usa Dockerfile)
- **Start Command**: `node dist/main.js`
- **Root Directory**: `/backend`

#### D. Desplegar:

- Click **Deploy**
- Espera 3-5 minutos
- Copia la URL del backend: `https://xxx.up.railway.app`

#### E. Ejecutar migraciones:

```bash
# En Railway CLI o en el dashboard
railway run npm run migration:run
```

#### F. Seed de usuario de prueba:

```bash
railway run npm run seed:user
```

### 4️⃣ Actualizar variable FRONTEND_URL (1 minuto)

Ahora que tienes la URL del backend, necesitas desplegar el frontend primero y luego actualizar esta variable.

**Temporalmente deja FRONTEND_URL sin configurar o configúrala como:**

```env
FRONTEND_URL=http://localhost:4200
```

### 5️⃣ Desplegar Frontend en Vercel (5 minutos)

#### Opción A: Vercel (Recomendado)

1. Ve a https://vercel.com
2. Import repository
3. Configurar:

   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/frontend/browser`

4. Variables de entorno:

```env
API_URL=https://tu-backend-url.up.railway.app
```

5. Deploy y copia la URL del frontend: `https://xxx.vercel.app`

#### Opción B: Railway

1. Nuevo servicio desde el mismo repo
2. Root Directory: `/frontend`
3. Build: `npm install && npm run build`
4. Start: `npx http-server dist/frontend/browser -p $PORT`
5. Variable: `API_URL=https://tu-backend-url.up.railway.app`

### 6️⃣ Actualizar CORS del Backend (2 minutos)

1. Vuelve al servicio de backend en Railway
2. Actualiza la variable de entorno:

```env
FRONTEND_URL=https://tu-frontend-real.vercel.app
```

3. Railway redesplegará automáticamente el backend

### 7️⃣ Actualizar Frontend con URL real del backend (1 minuto)

En Vercel o Railway, actualiza:

```env
API_URL=https://tu-backend-real.up.railway.app
```

## 🧪 Verificación Post-Deployment

### Backend Health Check:

```bash
curl https://tu-backend.up.railway.app/health
```

### Probar Login:

1. Abre tu frontend: `https://tu-frontend.vercel.app`
2. Credenciales de prueba:
   - Email: `test@example.com`
   - Password: `password123`
3. Deberías ver el dashboard con la cuenta de prueba

### Verificar Base de Datos:

```bash
# En Railway CLI
railway connect postgres
\dt  # Listar tablas
SELECT * FROM users;  # Ver usuario de prueba
```

## 🔒 Checklist de Seguridad

Antes de ir a producción real:

- [ ] JWT_SECRET generado con crypto.randomBytes (64 caracteres)
- [ ] Cambiar password del usuario de prueba o eliminar cuenta
- [ ] HTTPS habilitado en ambos servicios (Railway/Vercel lo hace automáticamente)
- [ ] CORS configurado solo para tu dominio de frontend
- [ ] Variables de entorno nunca pusheadas a Git
- [ ] DB_SSL=true para conexiones seguras a PostgreSQL
- [ ] Implementar rate limiting (opcional pero recomendado)

## 📊 Monitoreo

### Railway Dashboard:

- **Logs**: Ver logs en tiempo real del backend
- **Metrics**: CPU, RAM, Network usage
- **Deployments**: Historial de despliegues

### Comandos útiles:

```bash
# Ver logs del backend
railway logs

# Conectar a la base de datos
railway connect postgres

# Ejecutar comandos en el contenedor
railway run <comando>

# Ver variables de entorno
railway variables
```

## 💰 Costos Estimados

### Plan Free de Railway:

- **$5 USD de crédito gratis al mes**
- Backend + PostgreSQL ≈ $3-4/mes
- **Suficiente para desarrollo y pruebas**

### Plan Free de Vercel:

- **100% gratis**
- Perfecto para frontend estático
- 100 GB de bandwidth/mes

**Total: ~$0-1 USD/mes** (dentro del crédito gratis de Railway)

## 🆘 Troubleshooting

### Backend no conecta a la base de datos:

```bash
# Verificar DATABASE_URL
railway variables | grep DATABASE_URL

# Verificar DB_SSL=true
railway variables | grep DB_SSL
```

### Error de CORS:

1. Verificar que `FRONTEND_URL` esté configurado
2. Verificar que la URL no tenga trailing slash: `https://xxx.vercel.app` (sin `/` al final)
3. Verificar logs: `railway logs`

### Migraciones no corren:

```bash
# Ejecutar manualmente
railway run npm run migration:run

# Si falla, conectar a la DB y crear tablas manualmente
railway connect postgres
# Copiar y pegar contenido de backend/init-tables.sql
```

### Frontend no se conecta al backend:

1. Verificar `API_URL` en Vercel
2. Abrir DevTools → Network → Ver requests
3. Verificar que las URLs no tengan `/api/api` duplicado

## 📚 Recursos

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Angular Deployment](https://angular.io/guide/deployment)

## ✨ Próximos pasos (Opcional)

Una vez que todo funcione:

1. **Custom Domain**: Configurar tu propio dominio
2. **Email Service**: Implementar recuperación de contraseña
3. **Monitoring**: Configurar Sentry o LogRocket
4. **CI/CD**: Automatizar tests antes de deployment
5. **Backups**: Configurar backups automáticos de PostgreSQL

---

**¿Listo para deployment?** Sigue los pasos en orden y tendrás tu aplicación en producción en menos de 30 minutos! 🚀

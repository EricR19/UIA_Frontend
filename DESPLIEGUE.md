# 🚀 Guía de Despliegue - Frontend UIA

## 📋 Pre-requisitos

- ✅ Backend ya desplegado en Render: `https://uia-backend-3j1t.onrender.com`
- ✅ Node.js 18+ instalado
- ✅ Git configurado
- ✅ Cuenta en Render o Vercel

---

## 🔒 Verificación de Seguridad

Antes de desplegar, ejecuta el script de seguridad:

```bash
./check_security.sh
```

Debe mostrar: ✅ **TODO PERFECTO - LISTO PARA GITHUB**

---

## 📦 Despliegue en Render

### Paso 1: Subir a GitHub

```bash
cd /Users/ericruiz/Downloads/UIV2/FrontendUIA
git init
git add .
git commit -m "Initial commit - Frontend UIA"
git branch -M main
git remote add origin https://github.com/EricR19/UIA_Frontend.git
git push -u origin main
```

### Paso 2: Crear Web Service en Render

1. Ve a https://dashboard.render.com
2. Click en **"New +"** → **"Static Site"**
3. Conecta el repositorio: `EricR19/UIA_Frontend`

### Paso 3: Configuración

**Name:**

```
uia-frontend
```

**Branch:**

```
main
```

**Build Command:**

```
npm install && npm run build
```

**Publish Directory:**

```
dist
```

### Paso 4: Variables de Entorno

En **Environment Variables**, agrega:

**VITE_API_URL:**

```
https://uia-backend-3j1t.onrender.com/api
```

**VITE_ENV:**

```
production
```

### Paso 5: Deploy

Click en **"Create Static Site"**

Render construirá tu aplicación y te dará una URL como:

```
https://uia-frontend.onrender.com
```

---

## 🌐 Despliegue en Vercel (Alternativa)

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Deploy

```bash
cd /Users/ericruiz/Downloads/UIV2/FrontendUIA
vercel
```

Sigue las instrucciones:

- Set up and deploy? **Y**
- Which scope? **Tu cuenta**
- Link to existing project? **N**
- What's your project's name? **uia-frontend**
- In which directory is your code located? **.**
- Want to override settings? **Y**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

### Paso 3: Configurar Variables de Entorno

En el dashboard de Vercel:

1. Ve a tu proyecto → Settings → Environment Variables
2. Agrega:
   - `VITE_API_URL` = `https://uia-backend-3j1t.onrender.com/api`
   - `VITE_ENV` = `production`

### Paso 4: Re-deploy

```bash
vercel --prod
```

---

## 🔄 Actualizar CORS en el Backend

Una vez que tengas la URL del frontend desplegado, actualiza el backend:

1. Abre `/backendUIA/main.py`
2. Agrega la URL del frontend a `allowed_origins`:

```python
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    settings.FRONTEND_URL,
    "https://uia-backend-3j1t.onrender.com",
    "https://uia-frontend.onrender.com",  # ← Agregar esta línea
]
```

3. Commit y push:

```bash
cd /Users/ericruiz/Downloads/UIV2/backendUIA
git add main.py
git commit -m "Add frontend URL to CORS"
git push
```

Render re-desplegará automáticamente.

---

## ✅ Verificación Post-Despliegue

### 1. Verifica que el frontend cargue

```
https://uia-frontend.onrender.com
```

### 2. Verifica la conexión con el backend

- Intenta hacer login
- Verifica que las peticiones lleguen al backend
- Revisa la consola del navegador (F12) para errores

### 3. Verifica variables de entorno

Abre la consola del navegador y ejecuta:

```javascript
console.log(import.meta.env.VITE_API_URL);
```

Debe mostrar: `https://uia-backend-3j1t.onrender.com/api`

---

## 🐛 Troubleshooting

### Error: "Network Error" o "Failed to fetch"

**Causa:** CORS no configurado en el backend

**Solución:**

1. Verifica que la URL del frontend esté en `allowed_origins` del backend
2. Re-despliega el backend
3. Espera 2-3 minutos para que Render actualice

### Error: "Cannot read property of undefined"

**Causa:** Variables de entorno no configuradas

**Solución:**

1. Verifica que `VITE_API_URL` esté configurada en Render/Vercel
2. Re-despliega el frontend
3. Limpia caché del navegador (Ctrl+Shift+R)

### El sitio no carga / Muestra error 404

**Causa:** Configuración incorrecta de rutas en Vite

**Solución:**
Ya está configurado en `vite.config.js` con:

```javascript
build: {
  outDir: 'dist',
}
```

Si persiste, verifica que el "Publish Directory" en Render sea `dist`

---

## 📊 Monitoreo

### Logs del Frontend (Render)

1. Dashboard → Tu Static Site → Logs
2. Revisa errores de build o deploy

### Logs del Backend (Render)

1. Dashboard → uia-backend → Logs
2. Monitorea peticiones y errores

### Performance

- Render Free Tier: El sitio puede dormir después de 15 min de inactividad
- Primera carga después de dormir: ~30 segundos
- Considerar plan Starter ($7/mes) para producción

---

## 🔐 Variables de Entorno - Resumen

### Desarrollo Local (.env)

```env
VITE_API_URL=http://localhost:8000/api
VITE_ENV=development
```

### Producción (Render/Vercel)

```env
VITE_API_URL=https://uia-backend-3j1t.onrender.com/api
VITE_ENV=production
```

---

## 📝 Checklist Final

- [ ] Script de seguridad ejecutado sin errores
- [ ] .env no está en Git
- [ ] .env.example creado
- [ ] Variables de entorno configuradas en Render/Vercel
- [ ] Frontend desplegado correctamente
- [ ] CORS actualizado en backend con URL del frontend
- [ ] Login funciona correctamente
- [ ] Todas las funciones principales probadas
- [ ] Emails de bienvenida funcionan
- [ ] Importación de estudiantes funciona

---

## 🎉 ¡Listo!

Tu aplicación UIA está desplegada en producción:

- **Backend:** https://uia-backend-3j1t.onrender.com
- **Frontend:** https://uia-frontend.onrender.com (o tu URL de Vercel)
- **Documentación API:** https://uia-backend-3j1t.onrender.com/docs

Cualquier push a `main` en GitHub activará un re-deploy automático.

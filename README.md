# Sistema de Notas UIA - Frontend

Frontend del sistema de gestión de notas académicas construido con **React + Vite**.

## 🚀 Tecnologías

- **React 18.3.1** - Biblioteca UI
- **Vite 7.1.9** - Build tool y dev server
- **React Router DOM** - Navegación SPA
- **Axios** - Cliente HTTP
- **CSS Modules** - Estilos con scope

## 📁 Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── Layout/       # Layout principal con navbar
│   ├── Toast/        # Sistema de notificaciones
│   └── Modal/        # Modales de confirmación
├── context/          # Context API (Auth)
├── pages/            # Páginas/Vistas
│   ├── Login/        # Autenticación
│   ├── Dashboard/    # Panel principal
│   ├── Notas/        # Gestión de notas
│   ├── Estudiantes/  # CRUD estudiantes
│   ├── Profesores/   # CRUD profesores
│   └── Ajustes/      # Configuración
├── services/         # API services
└── App.jsx           # Componente raíz
```

## ✨ Características Principales

### 🔐 Autenticación JWT

- Login con email/contraseña
- Validación de credenciales en tiempo real
- Sesión persistente con tokens
- Cierre automático por inactividad (10 min)

### 📝 Gestión de Notas

- Vista semanal (semanas 2-14)
- Edición inline con validación
- Restricciones por rol (Admin/Profesor)
- **Validaciones por semana:**
  - Parcial I: Solo semana 5
  - Parcial II: Solo semana 10
  - Parcial III: Solo semana 14
  - Compendium: Semanas 2-13 (excepto 6, 10, 14)
- Historial de cambios con trazabilidad
- Exportación a Excel

### 🎨 Sistema de Alertas Moderno

Reemplazo completo de `window.alert()` y `window.confirm()` por componentes personalizados:

**Toast (Notificaciones):**

- ✓ Success (verde)
- ✕ Error (rojo)
- ⚠ Warning (naranja)
- ℹ Info (azul)
- Auto-cierre configurable
- Animaciones suaves

**ConfirmModal (Confirmaciones):**

- Modal elegante con overlay
- Botones personalizables
- Animación de entrada
- Cierre con clic fuera

Ver documentación completa en [`SISTEMA_ALERTAS.md`](./SISTEMA_ALERTAS.md)

### 📱 Diseño Responsive

- Navbar adaptable con menú hamburguesa
- Tablas responsivas con scroll horizontal
- Optimizado para tablets y móviles
- Paleta de colores "minimalista"

### 🎯 Control de Acceso

- **Admin:** Acceso completo, edita parciales
- **Profesor:** Edita rubros regulares (no parciales)
- Rutas protegidas con ProtectedRoute
- Redirección automática sin autenticación

## 🛠️ Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (puerto 5173)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🔗 Conexión con Backend

El frontend se conecta al backend en `http://localhost:8000/api`

**Variables de entorno** (crear `.env`):

```env
VITE_API_URL=http://localhost:8000/api
```

## 📋 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo con HMR
- `npm run build` - Compilar para producción
- `npm run preview` - Vista previa del build
- `npm run lint` - Ejecutar ESLint

## 🎨 Temas y Estilos

**Colores principales:**

- Primary: `#3b82f6` (azul)
- Success: `#10b981` (verde)
- Error: `#ef4444` (rojo)
- Warning: `#ffa726` (naranja)
- Texto: `#333` / `#666`

**Componentes estilizados:**

- Cards con sombras suaves
- Botones con hover effects
- Inputs con focus states
- Badges para estados

## 📖 Documentación Adicional

- [Reglas de Semanas](../REGLAS_SEMANAS.md) - Validaciones de rubros por semana
- [Sistema de Alertas](./SISTEMA_ALERTAS.md) - Componentes Toast y Modal

## 🔧 Configuración de Vite

- **Plugin:** `@vitejs/plugin-react` con Babel
- **HMR:** Hot Module Replacement habilitado
- **ESLint:** Reglas básicas configuradas

## 🚦 Estado del Proyecto

✅ Autenticación completa
✅ CRUD de estudiantes y profesores
✅ Gestión de notas con validaciones
✅ Exportación a Excel
✅ Historial de cambios
✅ Sistema de alertas moderno
✅ Responsive design
✅ Control de acceso por roles

---

**Versión:** 1.0  
**Última actualización:** Octubre 2025

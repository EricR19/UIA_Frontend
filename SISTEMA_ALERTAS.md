# Sistema de Alertas y Notificaciones

## Componentes Creados

### 1. Toast (Notificaciones)

**Ubicación:** `/src/components/Toast/Toast.jsx`

Componente para mostrar notificaciones temporales en la esquina superior derecha.

**Tipos:**

- `success` ✓ - Verde, para operaciones exitosas
- `error` ✕ - Rojo, para errores
- `warning` ⚠ - Naranja, para advertencias
- `info` ℹ - Azul, para información

**Uso:**

```jsx
import Toast from "../../components/Toast/Toast";

// En el estado
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

// En el JSX
{
  error && (
    <Toast
      message={error}
      type="error"
      onClose={() => setError("")}
      duration={4000}
    />
  );
}

{
  success && (
    <Toast
      message={success}
      type="success"
      onClose={() => setSuccess("")}
      duration={3000}
    />
  );
}
```

**Características:**

- Se cierra automáticamente después de `duration` ms (default: 3000)
- Botón de cierre manual (×)
- Animación suave de entrada
- Responsive (se adapta a móviles)
- Se posiciona con z-index alto para estar siempre visible

### 2. ConfirmModal (Confirmaciones)

**Ubicación:** `/src/components/Modal/ConfirmModal.jsx`

Modal de confirmación elegante para reemplazar `window.confirm()`.

**Uso:**

```jsx
import ConfirmModal from "../../components/Modal/ConfirmModal";

// En el estado
const [showConfirmModal, setShowConfirmModal] = useState(false);

// Funciones
const handleAction = () => {
  setShowConfirmModal(true);
};

const confirmarAccion = async () => {
  setShowConfirmModal(false);
  // Ejecutar acción
};

// En el JSX
{
  showConfirmModal && (
    <ConfirmModal
      message="¿Estás seguro de realizar esta acción?"
      onConfirm={confirmarAccion}
      onCancel={() => setShowConfirmModal(false)}
      confirmText="Sí, continuar"
      cancelText="Cancelar"
    />
  );
}
```

**Características:**

- Overlay oscuro con blur
- Animación de entrada suave
- Cierre al hacer clic fuera del modal
- Botones personalizables
- Icono visual (❓)
- Responsive

## Implementaciones

### Login.jsx

**Mejoras implementadas:**

1. **Validación de Email:**

   - Verifica formato válido antes de enviar
   - Mensaje: "Por favor ingrese un correo electrónico válido"

2. **Validación de Contraseña:**

   - Mínimo 6 caracteres
   - Mensaje: "La contraseña debe tener al menos 6 caracteres"

3. **Mensajes de Error Específicos:**

   - **401:** "Correo electrónico o contraseña incorrectos"
   - **404:** "Usuario no encontrado. Verifique su correo electrónico"
   - **403:** "Acceso denegado. Usuario inactivo o sin permisos"
   - **Otros:** Mensaje genérico con detalle del servidor

4. **Toast de Error:**
   - Duración: 5000ms (5 segundos)
   - Tipo: error (rojo)
   - Posición: superior derecha

### Notas.jsx

**Mejoras implementadas:**

1. **Toast para Mensajes:**

   - Reemplazó alerts HTML básicos
   - Success: Verde, 3000ms
   - Error: Rojo, 4000ms
   - Mensajes mejorados con iconos (✓)

2. **Modal de Confirmación:**

   - Reemplazó `window.confirm()` en inicialización de semanas
   - Mensaje descriptivo con nombre del estudiante
   - Botones claros: "Sí, inicializar" / "Cancelar"

3. **Mensajes Mejorados:**
   - ✓ Nota guardada correctamente
   - ✓ Excel descargado correctamente
   - Errores del backend mostrados con contexto

## Ventajas vs. Alerts HTML

### Antes (window.alert / window.confirm):

❌ Apariencia básica del navegador
❌ Bloquea toda la interfaz
❌ No personalizable
❌ Experiencia inconsistente entre navegadores
❌ No responsive
❌ Sin animaciones

### Ahora (Toast + Modal):

✅ Diseño moderno y profesional
✅ No bloquea la interfaz (Toast)
✅ Totalmente personalizable
✅ Experiencia consistente
✅ Responsive y mobile-friendly
✅ Animaciones suaves
✅ Control programático completo
✅ Accesible (botón de cerrar)
✅ Mensajes contextuales con iconos
✅ Tipos visuales diferenciados por color

## Estilo Visual

### Colores por Tipo:

- **Success:** Verde (#10b981) con fondo claro (#d1fae5)
- **Error:** Rojo (#ef4444) con fondo claro (#fee2e2)
- **Warning:** Naranja (#f59e0b) con fondo claro (#fef3c7)
- **Info:** Azul (#3b82f6) con fondo claro (#dbeafe)

### Animaciones:

- **Toast:** Slide in desde la derecha
- **Modal:** Scale in con fade
- **Overlay:** Fade in suave

## Próximos Pasos Recomendados

Para expandir el sistema a otros componentes:

1. **Profesores.jsx** - Agregar Toasts para CRUD
2. **Estudiantes.jsx** - Agregar Toasts y Modals
3. **Ajustes.jsx** - Agregar confirmaciones de cambios
4. **Dashboard.jsx** - Notificaciones de actualizaciones

## Código de Ejemplo Completo

```jsx
import { useState } from "react";
import Toast from "../../components/Toast/Toast";
import ConfirmModal from "../../components/Modal/ConfirmModal";

const MiComponente = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setShowConfirm(false);
    try {
      // Lógica de eliminación
      setSuccess("✓ Eliminado correctamente");
    } catch (err) {
      setError("Error al eliminar: " + err.message);
    }
  };

  return (
    <>
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError("")}
          duration={4000}
        />
      )}

      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess("")}
          duration={3000}
        />
      )}

      {showConfirm && (
        <ConfirmModal
          message="¿Está seguro de eliminar este elemento?"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
        />
      )}

      <button onClick={() => setShowConfirm(true)}>Eliminar</button>
    </>
  );
};
```

## Notas de Desarrollo

- Los Toasts se posicionan con `position: fixed` y `z-index: 9999`
- Los Modals tienen `z-index: 10000` para estar sobre los Toasts
- Ambos componentes son ligeros y no dependen de librerías externas
- Compatible con React 18+
- Totalmente accesible con teclado (ESC para cerrar modales)

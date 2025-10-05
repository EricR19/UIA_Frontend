import { useEffect, useRef, useCallback } from "react";

/**
 * Hook para detectar inactividad del usuario
 * @param {number} timeout - Tiempo en milisegundos antes de considerar inactivo
 * @param {function} onIdle - Callback cuando el usuario está inactivo
 */
const useIdleTimer = (timeout = 600000, onIdle) => {
  // 10 minutos por defecto
  const timeoutId = useRef(null);
  const lastActivity = useRef(Date.now());

  const resetTimer = useCallback(() => {
    lastActivity.current = Date.now();

    // Limpiar timeout anterior
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    // Crear nuevo timeout
    timeoutId.current = setTimeout(() => {
      onIdle?.();
    }, timeout);
  }, [timeout, onIdle]);

  useEffect(() => {
    // Eventos que indican actividad del usuario
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
    ];

    // Agregar listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Iniciar timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [resetTimer]);

  return {
    getLastActivity: () => lastActivity.current,
    resetTimer,
  };
};

export default useIdleTimer;

import { useState, useEffect, useCallback, useRef } from "react";
import { ChatUseCase } from "@/src/domain/useCases/chat/ChatUseCase";
import { Mensaje, EventoEscritura } from "@/src/domain/models/Mensaje";
import { useAuth } from "./useAuth";

const chatUseCase = new ChatUseCase();

export const useChat = () => {
  const { usuario } = useAuth();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [usuariosEscribiendo, setUsuariosEscribiendo] = useState<
    Map<string, EventoEscritura>
  >(new Map());

  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cargar mensajes históricos
  const cargarMensajes = useCallback(async () => {
    setCargando(true);
    const mensajesObtenidos = await chatUseCase.obtenerMensajes();
    setMensajes(mensajesObtenidos);
    setCargando(false);
  }, []);

  // Cargar mensajes de una contratación específica
  const cargarMensajesContratacion = useCallback(async (contratacionId: string) => {
    setCargando(true);
    const mensajesObtenidos = await chatUseCase.obtenerMensajesContratacion(contratacionId);
    setMensajes(mensajesObtenidos);
    setCargando(false);
  }, []);

  // Enviar mensaje
  const enviarMensaje = useCallback(async (contenido: string, contratacion_id?: string) => {
    if (!contenido.trim())
      return { success: false, error: "El mensaje está vacío" };

    setEnviando(true);
    const resultado = await chatUseCase.enviarMensaje(contenido, contratacion_id);
    setEnviando(false);

    return resultado;
  }, []);

  // Eliminar mensaje
  const eliminarMensaje = useCallback(async (mensajeId: string) => {
    const resultado = await chatUseCase.eliminarMensaje(mensajeId);
    if (resultado.success) {
      setMensajes((prev) => prev.filter((m) => m.id !== mensajeId));
    }
    return resultado;
  }, []);

  // ✅ NUEVO: Notificar que estoy escribiendo
  const notificarEscribiendo = useCallback(() => {
    if (usuario?.email) {
      chatUseCase.notificarEscribiendo(usuario.email);
    }
  }, [usuario]);

  // ✅ NUEVO: Manejar eventos de escritura de otros usuarios
  const manejarEventoEscritura = useCallback(
    (evento: EventoEscritura) => {
      // Ignorar mis propios eventos
      if (evento.usuario_id === usuario?.id) return;

      // Agregar/actualizar usuario escribiendo
      setUsuariosEscribiendo((prev) => {
        const nuevo = new Map(prev);
        nuevo.set(evento.usuario_id, evento);
        return nuevo;
      });

      // Limpiar timeout anterior si existe
      const timeoutAnterior = timeoutRefs.current.get(evento.usuario_id);
      if (timeoutAnterior) {
        clearTimeout(timeoutAnterior);
      }

      // Crear nuevo timeout para eliminar después de 2 segundos
      const nuevoTimeout = setTimeout(() => {
        setUsuariosEscribiendo((prev) => {
          const nuevo = new Map(prev);
          nuevo.delete(evento.usuario_id);
          return nuevo;
        });
        timeoutRefs.current.delete(evento.usuario_id);
      }, 2000);

      timeoutRefs.current.set(evento.usuario_id, nuevoTimeout);
    },
    [usuario?.id]
  );

  // Suscribirse a mensajes y eventos de escritura
  useEffect(() => {
    cargarMensajes();

    // Suscribirse a nuevos mensajes
    const desuscribirMensajes = chatUseCase.suscribirseAMensajes(
      (nuevoMensaje) => {
        setMensajes((prev) => {
          if (prev.some((m) => m.id === nuevoMensaje.id)) {
            return prev;
          }
          return [...prev, nuevoMensaje];
        });
      }
    );

    // ✅ NUEVO: Suscribirse a eventos de escritura
    const desuscribirEscritura =
      chatUseCase.suscribirseAEscritura(manejarEventoEscritura);

    // Limpiar suscripciones y timeouts al desmontar
    return () => {
      desuscribirMensajes();
      desuscribirEscritura();

      // Limpiar todos los timeouts
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, [cargarMensajes, manejarEventoEscritura]);

  return {
    mensajes,
    cargando,
    enviando,
    enviarMensaje,
    eliminarMensaje,
    recargarMensajes: cargarMensajes,
    cargarMensajesContratacion, // ✅ NUEVO
    notificarEscribiendo, // ✅ NUEVO
    usuariosEscribiendo: Array.from(usuariosEscribiendo.values()), // ✅ NUEVO
  };
};
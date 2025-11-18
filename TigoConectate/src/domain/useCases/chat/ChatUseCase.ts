import { supabase } from "@/src/data/services/supabaseClient";
import { Mensaje, EventoEscritura } from "@/src/domain/models/Mensaje";
import { RealtimeChannel } from "@supabase/supabase-js";

/**
 * ChatUseCase - Caso de Uso de Chat
 *
 * Gestiona mensajes en tiempo real entre usuarios y asesores
 * Los chats están asociados a contrataciones específicas
 */
export class ChatUseCase {
  private channel: RealtimeChannel | null = null;
  private typingChannel: RealtimeChannel | null = null;

  /**
   * Obtener mensajes de una contratación específica
   */
  async obtenerMensajesContratacion(contratacionId: string, limite: number = 50): Promise<Mensaje[]> {
    try {
      const { data, error } = await supabase
        .from("mensajes")
        .select(`
          *,
          usuarios:usuario_id(id, email, nombre, rol)
        `)
        .eq("contratacion_id", contratacionId)
        .order("created_at", { ascending: false })
        .limit(limite);

      if (error) {
        throw error;
      }

      const mensajesFormateados = (data || []).map((msg: any) => ({
        ...msg,
        usuario: msg.usuarios,
      }));

      return mensajesFormateados.reverse() as Mensaje[];
    } catch {
      return [];
    }
  }

  /**
   * Obtener mensajes históricos (chat general - mantener para compatibilidad)
   */
  async obtenerMensajes(limite: number = 50): Promise<Mensaje[]> {
    try {
      const { data, error } = await supabase
        .from("mensajes")
        .select(`
          *,
          usuarios:usuario_id(id, email, nombre, rol)
        `)
        .is("contratacion_id", null)
        .order("created_at", { ascending: false })
        .limit(limite);

      if (error) {
        throw error;
      }

      const mensajesFormateados = (data || []).map((msg: any) => ({
        ...msg,
        usuario: msg.usuarios,
      }));

      return mensajesFormateados.reverse() as Mensaje[];
    } catch {
      return [];
    }
  }

  /**
   * Enviar un nuevo mensaje (asociado a contratación)
   */
  async enviarMensaje(
    contenido: string,
    contratacionId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const { error } = await supabase.from("mensajes").insert({
        contenido,
        usuario_id: user.id,
        contratacion_id: contratacionId || null,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Suscribirse a mensajes de una contratación específica
   */
  suscribirseAMensajesContratacion(contratacionId: string, callback: (mensaje: Mensaje) => void) {
    this.channel = supabase.channel(`mensajes-contratacion-${contratacionId}`);

    this.channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
          filter: `contratacion_id=eq.${contratacionId}`,
        },
        async (payload) => {
          try {
            const { data, error } = await supabase
              .from("mensajes")
              .select(`
                *,
                usuarios:usuario_id(id, email, nombre, rol)
              `)
              .eq("id", payload.new.id)
              .single();

            if (error) {
              const mensajeFallback: Mensaje = {
                id: payload.new.id,
                contenido: payload.new.contenido,
                usuario_id: payload.new.usuario_id,
                contratacion_id: payload.new.contratacion_id,
                created_at: payload.new.created_at,
                usuario: {
                  id: payload.new.usuario_id,
                  email: "Desconocido",
                  nombre: "Usuario",
                  rol: "usuario_registrado",
                  activo: true,
                  created_at: new Date().toISOString(),
                },
              };

              callback(mensajeFallback);
              return;
            }

            if (data) {
              const mensajeFormateado: Mensaje = {
                id: data.id,
                contenido: data.contenido,
                usuario_id: data.usuario_id,
                contratacion_id: data.contratacion_id,
                created_at: data.created_at,
                usuario: data.usuarios || {
                  id: data.usuario_id,
                  email: "Desconocido",
                  nombre: "Usuario",
                  rol: "usuario_registrado",
                  activo: true,
                  created_at: new Date().toISOString(),
                },
              };

              callback(mensajeFormateado);
            }
          } catch {
            const mensajeFallback: Mensaje = {
              id: payload.new.id,
              contenido: payload.new.contenido,
              usuario_id: payload.new.usuario_id,
              contratacion_id: payload.new.contratacion_id,
              created_at: payload.new.created_at,
              usuario: {
                id: payload.new.usuario_id,
                email: "Desconocido",
                nombre: "Usuario",
                rol: "usuario_registrado",
                activo: true,
                created_at: new Date().toISOString(),
              },
            };

            callback(mensajeFallback);
          }
        }
      )
      .subscribe();

    return () => {
      if (this.channel) {
        supabase.removeChannel(this.channel);
        this.channel = null;
      }
    };
  }

  /**
   * Suscribirse a nuevos mensajes en tiempo real (chat general)
   */
  suscribirseAMensajes(callback: (mensaje: Mensaje) => void) {
    this.channel = supabase.channel("mensajes-channel");

    this.channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
        },
        async (payload) => {
          // Solo mensajes sin contratacion_id (chat general)
          if (payload.new.contratacion_id) return;

          try {
            const { data, error } = await supabase
              .from("mensajes")
              .select(`
                *,
                usuarios:usuario_id(id, email, nombre, rol, activo, created_at)
              `)
              .eq("id", payload.new.id)
              .single();

            if (error) {
              const mensajeFallback: Mensaje = {
                id: payload.new.id,
                contenido: payload.new.contenido,
                usuario_id: payload.new.usuario_id,
                created_at: payload.new.created_at,
                usuario: {
                  id: payload.new.usuario_id,
                  email: "Desconocido",
                  nombre: "Usuario",
                  rol: "usuario_registrado",
                  activo: true,
                  created_at: new Date().toISOString(),
                },
              };

              callback(mensajeFallback);
              return;
            }

            if (data) {
              const mensajeFormateado: Mensaje = {
                id: data.id,
                contenido: data.contenido,
                usuario_id: data.usuario_id,
                created_at: data.created_at,
                usuario: data.usuarios || {
                  id: data.usuario_id,
                  email: "Desconocido",
                  nombre: "Usuario",
                  rol: "usuario_registrado",
                  activo: true,
                  created_at: new Date().toISOString(),
                },
              };

              callback(mensajeFormateado);
            }
          } catch {
            const mensajeFallback: Mensaje = {
              id: payload.new.id,
              contenido: payload.new.contenido,
              usuario_id: payload.new.usuario_id,
              created_at: payload.new.created_at,
              usuario: {
                id: payload.new.usuario_id,
                email: "Desconocido",
                nombre: "Usuario",
                rol: "usuario_registrado",
                activo: true,
                created_at: new Date().toISOString(),
              },
            };

            callback(mensajeFallback);
          }
        }
      )
      .subscribe();

    return () => {
      if (this.channel) {
        supabase.removeChannel(this.channel);
        this.channel = null;
      }
    };
  }

  /**
   * Notificar que el usuario está escribiendo
   */
  async notificarEscribiendo(email: string, contratacionId?: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !this.typingChannel) return;

      await this.typingChannel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          usuario_id: user.id,
          usuario_email: email,
          contratacion_id: contratacionId,
          timestamp: Date.now(),
        },
      });
    } catch {
      // Error silencioso
    }
  }

  /**
   * Suscribirse a eventos de escritura
   */
  suscribirseAEscritura(callback: (evento: EventoEscritura) => void, contratacionId?: string) {
    const channelName = contratacionId 
      ? `typing-contratacion-${contratacionId}` 
      : "typing-channel";
    
    this.typingChannel = supabase.channel(channelName);

    this.typingChannel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        // Filtrar por contratacion si es necesario
        if (contratacionId && payload.contratacion_id !== contratacionId) return;
        callback(payload as EventoEscritura);
      })
      .subscribe();

    return () => {
      if (this.typingChannel) {
        supabase.removeChannel(this.typingChannel);
        this.typingChannel = null;
      }
    };
  }

  // Eliminar un mensaje
  async eliminarMensaje(
    mensajeId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("mensajes")
        .delete()
        .eq("id", mensajeId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
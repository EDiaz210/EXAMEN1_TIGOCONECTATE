import { supabase } from "@/src/data/services/supabaseClient";
import { Contratacion } from "../../models/Contratacion";

/**
 * ContratacionesUseCase - Caso de Uso de Contrataciones
 *
 * Contiene toda la lógica de negocio para:
 * - Solicitar contratación de plan (usuarios)
 * - Gestionar solicitudes pendientes (asesores)
 * - Aprobar/rechazar contrataciones
 * - Historial de contrataciones
 * - Notificaciones en tiempo real
 */

export class ContratacionesUseCase {
  /**
   * Solicitar contratación de un plan (usuario registrado)
   */
  async solicitarContratacion(
    usuarioId: string,
    planId: string,
    notasUsuario?: string
  ) {
    try {
      const nuevaContratacion = {
        usuario_id: usuarioId,
        plan_id: planId,
        estado: "pendiente" as const,
        fecha_solicitud: new Date().toISOString(),
        notas_usuario: notasUsuario || null,
      };

      const { data, error } = await supabase
        .from("contrataciones")
        .insert(nuevaContratacion)
        .select(`
          *,
          plan:planes_moviles(*),
          usuario:usuarios!usuario_id(*)
        `)
        .single();

      if (error) throw error;
      return { success: true, contratacion: data as Contratacion };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener contrataciones de un usuario
   */
  async obtenerContratacionesUsuario(usuarioId: string): Promise<Contratacion[]> {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .select(`
          *,
          plan:planes_moviles(
            id,
            nombre,
            descripcion,
            precio,
            datos_gb,
            minutos,
            sms,
            imagen_url,
            velocidad_4g,
            velocidad_5g,
            segmento
          ),
          asesor:usuarios!asesor_id(email, nombre, telefono)
        `)
        .eq("usuario_id", usuarioId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data as Contratacion[];
    } catch {
      return [];
    }
  }

  /**
   * Obtener todas las contrataciones pendientes (para asesores)
   */
  async obtenerContratacionesPendientes(): Promise<Contratacion[]> {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .select(`
          *,
          plan:planes_moviles(*),
          usuario:usuarios!usuario_id(*)
        `)
        .eq("estado", "pendiente")
        .order("fecha_solicitud", { ascending: true });

      if (error) throw error;
      return data as Contratacion[];
    } catch {
      return [];
    }
  }

  /**
   * Obtener contrataciones asignadas a un asesor
   */
  async obtenerContratacionesAsesor(asesorId: string): Promise<Contratacion[]> {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .select(`
          *,
          plan:planes_moviles(*),
          usuario:usuarios!usuario_id(*)
        `)
        .eq("asesor_id", asesorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Contratacion[];
    } catch {
      return [];
    }
  }

  /**
   * Obtener una contratación específica
   */
  async obtenerContratacion(contratacionId: string): Promise<Contratacion | null> {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .select(`
          *,
          plan:planes_moviles(*),
          usuario:usuarios!usuario_id(*),
          asesor:usuarios!asesor_id(*)
        `)
        .eq("id", contratacionId)
        .single();

      if (error) throw error;
      return data as Contratacion;
    } catch {
      return null;
    }
  }

  /**
   * Aprobar contratación (asesor)
   */
  async aprobarContratacion(
    contratacionId: string,
    asesorId: string,
    notasAsesor?: string
  ) {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .update({
          estado: "aprobada",
          asesor_id: asesorId,
          fecha_aprobacion: new Date().toISOString(),
          notas_asesor: notasAsesor || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contratacionId)
        .select(`
          *,
          plan:planes_moviles(*),
          usuario:usuarios!usuario_id(*),
          asesor:usuarios!asesor_id(*)
        `)
        .single();

      if (error) throw error;
      return { success: true, contratacion: data as Contratacion };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Rechazar contratación (asesor)
   */
  async rechazarContratacion(
    contratacionId: string,
    asesorId: string,
    notasAsesor: string
  ) {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .update({
          estado: "rechazada",
          asesor_id: asesorId,
          fecha_aprobacion: new Date().toISOString(),
          notas_asesor: notasAsesor,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contratacionId)
        .select(`
          *,
          plan:planes_moviles(*),
          usuario:usuarios!usuario_id(*),
          asesor:usuarios!asesor_id(*)
        `)
        .single();

      if (error) throw error;
      return { success: true, contratacion: data as Contratacion };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancelar contratación (usuario)
   */
  async cancelarContratacion(contratacionId: string, usuarioId: string) {
    try {
      // Verificar que la contratación pertenece al usuario
      const { data: contratacion, error: checkError } = await supabase
        .from("contrataciones")
        .select("usuario_id, estado")
        .eq("id", contratacionId)
        .single();

      if (checkError) throw checkError;
      if (contratacion.usuario_id !== usuarioId) {
        throw new Error("No autorizado");
      }
      if (contratacion.estado !== "pendiente") {
        throw new Error("Solo se pueden cancelar solicitudes pendientes");
      }

      const { error } = await supabase
        .from("contrataciones")
        .update({
          estado: "cancelada",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contratacionId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Escuchar cambios en contrataciones de un usuario (Realtime)
   */
  escucharContratacionesUsuario(
    usuarioId: string,
    callback: (payload: any) => void
  ) {
    const channel = supabase
      .channel(`contrataciones-usuario-${usuarioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contrataciones",
          filter: `usuario_id=eq.${usuarioId}`,
        },
        callback
      )
      .subscribe();

    return channel;
  }

  /**
   * Escuchar cambios en contrataciones pendientes (para asesores)
   */
  escucharContratacionesPendientes(callback: (payload: any) => void) {
    const channel = supabase
      .channel("contrataciones-pendientes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contrataciones",
        },
        callback
      )
      .subscribe();

    return channel;
  }

  /**
   * Obtener estadísticas de contrataciones (asesor)
   */
  async obtenerEstadisticasAsesor(asesorId: string) {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .select("estado")
        .eq("asesor_id", asesorId);

      if (error) throw error;

      const stats = {
        total: data.length,
        aprobadas: data.filter((c) => c.estado === "aprobada").length,
        rechazadas: data.filter((c) => c.estado === "rechazada").length,
        pendientes: data.filter((c) => c.estado === "pendiente").length,
      };

      return { success: true, stats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

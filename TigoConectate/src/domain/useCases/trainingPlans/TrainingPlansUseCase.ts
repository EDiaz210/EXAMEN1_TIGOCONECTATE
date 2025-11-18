import { supabase } from "@/src/data/services/supabaseClient";
import { PlanEntrenamiento } from "../../models/PlanEntrenamiento";

/**
 * TrainingPlansUseCase - Caso de Uso de Planes de Entrenamiento
 *
 * Gestiona la asignación de rutinas a usuarios:
 * - Crear planes de entrenamiento
 * - Listar planes por usuario
 * - Listar planes por entrenador
 * - Actualizar y desactivar planes
 */

export class TrainingPlansUseCase {
  /**
   * Crear nuevo plan de entrenamiento
   * Asigna una rutina a un usuario específico
   */
  async crearPlan(
    usuarioId: string,      // 1. ID del usuario que recibe el plan
    entrenadorId: string,   // 2. ID del entrenador que crea el plan
    rutinaId: string,       // 3. ID de la rutina a asignar
    fechaInicio: string,
    diasSemana: string[],
    fechaFin?: string,
    notas?: string
  ) {
    try {
      const { data, error } = await supabase
        .from("planes_entrenamiento")
        .insert({
          usuario_id: usuarioId,
          entrenador_id: entrenadorId,
          rutina_id: rutinaId,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          dias_semana: diasSemana,
          notas: notas,
          activo: true,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, plan: data as PlanEntrenamiento };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }


  /**
   * Obtener planes de un usuario específico
   * Incluye información de la rutina asignada
   */
  async obtenerPlanesUsuario(usuarioId: string) {
    try {
      const { data, error } = await supabase
        .from("planes_entrenamiento")
        .select(`
          *,
          usuario:usuarios!planes_entrenamiento_usuario_id_fkey(email, nombre),
          rutina:rutinas(titulo, descripcion, ejercicios)
        `)
        .eq("usuario_id", usuarioId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, planes: data as PlanEntrenamiento[] };
    } catch (error: any) {
      return { success: false, error: error.message, planes: [] };
    }
  }

  /**
   * Obtener todos los planes creados por un entrenador
   */
  async obtenerPlanesEntrenador(entrenadorId: string) {
    try {
      const { data, error } = await supabase
        .from("planes_entrenamiento")
        .select(`
          *,
          usuario:usuarios!planes_entrenamiento_usuario_id_fkey(email, nombre),
          rutina:rutinas(titulo, descripcion)
        `)
        .eq("entrenador_id", entrenadorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, planes: data as PlanEntrenamiento[] };
    } catch (error: any) {
      return { success: false, error: error.message, planes: [] };
    }
  }

  /**
   * Obtener plan específico por ID
   */
  async obtenerPlan(planId: string) {
    try {
      const { data, error } = await supabase
        .from("planes_entrenamiento")
        .select(`
          *,
          usuario:usuarios!planes_entrenamiento_usuario_id_fkey(email, nombre),
          rutina:rutinas(titulo, descripcion, ejercicios)
        `)
        .eq("id", planId)
        .single();

      if (error) throw error;
      return { success: true, plan: data as PlanEntrenamiento };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar plan de entrenamiento
   */
  async actualizarPlan(
    planId: string,
    datos: Partial<Omit<PlanEntrenamiento, "id" | "usuario_id" | "entrenador_id" | "created_at">>
  ) {
    try {
      const { data, error } = await supabase
        .from("planes_entrenamiento")
        .update(datos)
        .eq("id", planId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, plan: data as PlanEntrenamiento };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Desactivar un plan (no lo elimina, solo lo marca como inactivo)
   */
  async desactivarPlan(planId: string) {
    return this.actualizarPlan(planId, { activo: false });
  }

  /**
   * Obtener usuarios asignados a un entrenador
   */
  async obtenerUsuariosAsignados(entrenadorId: string) {
    try {
      const { data, error } = await supabase
        .from("planes_entrenamiento")
        .select(`
          usuario:usuarios!planes_entrenamiento_usuario_id_fkey(id, email, nombre)
        `)
        .eq("entrenador_id", entrenadorId)
        .eq("activo", true);

      if (error) throw error;
      
      // Eliminar duplicados
      const usuariosUnicos = data
        .map(item => item.usuario)
        .filter((usuario: any, index: number, self: any[]) => 
          index === self.findIndex((u: any) => u.id === usuario.id)
        );

      return { success: true, usuarios: usuariosUnicos };
    } catch (error: any) {
      return { success: false, error: error.message, usuarios: [] };
    }
  }
}

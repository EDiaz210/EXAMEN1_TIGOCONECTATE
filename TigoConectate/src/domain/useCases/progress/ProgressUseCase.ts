import { supabase } from "@/src/data/services/supabaseClient";
import { Progreso } from "../../models/Progreso";
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

/**
 * ProgressUseCase - Caso de Uso de Progreso
 *
 * Gestiona el registro y seguimiento del progreso de los usuarios:
 * - Registrar entrenamientos completados
 * - Subir fotos de progreso
 * - Ver histórico de entrenamientos
 */

export class ProgressUseCase {
  /**
   * Registrar progreso de un entrenamiento
   */
  async registrarProgreso(
    usuarioId: string,
    planId: string,
    fecha: string,
    ejercicio: string,
    seriesCompletadas: number,
    repeticionesReales: string,
    pesoUsado?: number,
    notas?: string,
    fotosProgreso?: string[]
  ) {
    try {
      const { data, error } = await supabase
        .from("progreso")
        .insert({
          usuario_id: usuarioId,
          plan_id: planId,
          fecha: fecha,
          ejercicio: ejercicio,
          series_completadas: seriesCompletadas,
          peso_usado: pesoUsado,
          repeticiones_reales: repeticionesReales,
          notas: notas,
          fotos_progreso: fotosProgreso,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, progreso: data as Progreso };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener progreso de un usuario en un plan específico
   */
  async obtenerProgresoUsuario(usuarioId: string, planId?: string) {
    try {
      let query = supabase
        .from("progreso")
        .select(`
          *,
          usuario:usuarios(email, nombre)
        `)
        .eq("usuario_id", usuarioId)
        .order("fecha", { ascending: false });

      if (planId) {
        query = query.eq("plan_id", planId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, progresos: data as Progreso[] };
    } catch (error: any) {
      return { success: false, error: error.message, progresos: [] };
    }
  }

  /**
   * Obtener progreso de todos los usuarios de un entrenador
   */
  async obtenerProgresoEntrenador(entrenadorId: string) {
    try {
      // Obtener TODO el progreso registrado con información de usuario
      const { data, error } = await supabase
        .from("progreso")
        .select(`
          *,
          usuario:usuarios(email, nombre)
        `)
        .order("fecha", { ascending: false });

      if (error) throw error;
      
      return { success: true, progresos: data as Progreso[] };
    } catch (error: any) {
      return { success: false, error: error.message, progresos: [] };
    }
  }

  /**
   * Obtener estadísticas de un ejercicio específico
   */
  async obtenerEstadisticasEjercicio(usuarioId: string, ejercicio: string) {
    try {
      const { data, error } = await supabase
        .from("progreso")
        .select("*")
        .eq("usuario_id", usuarioId)
        .eq("ejercicio", ejercicio)
        .order("fecha", { ascending: true });

      if (error) throw error;
      return { success: true, estadisticas: data as Progreso[] };
    } catch (error: any) {
      return { success: false, error: error.message, estadisticas: [] };
    }
  }

  /**
   * Subir foto de progreso al storage
   */
  async subirFotoProgreso(uri: string, usuarioId: string) {
    try {
      const timestamp = Date.now();
      const fileName = `foto_${timestamp}.jpg`;
      const filePath = `${usuarioId}/${fileName}`;

      // Usar la API legacy de FileSystem
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convertir base64 a ArrayBuffer
      const arrayBuffer = decode(base64);

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("fotos-progreso")
        .upload(filePath, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("fotos-progreso")
        .getPublicUrl(filePath);

      return { 
        success: true, 
        url: urlData.publicUrl,
        path: filePath 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar foto de progreso del storage
   */
  async eliminarFotoProgreso(fotoPath: string) {
    try {
      const { error } = await supabase.storage
        .from("fotos-progreso")
        .remove([fotoPath]);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar registro de progreso
   */
  async actualizarProgreso(
    progresoId: string,
    datos: Partial<Omit<Progreso, "id" | "usuario_id" | "created_at">>
  ) {
    try {
      const { data, error } = await supabase
        .from("progreso")
        .update(datos)
        .eq("id", progresoId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, progreso: data as Progreso };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar registro de progreso
   */
  async eliminarProgreso(progresoId: string) {
    try {
      const { error } = await supabase
        .from("progreso")
        .delete()
        .eq("id", progresoId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

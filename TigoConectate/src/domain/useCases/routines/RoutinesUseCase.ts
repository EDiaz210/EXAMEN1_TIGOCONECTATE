import { supabase } from "@/src/data/services/supabaseClient";
import { Rutina, Ejercicio } from "../../models/Rutina";
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

/**
 * RoutinesUseCase - Caso de Uso de Rutinas
 *
 * Contiene toda la lógica de negocio para:
 * - Crear rutinas (entrenadores)
 * - Listar rutinas
 * - Actualizar rutinas
 * - Eliminar rutinas
 * - Subir videos demostrativos
 */

export class RoutinesUseCase {
  /**
   * Obtener todas las rutinas de un entrenador
   */
  async obtenerRutinasEntrenador(entrenadorId: string): Promise<Rutina[]> {
    try {
      const { data, error } = await supabase
        .from("rutinas")
        .select("*")
        .eq("entrenador_id", entrenadorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Rutina[];
    } catch {
      return [];
    }
  }

  /**
   * Obtener rutinas asignadas a un usuario
   * A través de los planes de entrenamiento activos
   */
  async obtenerRutinasAsignadas(usuarioId: string): Promise<Rutina[]> {
    try {
      // 1. Obtener planes activos del usuario
      const { data: planes, error: planesError } = await supabase
        .from("planes_entrenamiento")
        .select("rutina_id")
        .eq("usuario_id", usuarioId)
        .eq("activo", true);

      if (planesError) throw planesError;
      
      if (!planes || planes.length === 0) {
        return [];
      }

      // 2. Obtener IDs únicos de rutinas
      const rutinaIds = [...new Set(planes.map(p => p.rutina_id))];

      // 3. Obtener las rutinas completas
      const { data: rutinas, error: rutinasError } = await supabase
        .from("rutinas")
        .select("*")
        .in("id", rutinaIds)
        .order("created_at", { ascending: false });

      if (rutinasError) throw rutinasError;
      
      return rutinas as Rutina[];
    } catch {
      return [];
    }
  }

  /**
   * Crear nueva rutina (solo entrenadores)
   */
  async crearRutina(
    titulo: string,
    descripcion: string,
    ejercicios: Ejercicio[],
    entrenadorId: string
  ): Promise<{ success: boolean; rutina?: Rutina; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("rutinas")
        .insert({
          titulo,
          descripcion,
          ejercicios,
          entrenador_id: entrenadorId,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, rutina: data as Rutina };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }




  /**
   * Obtener una rutina específica por ID
   */
  async obtenerRutina(rutinaId: string): Promise<Rutina | null> {
    try {
      const { data, error } = await supabase
        .from("rutinas")
        .select("*")
        .eq("id", rutinaId)
        .single();

      if (error) throw error;
      return data as Rutina;
    } catch {
      return null;
    }
  }

  /**
   * Actualizar rutina existente
   */
  async actualizarRutina(
    rutinaId: string,
    datos: Partial<Omit<Rutina, "id" | "entrenador_id" | "created_at">>
  ) {
    try {
      const { data, error } = await supabase
        .from("rutinas")
        .update(datos)
        .eq("id", rutinaId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, rutina: data as Rutina };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar rutina
   */
  async eliminarRutina(rutinaId: string) {
    try {
      const { error } = await supabase
        .from("rutinas")
        .delete()
        .eq("id", rutinaId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Subir video demostrativo al storage
   * @param uri - URI local del video
   * @param ejercicioNombre - Nombre del ejercicio (para el nombre del archivo)
   * @param entrenadorId - ID del entrenador que sube el video
   */
  async subirVideo(uri: string, ejercicioNombre: string, entrenadorId: string) {
    try {
      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileName = `${ejercicioNombre.replace(/\s+/g, '_')}_${timestamp}.mp4`;
      const filePath = `${entrenadorId}/${fileName}`;

      // Usar la API legacy de FileSystem
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convertir base64 a ArrayBuffer
      const arrayBuffer = decode(base64);

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("videos-ejercicios")
        .upload(filePath, arrayBuffer, {
          contentType: "video/mp4",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("videos-ejercicios")
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
   * Eliminar video del storage
   */
  async eliminarVideo(videoPath: string) {
    try {
      const { error } = await supabase.storage
        .from("videos-ejercicios")
        .remove([videoPath]);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
import { supabase } from "@/src/data/services/supabaseClient";
import { PlanMovil } from "../../models/PlanMovil";
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

/**
 * PlanesMovilesUseCase - Caso de Uso de Planes Móviles
 *
 * Contiene toda la lógica de negocio para:
 * - Crear planes móviles (asesores)
 * - Listar planes (todos los usuarios)
 * - Actualizar planes (asesores)
 * - Eliminar/desactivar planes
 * - Subir imágenes promocionales
 */

export class PlanesMovilesUseCase {
  /**
   * Obtener todos los planes activos (acceso público)
   */
  async obtenerPlanesActivos(): Promise<PlanMovil[]> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .select("*")
        .eq("activo", true)
        .order("precio", { ascending: true });

      if (error) throw error;
      return data as PlanMovil[];
    } catch {
      return [];
    }
  }

  /**
   * Obtener todos los planes de un asesor
   */
  async obtenerPlanesAsesor(asesorId: string): Promise<PlanMovil[]> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .select("*")
        .eq("asesor_id", asesorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PlanMovil[];
    } catch {
      return [];
    }
  }

  /**
   * Crear nuevo plan móvil (solo asesores)
   */
  async crearPlan(plan: Omit<PlanMovil, "id" | "created_at">): Promise<{ success: boolean; plan?: PlanMovil; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .insert(plan)
        .select()
        .single();

      if (error) throw error;
      return { success: true, plan: data as PlanMovil };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener un plan específico por ID
   */
  async obtenerPlan(planId: string): Promise<PlanMovil | null> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .select("*")
        .eq("id", planId)
        .single();

      if (error) throw error;
      return data as PlanMovil;
    } catch {
      return null;
    }
  }

  /**
   * Actualizar plan existente
   */
  async actualizarPlan(
    planId: string,
    datos: Partial<Omit<PlanMovil, "id" | "asesor_id" | "created_at">>
  ) {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .update({ ...datos, updated_at: new Date().toISOString() })
        .eq("id", planId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, plan: data as PlanMovil };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar (desactivar) plan
   */
  async eliminarPlan(planId: string) {
    try {
      const { error } = await supabase
        .from("planes_moviles")
        .update({ activo: false })
        .eq("id", planId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Subir imagen promocional del plan
   */
  async subirImagen(uri: string, planId: string) {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = decode(base64);
      const fileExt = uri.split('.').pop();
      const fileName = `${planId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('planes-imagenes')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('planes-imagenes')
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
   * Eliminar imagen del storage
   */
  async eliminarImagen(imagenPath: string) {
    try {
      const { error } = await supabase.storage
        .from("planes-imagenes")
        .remove([imagenPath]);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Buscar planes por nombre solamente
   */
  async buscarPlanes(query: string): Promise<PlanMovil[]> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .select("*")
        .eq("activo", true)
        .ilike("nombre", `%${query}%`)
        .order("precio", { ascending: true });

      if (error) throw error;
      return data as PlanMovil[];
    } catch {
      return [];
    }
  }

  /**
   * Filtrar planes por segmento
   */
  async filtrarPorSegmento(segmento: "basico" | "medio" | "premium"): Promise<PlanMovil[]> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .select("*")
        .eq("activo", true)
        .eq("segmento", segmento)
        .order("precio", { ascending: true });

      if (error) throw error;
      return data as PlanMovil[];
    } catch {
      return [];
    }
  }
}

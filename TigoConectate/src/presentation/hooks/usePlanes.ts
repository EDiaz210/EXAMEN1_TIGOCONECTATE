import { useState } from "react";
import { PlanesMovilesUseCase } from "@/src/domain/useCases/planesMoviles/PlanesMovilesUseCase";
import { PlanMovil } from "@/src/domain/models/PlanMovil";

const planesUseCase = new PlanesMovilesUseCase();

/**
 * Hook para gestionar planes móviles
 */
export const usePlanes = () => {
  const [planes, setPlanes] = useState<PlanMovil[]>([]);
  const [planesActivos, setPlanesActivos] = useState<PlanMovil[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener todos los planes activos (público)
   */
  const obtenerPlanesActivos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await planesUseCase.obtenerPlanesActivos();
      setPlanesActivos(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener planes de un asesor
   */
  const obtenerPlanesAsesor = async (asesorId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await planesUseCase.obtenerPlanesAsesor(asesorId);
      setPlanes(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener un plan por ID
   */
  const obtenerPlanPorId = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await planesUseCase.obtenerPlan(planId);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear nuevo plan (asesor)
   */
  const crearPlan = async (plan: Omit<PlanMovil, "id" | "created_at" | "updated_at">) => {
    try {
      setLoading(true);
      setError(null);
      const result = await planesUseCase.crearPlan(plan);
      
      if (result.success) {
        await obtenerPlanesActivos();
      } else {
        setError(result.error || "Error al crear plan");
      }
      
      return result;
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar plan existente
   */
  const actualizarPlan = async (
    planId: string,
    datos: Partial<Omit<PlanMovil, "id" | "asesor_id" | "created_at">>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await planesUseCase.actualizarPlan(planId, datos);
      
      if (!result.success) {
        setError(result.error || "Error al actualizar plan");
      }
      
      return result;
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar (desactivar) plan
   */
  const eliminarPlan = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await planesUseCase.eliminarPlan(planId);
      
      if (!result.success) {
        setError(result.error || "Error al eliminar plan");
      }
      
      return result;
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Subir imagen promocional
   */
  const subirImagen = async (uri: string, planId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await planesUseCase.subirImagen(uri, planId);
      
      if (!result.success) {
        setError(result.error || "Error al subir imagen");
      }
      
      return result;
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar imagen del storage
   */
  const eliminarImagen = async (imagenPath: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await planesUseCase.eliminarImagen(imagenPath);
      
      if (!result.success) {
        setError(result.error || "Error al eliminar imagen");
      }
      
      return result;
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buscar planes
   */
  const buscarPlanes = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await planesUseCase.buscarPlanes(query);
      setPlanesActivos(data); // Actualizar el estado
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtrar por segmento
   */
  const filtrarPorSegmento = async (segmento: "basico" | "medio" | "premium") => {
    try {
      setLoading(true);
      setError(null);
      const data = await planesUseCase.filtrarPorSegmento(segmento);
      setPlanesActivos(data); // Actualizar el estado
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    planes,
    planesActivos,
    loading,
    error,
    obtenerPlanesActivos,
    obtenerPlanesAsesor,
    obtenerPlanPorId,
    crearPlan,
    actualizarPlan,
    eliminarPlan,
    subirImagen,
    eliminarImagen,
    buscarPlanes,
    filtrarPorSegmento,
  };
};

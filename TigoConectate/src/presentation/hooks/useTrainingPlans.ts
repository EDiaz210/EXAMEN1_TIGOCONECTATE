import { useState, useEffect } from "react";
import { TrainingPlansUseCase } from "@/src/domain/useCases/trainingPlans/TrainingPlansUseCase";
import { PlanEntrenamiento } from "@/src/domain/models/PlanEntrenamiento";

const trainingPlansUseCase = new TrainingPlansUseCase();

/**
 * Hook personalizado para gestionar planes de entrenamiento
 */
export function useTrainingPlans(usuarioId?: string, entrenadorId?: string) {
  const [planes, setPlanes] = useState<PlanEntrenamiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar planes al montar
  useEffect(() => {
    if (usuarioId || entrenadorId) {
      cargarPlanes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId, entrenadorId]);

  const cargarPlanes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (usuarioId) {
        result = await trainingPlansUseCase.obtenerPlanesUsuario(usuarioId);
      } else if (entrenadorId) {
        result = await trainingPlansUseCase.obtenerPlanesEntrenador(entrenadorId);
      } else {
        setPlanes([]);
        setLoading(false);
        return;
      }

      if (result.success) {
        setPlanes(result.planes);
      } else {
        setError(result.error || "Error al cargar planes");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const crearPlan = async (
    usuarioIdTarget: string,
    entrenadorIdParam: string,  // ← Cambiar nombre para evitar confusión
    rutinaId: string,
    fechaInicio: string,
    diasSemana: string[],
    fechaFin?: string,
    notas?: string
  ) => {
    // ✅ Usar el parámetro recibido, no el del hook
    const entrenadorIdFinal = entrenadorIdParam || entrenadorId;
    
    if (!entrenadorIdFinal) {
      return { success: false, error: "No hay entrenador ID" };
    }

    setLoading(true);
    setError(null);
    
    const result = await trainingPlansUseCase.crearPlan(
      usuarioIdTarget,
      entrenadorIdFinal,
      rutinaId,
      fechaInicio,
      diasSemana,
      fechaFin,
      notas
    );
    
    setLoading(false);

    if (result.success) {
      await cargarPlanes();
    } else {
      setError(result.error || "Error al crear plan");
    }

    return result;
  };

  const actualizarPlan = async (
    planId: string,
    datos: Partial<Omit<PlanEntrenamiento, "id" | "usuario_id" | "entrenador_id" | "created_at">>
  ) => {
    setLoading(true);
    setError(null);
    const result = await trainingPlansUseCase.actualizarPlan(planId, datos);
    setLoading(false);

    if (result.success) {
      await cargarPlanes();
    } else {
      setError(result.error || "Error al actualizar plan");
    }

    return result;
  };

  const desactivarPlan = async (planId: string) => {
    setLoading(true);
    setError(null);
    const result = await trainingPlansUseCase.desactivarPlan(planId);
    setLoading(false);

    if (result.success) {
      await cargarPlanes();
    } else {
      setError(result.error || "Error al desactivar plan");
    }

    return result;
  };

  const obtenerPlan = async (planId: string) => {
    setLoading(true);
    setError(null);
    const result = await trainingPlansUseCase.obtenerPlan(planId);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Plan no encontrado");
    }

    return result;
  };

  const obtenerUsuariosAsignados = async () => {
    if (!entrenadorId) {
      return { success: false, error: "No hay entrenador ID", usuarios: [] };
    }

    setLoading(true);
    setError(null);
    const result = await trainingPlansUseCase.obtenerUsuariosAsignados(entrenadorId);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Error al obtener usuarios");
    }

    return result;
  };

  return {
    planes,
    loading,
    error,
    crearPlan,
    actualizarPlan,
    desactivarPlan,
    obtenerPlan,
    obtenerUsuariosAsignados,
    recargar: cargarPlanes,
  };
}

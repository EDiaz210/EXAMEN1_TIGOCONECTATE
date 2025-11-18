import { useState, useEffect } from "react";
import { ProgressUseCase } from "@/src/domain/useCases/progress/ProgressUseCase";
import { Progreso } from "@/src/domain/models/Progreso";
import { supabase } from "@/src/data/services/supabaseClient";

const progressUseCase = new ProgressUseCase();

/**
 * Hook personalizado para gestionar el progreso
 */
export function useProgress(usuarioId?: string, entrenadorId?: string) {
  const [progresos, setProgresos] = useState<Progreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar progresos al montar
  useEffect(() => {
    if (usuarioId || entrenadorId) {
      cargarProgresos();
    }
  }, [usuarioId, entrenadorId]);

  const cargarProgresos = async (planId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (usuarioId) {
        result = await progressUseCase.obtenerProgresoUsuario(usuarioId, planId);
      } else if (entrenadorId) {
        result = await progressUseCase.obtenerProgresoEntrenador(entrenadorId);
      } else {
        setProgresos([]);
        setLoading(false);
        return;
      }

      if (result.success) {
        setProgresos(result.progresos);
      } else {
        setError(result.error || "Error al cargar progresos");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const registrarProgreso = async (datos: {
    usuario_id: string;
    ejercicio: string;
    series: number;
    repeticiones: number;
    peso?: number;
    notas?: string;
    foto_url?: string;
    foto_path?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    // Crear o obtener rutina y plan genéricos para progreso libre
    let planId = null;
    try {
      // 1. Buscar o crear rutina genérica del usuario
      let rutinaId = null;
      const { data: rutinaExistente } = await supabase
        .from('rutinas')
        .select('id')
        .eq('entrenador_id', datos.usuario_id)
        .eq('titulo', 'Progreso Libre')
        .single();

      if (rutinaExistente) {
        rutinaId = rutinaExistente.id;
      } else {
        const { data: nuevaRutina } = await supabase
          .from('rutinas')
          .insert({
            entrenador_id: datos.usuario_id,
            titulo: 'Progreso Libre',
            descripcion: 'Rutina automática para registro de progreso personal',
            ejercicios: []
          })
          .select('id')
          .single();
        
        if (nuevaRutina) rutinaId = nuevaRutina.id;
      }

      // 2. Buscar o crear plan genérico
      const { data: planExistente } = await supabase
        .from('planes_entrenamiento')
        .select('id')
        .eq('usuario_id', datos.usuario_id)
        .eq('rutina_id', rutinaId)
        .single();

      if (planExistente) {
        planId = planExistente.id;
      } else {
        const { data: nuevoPlan } = await supabase
          .from('planes_entrenamiento')
          .insert({
            usuario_id: datos.usuario_id,
            entrenador_id: datos.usuario_id,
            rutina_id: rutinaId,
            fecha_inicio: new Date().toISOString().split('T')[0],
            dias_semana: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
            notas: 'Plan automático para progreso libre'
          })
          .select('id')
          .single();
        
        if (nuevoPlan) planId = nuevoPlan.id;
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'No se pudo crear el plan de progreso' };
    }

    if (!planId) {
      setLoading(false);
      return { success: false, error: 'No se pudo crear el plan de progreso' };
    }

    const result = await progressUseCase.registrarProgreso(
      datos.usuario_id,
      planId,
      new Date().toISOString(),
      datos.ejercicio,
      datos.series,
      datos.repeticiones.toString(),
      datos.peso,
      datos.notas,
      datos.foto_url ? [datos.foto_url] : undefined
    );
    setLoading(false);

    if (result.success) {
      await cargarProgresos();
    } else {
      setError(result.error || "Error al registrar progreso");
    }

    return result;
  };

  const obtenerProgreso = async (userId: string, esEntrenador: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      if (esEntrenador) {
        result = await progressUseCase.obtenerProgresoEntrenador(userId);
      } else {
        result = await progressUseCase.obtenerProgresoUsuario(userId);
      }
      
      setLoading(false);
      
      if (result.success) {
        return { success: true, progresos: result.progresos };
      } else {
        setError(result.error || "Error al obtener progreso");
        return { success: false, progresos: [] };
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return { success: false, progresos: [] };
    }
  };

  const actualizarProgreso = async (
    progresoId: string,
    datos: Partial<Omit<Progreso, "id" | "usuario_id" | "created_at">>
  ) => {
    setLoading(true);
    setError(null);
    const result = await progressUseCase.actualizarProgreso(progresoId, datos);
    setLoading(false);

    if (result.success) {
      await cargarProgresos();
    } else {
      setError(result.error || "Error al actualizar progreso");
    }

    return result;
  };

  const eliminarProgreso = async (progresoId: string) => {
    setLoading(true);
    setError(null);
    const result = await progressUseCase.eliminarProgreso(progresoId);
    setLoading(false);

    if (result.success) {
      await cargarProgresos();
    } else {
      setError(result.error || "Error al eliminar progreso");
    }

    return result;
  };

  const obtenerEstadisticas = async (ejercicio: string) => {
    if (!usuarioId) {
      return { success: false, error: "No hay usuario ID", estadisticas: [] };
    }

    setLoading(true);
    setError(null);
    const result = await progressUseCase.obtenerEstadisticasEjercicio(
      usuarioId,
      ejercicio
    );
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Error al obtener estadísticas");
    }

    return result;
  };

  const subirFoto = async (uri: string) => {
    if (!usuarioId) {
      return { url: null, path: null };
    }

    setLoading(true);
    setError(null);
    const result = await progressUseCase.subirFotoProgreso(uri, usuarioId);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Error al subir foto");
      return { url: null, path: null };
    }

    return { url: result.url, path: result.path };
  };

  const eliminarFoto = async (fotoPath: string) => {
    setLoading(true);
    const result = await progressUseCase.eliminarFotoProgreso(fotoPath);
    setLoading(false);
    return result;
  };

  return {
    progresos,
    loading,
    error,
    registrarProgreso,
    obtenerProgreso,
    actualizarProgreso,
    eliminarProgreso,
    obtenerEstadisticas,
    subirFoto,
    eliminarFoto,
    recargar: cargarProgresos,
  };
}

import { useState, useEffect } from "react";
import { RoutinesUseCase } from "@/src/domain/useCases/routines/RoutinesUseCase";
import { Rutina, Ejercicio } from "@/src/domain/models/Rutina";

const routinesUseCase = new RoutinesUseCase();

/**
 * Hook personalizado para gestionar rutinas
 * 
 * @param entrenadorId - Si es entrenador, muestra las rutinas que creó
 * @param usuarioId - Si es usuario, muestra las rutinas asignadas
 * @param esEntrenador - Boolean para determinar el comportamiento
 */
export function useRoutines(
  userId?: string,
  esEntrenador?: boolean
) {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar rutinas al montar o cuando cambien los parámetros
  useEffect(() => {
    if (userId) {
      cargarRutinas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, esEntrenador]);

  const cargarRutinas = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      let data: Rutina[];
      
      if (esEntrenador) {
        // Entrenadores ven sus rutinas creadas
        data = await routinesUseCase.obtenerRutinasEntrenador(userId);
      } else {
        // Usuarios ven sus rutinas asignadas
        data = await routinesUseCase.obtenerRutinasAsignadas(userId);
      }
      
      setRutinas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const crearRutina = async (
    titulo: string,
    descripcion: string,
    ejercicios: Ejercicio[]
  ) => {
    if (!userId || !esEntrenador) {
      return { success: false, error: "Solo entrenadores pueden crear rutinas" };
    }

    setLoading(true);
    setError(null);
    const result = await routinesUseCase.crearRutina(
      titulo,
      descripcion,
      ejercicios,
      userId
    );
    setLoading(false);

    if (result.success) {
      await cargarRutinas();
    } else {
      setError(result.error || "Error al crear rutina");
    }

    return result;
  };

  const actualizarRutina = async (
    rutinaId: string,
    datos: Partial<Omit<Rutina, "id" | "entrenador_id" | "created_at">>
  ) => {
    setLoading(true);
    setError(null);
    const result = await routinesUseCase.actualizarRutina(rutinaId, datos);
    setLoading(false);

    if (result.success) {
      await cargarRutinas();
    } else {
      setError(result.error || "Error al actualizar rutina");
    }

    return result;
  };

  const eliminarRutina = async (rutinaId: string) => {
    setLoading(true);
    setError(null);
    const result = await routinesUseCase.eliminarRutina(rutinaId);
    setLoading(false);

    if (result.success) {
      await cargarRutinas();
    } else {
      setError(result.error || "Error al eliminar rutina");
    }

    return result;
  };

  const obtenerRutina = async (rutinaId: string) => {
    setLoading(true);
    setError(null);
    const rutina = await routinesUseCase.obtenerRutina(rutinaId);
    setLoading(false);

    if (!rutina) {
      setError("Rutina no encontrada");
    }

    return rutina;
  };

  const subirVideo = async (uri: string, ejercicioNombre: string) => {
    if (!userId || !esEntrenador) {
      return { success: false, error: "Solo entrenadores pueden subir videos" };
    }

    setLoading(true);
    setError(null);
    const result = await routinesUseCase.subirVideo(uri, ejercicioNombre, userId);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Error al subir video");
    }

    return result;
  };

  const eliminarVideo = async (videoPath: string) => {
    setLoading(true);
    const result = await routinesUseCase.eliminarVideo(videoPath);
    setLoading(false);
    return result;
  };

  return {
    rutinas,
    loading,
    error,
    crearRutina,
    actualizarRutina,
    eliminarRutina,
    obtenerRutina,
    subirVideo,
    eliminarVideo,
    recargar: cargarRutinas,
  };
}
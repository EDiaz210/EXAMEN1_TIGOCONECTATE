import { useState, useEffect } from "react";
import { ContratacionesUseCase } from "@/src/domain/useCases/contrataciones/ContratacionesUseCase";
import { Contratacion } from "@/src/domain/models/Contratacion";
import { RealtimeChannel } from "@supabase/supabase-js";

const contratacionesUseCase = new ContratacionesUseCase();

/**
 * Hook para gestionar contrataciones de planes
 */
export const useContrataciones = () => {
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [contratacionesPendientes, setContratacionesPendientes] = useState<Contratacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  /**
   * Solicitar contratación de un plan (usuario)
   */
  const solicitarContratacion = async (
    usuarioId: string,
    planId: string,
    notasUsuario?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await contratacionesUseCase.solicitarContratacion(
        usuarioId,
        planId,
        notasUsuario
      );

      if (!result.success) {
        setError(result.error || "Error al solicitar contratación");
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
   * Obtener contrataciones de un usuario
   */
  const obtenerContratacionesUsuario = async (usuarioId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await contratacionesUseCase.obtenerContratacionesUsuario(usuarioId);
      setContrataciones(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener contrataciones pendientes (asesor)
   */
  const obtenerContratacionesPendientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contratacionesUseCase.obtenerContratacionesPendientes();
      setContratacionesPendientes(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener contrataciones asignadas a un asesor
   */
  const obtenerContratacionesAsesor = async (asesorId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await contratacionesUseCase.obtenerContratacionesAsesor(asesorId);
      setContrataciones(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener una contratación específica
   */
  const obtenerContratacion = async (contratacionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await contratacionesUseCase.obtenerContratacion(contratacionId);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aprobar contratación (asesor)
   */
  const aprobarContratacion = async (
    contratacionId: string,
    asesorId: string,
    notasAsesor?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await contratacionesUseCase.aprobarContratacion(
        contratacionId,
        asesorId,
        notasAsesor
      );

      if (!result.success) {
        setError(result.error || "Error al aprobar contratación");
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
   * Rechazar contratación (asesor)
   */
  const rechazarContratacion = async (
    contratacionId: string,
    asesorId: string,
    notasAsesor: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await contratacionesUseCase.rechazarContratacion(
        contratacionId,
        asesorId,
        notasAsesor
      );

      if (!result.success) {
        setError(result.error || "Error al rechazar contratación");
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
   * Cancelar contratación (usuario)
   */
  const cancelarContratacion = async (contratacionId: string, usuarioId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await contratacionesUseCase.cancelarContratacion(
        contratacionId,
        usuarioId
      );

      if (!result.success) {
        setError(result.error || "Error al cancelar contratación");
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
   * Escuchar cambios en contrataciones del usuario (Realtime)
   */
  const escucharContratacionesUsuario = (
    usuarioId: string,
    callback: (payload: any) => void
  ) => {
    const newChannel = contratacionesUseCase.escucharContratacionesUsuario(
      usuarioId,
      callback
    );
    setChannel(newChannel);
    return newChannel;
  };

  /**
   * Escuchar nuevas contrataciones pendientes (asesor)
   */
  const escucharContratacionesPendientes = (callback: (payload: any) => void) => {
    const newChannel = contratacionesUseCase.escucharContratacionesPendientes(callback);
    setChannel(newChannel);
    return newChannel;
  };

  /**
   * Obtener estadísticas de contrataciones (asesor)
   */
  const obtenerEstadisticas = async (asesorId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await contratacionesUseCase.obtenerEstadisticasAsesor(asesorId);
      
      if (!result.success) {
        setError(result.error || "Error al obtener estadísticas");
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
   * Cleanup al desmontar
   */
  useEffect(() => {
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [channel]);

  return {
    contrataciones,
    contratacionesPendientes,
    loading,
    error,
    solicitarContratacion,
    obtenerContratacionesUsuario,
    obtenerContratacionesPendientes,
    obtenerContratacionesAsesor,
    obtenerContratacion,
    aprobarContratacion,
    rechazarContratacion,
    cancelarContratacion,
    escucharContratacionesUsuario,
    escucharContratacionesPendientes,
    obtenerEstadisticas,
  };
};

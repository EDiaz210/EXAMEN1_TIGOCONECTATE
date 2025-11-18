import { useState } from "react";
import { supabase } from "@/src/data/services/supabaseClient";
import { Perfil } from "@/src/domain/models/Perfil";

/**
 * Hook para gestionar perfiles de usuario
 */
export const usePerfil = () => {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener perfil del usuario
   */
  const obtenerPerfil = async (usuarioId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", usuarioId)
        .single();

      if (fetchError) throw fetchError;

      setPerfil(data as Perfil);
      return data as Perfil;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar perfil
   */
  const actualizarPerfil = async (
    usuarioId: string,
    datos: Partial<Omit<Perfil, "id" | "email" | "rol" | "created_at">>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("usuarios")
        .update({ ...datos, updated_at: new Date().toISOString() })
        .eq("id", usuarioId)
        .select()
        .single();

      if (updateError) throw updateError;

      setPerfil(data as Perfil);
      return { success: true, perfil: data as Perfil };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Subir foto de perfil
   */
  const subirFotoPerfil = async (uri: string, usuarioId: string) => {
    try {
      setLoading(true);
      setError(null);

      const base64 = await fetch(uri).then((res) => res.blob());
      const fileExt = uri.split(".").pop();
      const fileName = `${usuarioId}-perfil.${fileExt}`;
      const filePath = `perfiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatares")
        .upload(filePath, base64, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatares")
        .getPublicUrl(filePath);

      // Actualizar URL en perfil
      await actualizarPerfil(usuarioId, { foto_perfil_url: urlData.publicUrl });

      return { success: true, url: urlData.publicUrl };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    perfil,
    loading,
    error,
    obtenerPerfil,
    actualizarPerfil,
    subirFotoPerfil,
  };
};

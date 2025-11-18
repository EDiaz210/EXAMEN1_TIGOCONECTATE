import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/src/data/services/supabaseClient";
import { Receta } from "../../models/Receta";

export class RecipesUseCase {
  async obtenerRecetas(): Promise<Receta[]> {
    const { data, error } = await supabase
      .from("recetas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }
    return data as Receta[];
  }

  async buscarPorIngrediente(ingrediente: string): Promise<Receta[]> {
    const { data, error } = await supabase
      .from("recetas")
      .select("*")
      .contains("ingredientes", [ingrediente.toLowerCase()])
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }
    return data as Receta[];
  }

  async crearReceta(
    titulo: string,
    descripcion: string,
    ingredientes: string[],
    chefId: string,
    imagenUri?: string
  ): Promise<{ success: boolean; receta?: Receta; error?: string }> {
    try {
      let imagenUrl: string | null = null;

      if (imagenUri) {
        imagenUrl = await this.subirImagen(imagenUri);
      }

      const { data, error } = await supabase
        .from("recetas")
        .insert({
          titulo,
          descripcion,
          ingredientes,
          chef_id: chefId,
          imagen_url: imagenUrl,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, receta: data as Receta };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async actualizarReceta(
    id: string,
    titulo: string,
    descripcion: string,
    ingredientes: string[],
    nuevaImagenUri?: string
  ): Promise<{ success: boolean; receta?: Receta; error?: string }> {
    try {
      let imagenUrl: string | null = null;

      if (nuevaImagenUri) {
        imagenUrl = await this.subirImagen(nuevaImagenUri);
      }

      const { data, error } = await supabase
        .from("recetas")
        .update({
          titulo,
          descripcion,
          ingredientes,
          ...(imagenUrl && { imagen_url: imagenUrl }),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, receta: data as Receta };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async eliminarReceta(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("recetas").delete().eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ SOLUCIÓN FINAL: Subir imagen usando FormData correctamente en React Native
   * Usamos el método nativo de React Native para crear FormData con archivos
   */
  private async subirImagen(uri: string): Promise<string> {
    try {
      // PASO 1: Generar nombre único
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

      // PASO 2: Crear FormData con el formato correcto para React Native
      const formData = new FormData();
      
      // ✅ En React Native, FormData acepta objetos con uri, name y type
      // @ts-ignore - TypeScript no reconoce este formato pero funciona en RN
      formData.append('file', {
        uri: uri,
        name: fileName,
        type: 'image/jpeg',
      });

      // PASO 3: Obtener token de sesión
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      // PASO 4: Subir usando fetch directo a la API de Supabase Storage
      const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/recetas-fotos/${fileName}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          // ❌ NO incluir Content-Type, FormData lo maneja automáticamente
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en upload: ${response.status} - ${errorText}`);
      }

      // PASO 5: Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("recetas-fotos").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      throw error;
    }
  }

  async seleccionarImagen(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Necesitamos permisos para acceder a tus fotos");
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) return result.assets[0].uri;
      return null;
    } catch {
      return null;
    }
  }

  async tomarFoto(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Necesitamos permisos de cámara para tomar fotos.");
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) return result.assets[0].uri;
      return null;
    } catch {
      return null;
    }
  }
}
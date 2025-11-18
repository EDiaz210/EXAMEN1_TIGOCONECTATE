import { supabase } from "@/src/data/services/supabaseClient";
import { Usuario } from "../../models/Usuario";

/**
 * AuthUseCase - Caso de Uso de Autenticación
 *
 * Contiene toda la lógica de negocio relacionada con autenticación:
 * - Registro de usuarios (asesor_comercial o usuario_registrado)
 * - Inicio de sesión
 * - Cierre de sesión
 * - Restablecer contraseña
 * - Obtener usuario actual
 * - Escuchar cambios de autenticación
 *
 * Este UseCase es el "cerebro" de la autenticación para Tigo Conecta.
 * Los componentes no hablan directamente con Supabase, sino con este UseCase.
 */

export class AuthUseCase {
  /**
   * Registrar nuevo usuario
   *
   * @param email - Email del usuario
   * @param password - Contraseña (mínimo 6 caracteres)
   * @param rol - Tipo de usuario: "asesor_comercial" o "usuario_registrado"
   * @param nombre - Nombre opcional del usuario
   * @param telefono - Teléfono opcional
   * @returns Objeto con success y datos o error
   */
  async registrar(
    email: string, 
    password: string, 
    rol: "asesor_comercial" | "usuario_registrado",
    nombre?: string,
    telefono?: string
  ) {
    try {
      // PASO 1: Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      // Verificar si hubo error
      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // PASO 2: Guardar información adicional en tabla usuarios
      const { error: upsertError } = await supabase
        .from("usuarios")
        .upsert(
          {
            id: authData.user.id,    // Mismo ID que en Auth
            email: authData.user.email,
            rol: rol,                 // asesor_comercial o usuario_registrado
            nombre: nombre || '',
            telefono: telefono || '',
          },
          {
            onConflict: "id",         // Si el ID ya existe, actualiza
          }
        );

      if (upsertError) throw upsertError;

      return { success: true, user: authData.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Iniciar sesión
   *
   * @param email - Email del usuario
   * @param password - Contraseña
   * @returns Objeto con success y datos o error
   */
  async iniciarSesion(email: string, password: string) {
    try {
      const emailNormalizado = email.toLowerCase().trim();
      
      // OPCIÓN 1: Intentar login normal con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailNormalizado,
        password,
      });

      // Si funciona con Auth, retornar éxito
      if (!error && data.user) {
        return { success: true, user: data.user };
      }

      // OPCIÓN 2: Si falla con Auth, verificar contraseña en tabla usuarios
      const { data: usuarioDB, error: dbError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", emailNormalizado)
        .single();

      if (dbError || !usuarioDB) {
        throw new Error("Usuario o contraseña incorrectos");
      }

      // Verificar si existe contraseña en la tabla
      if (usuarioDB.contrasena && usuarioDB.contrasena === password) {
        // Login exitoso con contraseña de tabla usuarios
        return { 
          success: true, 
          user: { 
            id: usuarioDB.id,
            email: usuarioDB.email 
          } 
        };
      }

      // Si no coincide ninguna contraseña
      throw new Error("Usuario o contraseña incorrectos");
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cerrar sesión
   */
  async cerrarSesion() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Restablecer contraseña
   * Envía un email con enlace para resetear la contraseña
   */
  async restablecerContrasena(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar contraseña
   * Usado después de recibir el enlace de reset
   */
  async actualizarContrasena(nuevaContrasena: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: nuevaContrasena
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener usuario actual con toda su información
   *
   * @returns Usuario completo o null si no hay sesión
   */
  async obtenerUsuarioActual(): Promise<Usuario | null> {
    try {
      // PASO 1: Obtener usuario de Auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      // PASO 2: Obtener información completa de tabla usuarios
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();  // Esperamos un solo resultado

      if (error) throw error;
      
      return data as Usuario;
    } catch {
      return null;
    }
  }

  /**
   * Escuchar cambios de autenticación
   *
   * Esta función permite reaccionar en tiempo real cuando:
   * - Un usuario inicia sesión
   * - Un usuario cierra sesión
   * - El token expira y se refresca
   *
   * @param callback - Función que se ejecuta cuando hay cambios
   * @returns Suscripción que debe limpiarse al desmontar
   */
  onAuthStateChange(callback: (usuario: Usuario | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Hay sesión activa: obtener datos completos
        const usuario = await this.obtenerUsuarioActual();
        callback(usuario);
      } else {
        // No hay sesión: retornar null
        callback(null);
      }
    });
  }
}

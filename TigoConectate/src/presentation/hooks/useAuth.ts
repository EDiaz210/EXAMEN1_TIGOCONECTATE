import { useEffect, useState } from "react";
import { Usuario } from "../../domain/models/Usuario";
import { AuthUseCase } from "../../domain/useCases/auth/AuthUseCase";

// Crear UNA SOLA instancia del UseCase
// Esto es importante para no crear múltiples suscripciones
const authUseCase = new AuthUseCase();

/**
 * useAuth - Hook de Autenticación (Tigo Conecta)
 *
 * Este hook es el puente entre la UI y la lógica de negocio.
 * Maneja el estado de autenticación de forma reactiva.
 *
 * ESTADOS:
 * - usuario: Usuario actual o null
 * - cargando: true mientras verifica sesión inicial
 *
 * MÉTODOS:
 * - registrar: Crear nuevo usuario (asesor_comercial | usuario_registrado)
 * - iniciarSesion: Login
 * - cerrarSesion: Logout
 * - restablecerContrasena: Enviar email de reset
 * - actualizarContrasena: Cambiar contraseña
 *
 * HELPERS:
 * - esAsesor: Boolean para validaciones rápidas
 * - esUsuarioRegistrado: Boolean para validaciones rápidas
 */
export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // AL MONTAR: Verificar si hay sesión activa
    verificarSesion();

    // SUSCRIBIRSE: Escuchar cambios de autenticación
    const { data: subscription } = authUseCase.onAuthStateChange((user) => {
      setUsuario(user);
      setCargando(false);
    });

    // LIMPIAR: Cancelar suscripción al desmontar
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  /**
   * Verificar sesión actual
   */
  const verificarSesion = async () => {
    const user = await authUseCase.obtenerUsuarioActual();
    setUsuario(user);
    setCargando(false);
  };

  /**
   * Registrar nuevo usuario (asesor o usuario registrado)
   */
  const registrar = async (
    email: string,
    password: string,
    rol: "asesor_comercial" | "usuario_registrado",
    nombre?: string,
    telefono?: string
  ) => {
    return await authUseCase.registrar(email, password, rol, nombre, telefono);
  };

  /**
   * Iniciar sesión
   */
  const iniciarSesion = async (email: string, password: string) => {
    return await authUseCase.iniciarSesion(email, password);
  };

  /**
   * Cerrar sesión
   */
  const cerrarSesion = async () => {
    return await authUseCase.cerrarSesion();
  };

  /**
   * Restablecer contraseña (enviar email)
   */
  const restablecerContrasena = async (email: string) => {
    return await authUseCase.restablecerContrasena(email);
  };

  /**
   * Actualizar contraseña
   */
  const actualizarContrasena = async (nuevaContrasena: string) => {
    return await authUseCase.actualizarContrasena(nuevaContrasena);
  };

  // Retornar estado y métodos
  const esAsesor = usuario?.rol === "asesor_comercial";
  const esUsuarioRegistrado = usuario?.rol === "usuario_registrado";
  
  return {
    usuario,
    cargando,
    registrar,
    iniciarSesion,
    cerrarSesion,
    restablecerContrasena,
    actualizarContrasena,
    esAsesor,
    esUsuarioRegistrado,
  };
}

/**
 * Perfil - Modelo de dominio
 * Extiende la información del usuario con datos adicionales
 */

export interface Perfil {
  id: string; // Mismo que usuarios.id
  email: string;
  nombre?: string;
  telefono?: string;
  cedula?: string;
  direccion?: string;
  ciudad?: string;
  foto_perfil_url?: string;
  rol: "asesor_comercial" | "usuario_registrado";
  activo: boolean;
  created_at: string;
  updated_at?: string;
}

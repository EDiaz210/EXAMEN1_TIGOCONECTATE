/**
 * Modelo de Usuario
 * Representa la estructura de datos de un usuario en la aplicación Tigo Conecta
 *
 * Este modelo es independiente de la implementación (Supabase, Firebase, etc.)
 * Define el "contrato" de qué es un usuario en nuestra aplicación
 */

export interface Usuario {
  id: string;              // UUID único del usuario
  email: string;           // Email para login
  nombre?: string;         // Nombre opcional
  rol: "asesor_comercial" | "usuario_registrado"; // Asesor comercial o usuario registrado
  telefono?: string;       // Teléfono de contacto
  direccion?: string;      // Dirección del usuario
  activo: boolean;         // Estado del usuario
  created_at: string;      // Fecha de creación
}

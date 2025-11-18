/**
 * Contratacion - Modelo de dominio
 * Representa la solicitud de contratación de un plan móvil
 */

export interface Contratacion {
  id: string;
  usuario_id: string;
  plan_id: string;
  asesor_id?: string; // Asesor asignado
  estado: "pendiente" | "aprobada" | "rechazada" | "cancelada" | "vencida";
  fecha_solicitud: string;
  fecha_aprobacion?: string;
  fecha_fin?: string; // Fecha de vencimiento del plan
  duracion_minutos?: number; // Duración en minutos (por defecto 10)
  notas_usuario?: string;
  notas_asesor?: string;
  created_at: string;
  updated_at?: string;
  
  // Relaciones (para queries join)
  plan?: {
    nombre: string;
    precio: number;
    datos_gb: string;
    minutos: string | number;
    sms: string | number;
    imagen_url?: string;
    descripcion?: string;
  };
  usuario?: {
    email: string;
    nombre?: string;
    telefono?: string;
  };
  asesor?: {
    email: string;
    nombre?: string;
  };
}

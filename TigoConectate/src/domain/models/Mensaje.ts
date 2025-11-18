/**
 * Mensaje - Modelo de dominio para chat
 * Representa un mensaje en el sistema de chat entre usuario y asesor en Tigo Conecta
 */

export interface Mensaje {
  id: string;
  contenido: string;
  usuario_id: string;
  contratacion_id?: string; // Chat asociado a una contratación específica
  created_at: string;
  // Información del usuario (join)
  usuario?: {
    id: string;
    email: string;
    nombre?: string;
    rol: "asesor_comercial" | "usuario_registrado";
    activo: boolean;
    created_at: string;
  };
}

// ✅ Modelo para eventos de escritura (indicador "escribiendo...")
export interface EventoEscritura {
  usuario_id: string;
  usuario_email: string;
  contratacion_id?: string;
  timestamp: number;
}

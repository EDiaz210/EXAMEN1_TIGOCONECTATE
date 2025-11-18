/**
 * Modelo de Plan de Entrenamiento
 * Representa la asignación de rutinas a un usuario específico
 */

export interface PlanEntrenamiento {
  id: string;              // UUID único
  usuario_id: string;      // ID del usuario asignado
  entrenador_id: string;   // ID del entrenador que lo creó
  rutina_id: string;       // ID de la rutina asignada
  fecha_inicio: string;    // ISO string de fecha de inicio
  fecha_fin?: string;      // ISO string de fecha de fin (opcional)
  dias_semana: string[];   // Array de días ["lunes", "miercoles", "viernes"]
  notas?: string;          // Notas del entrenador
  activo: boolean;         // Si el plan está activo
  created_at: string;      // ISO string de fecha de creación
  
  // Relaciones (joins opcionales)
  usuario?: {
    email: string;
    nombre?: string;
  };
  rutina?: {
    titulo: string;
    descripcion: string;
  };
}

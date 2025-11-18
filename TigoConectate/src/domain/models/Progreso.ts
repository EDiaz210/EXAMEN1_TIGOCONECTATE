/**
 * Modelo de Progreso
 * Registra el progreso de un usuario en su entrenamiento
 */

export interface Progreso {
  id: string;              // UUID único
  usuario_id: string;      // ID del usuario
  plan_id: string;         // ID del plan de entrenamiento
  fecha: string;           // ISO string de fecha del registro
  ejercicio: string;       // Nombre del ejercicio realizado
  series_completadas: number; // Series que completó
  peso_usado?: number;     // Peso utilizado (kg)
  repeticiones_reales: string; // Repeticiones logradas
  notas?: string;          // Notas del usuario
  fotos_progreso?: string[]; // URLs de fotos (storage)
  created_at: string;      // ISO string de fecha de creación
  
  // Relaciones (joins opcionales)
  usuario?: {
    email: string;
    nombre?: string;
  };
}

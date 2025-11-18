/**
 * Modelo de Rutina
 * Representa una rutina de entrenamiento con sus ejercicios
 */

export interface Ejercicio {
  nombre: string;          // Nombre del ejercicio
  series: number;          // Número de series
  repeticiones: string;    // Repeticiones (puede ser rango: "8-12")
  descanso: string;        // Tiempo de descanso (ej: "60s")
  video_url?: string;      // URL del video demostrativo (storage)
  video_path?: string;     // Path del video en storage (para eliminar)
  notas?: string;          // Notas adicionales
}

export interface Rutina {
  id: string;              // UUID único
  titulo: string;          // Nombre de la rutina
  descripcion: string;     // Descripción de la rutina
  ejercicios: Ejercicio[]; // Array de ejercicios (JSON en Supabase)
  entrenador_id: string;   // ID del entrenador que la creó
  created_at: string;      // ISO string de fecha de creación
  updated_at: string;      // ISO string de última actualización
}

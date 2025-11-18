/**
 * PlanMovil - Modelo de dominio
 * Representa un plan móvil ofrecido por Tigo
 */

export interface PlanMovil {
  id: string;
  nombre: string;
  precio: number;
  datos_gb: string; // "5GB", "15GB", "ILIMITADO"
  minutos: string; // "100", "300", "ILIMITADOS"
  sms: string; // "Ilimitados"
  velocidad_4g: string; // "50 Mbps", "100 Mbps", etc.
  velocidad_5g?: string;
  redes_sociales_gratis: string; // "No incluido", "Facebook, Instagram, TikTok", "Todas"
  whatsapp_gratis: boolean;
  llamadas_internacionales: string; // "$0.15/min", "100 min incluidos"
  roaming: string; // "No incluido", "500 MB (Sudamérica)", etc.
  segmento: "basico" | "medio" | "premium";
  descripcion?: string;
  imagen_url?: string;
  imagen_path?: string;
  activo: boolean;
  asesor_id: string;
  created_at: string;
  updated_at?: string;
}

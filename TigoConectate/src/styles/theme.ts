/**
 * Sistema de Diseño - Tokens de Diseño
 * Centraliza colores, espaciados, fuentes y otros valores
 * para mantener consistencia visual en toda la app
 */

// Tema Claro
export const lightColors = {
  // Colores principales - Esquema: Negro, Celeste, Blanco
  primary: "#00BCD4",        // Celeste - botones principales
  primaryLight: "#B2EBF2",   // Celeste claro - fondos
  primaryDark: "#0097A7",    // Celeste oscuro
  secondary: "#1A1A1A",      // Negro - acciones secundarias
  danger: "#f44336",         // Rojo - eliminar
  warning: "#FF9800",        // Naranja - alertas

  // Neutros
  background: "#F5F5F5",     // Fondo gris muy claro
  white: "#FFFFFF",
  black: "#000000",
  darkGray: "#1A1A1A",       // Negro suave

  // Textos
  textPrimary: "#000000",    // Texto principal - Negro
  textSecondary: "#666666",  // Texto secundario - Gris
  textTertiary: "#999999",   // Texto deshabilitado

  // Bordes
  border: "#E0E0E0",
  borderLight: "#F0F0F0",

  // Estados
  success: "#4CAF50",
  error: "#f44336",
  info: "#00BCD4",           // Celeste para información
};

// Tema Oscuro
export const darkColors = {
  // Colores principales - Esquema: Negro, Celeste, Blanco
  primary: "#00BCD4",        // Celeste - botones principales
  primaryLight: "#004D5A",   // Celeste oscuro para fondos
  primaryDark: "#0097A7",    // Celeste oscuro
  secondary: "#E0E0E0",      // Gris claro - acciones secundarias
  danger: "#f44336",         // Rojo - eliminar
  warning: "#FF9800",        // Naranja - alertas

  // Neutros
  background: "#121212",     // Fondo negro
  white: "#1E1E1E",          // "Blanco" oscuro (gris muy oscuro)
  black: "#FFFFFF",          // "Negro" claro (blanco)
  darkGray: "#2C2C2C",       // Gris oscuro

  // Textos
  textPrimary: "#FFFFFF",    // Texto principal - Blanco
  textSecondary: "#B0B0B0",  // Texto secundario - Gris claro
  textTertiary: "#808080",   // Texto deshabilitado

  // Bordes
  border: "#2C2C2C",
  borderLight: "#1E1E1E",

  // Estados
  success: "#4CAF50",
  error: "#f44336",
  info: "#00BCD4",           // Celeste para información
};

// Por defecto exportar tema claro
export const colors = lightColors;

export const spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
  xxl: 40,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 28,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 20,
  round: 50,
};

export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,  // Android
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,  // Android
  },
};

import { Tabs } from "expo-router";
import React from "react";
import { MessageCircle, ShoppingBag, FileText, User } from "lucide-react-native";
import { HapticTab } from "@/components/haptic-tab";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useTheme } from "@/src/contexts/ThemeContext";
import { lightColors } from "@/src/styles/theme";

export default function TabLayout() {
  const { colors: themeColors } = useTheme();
  const { usuario, esAsesor, cargando } = useAuth();
  
  // Si no hay usuario (modo invitado), forzar tema claro
  const colors = usuario ? themeColors : lightColors;

  // Esperar a que termine de cargar antes de decidir qué tabs mostrar
  if (cargando) {
    return null; // O un loading spinner
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
        },
      }}
    >
      {/* CATÁLOGO - Todos pueden verlo */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Catálogo",
          tabBarIcon: ({ color }) => (
            <ShoppingBag size={24} color={color} />
          ),
        }}
      />
      
      {/* EXPLORE - Oculto (navegación directa) */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      
      {/* PROGRESO/PENDIENTES - Solo autenticados */}
      <Tabs.Screen
        name="progreso"
        options={{
          title: esAsesor ? "Pendientes" : "Mis Planes",
          tabBarIcon: ({ color }) => (
            <FileText size={24} color={color} />
          ),
          href: usuario ? undefined : null,
        }}
      />
      
      {/* CHAT - Visible para usuarios registrados Y asesores */}
      <Tabs.Screen
        name="chat"
        options={{
          title: esAsesor ? "Mensajes" : "Chat",
          tabBarIcon: ({ color }) => (
            <MessageCircle size={24} color={color} />
          ),
          href: usuario ? undefined : null,
        }}
      />
      
      {/* PERFIL - Todos pueden verlo (usuarios autenticados y no autenticados) */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <User size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}


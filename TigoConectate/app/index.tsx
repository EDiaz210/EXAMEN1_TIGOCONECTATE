import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/contexts/ThemeContext";

/**
 * Pantalla de Bienvenida - Primera pantalla al abrir la app
 */
export default function WelcomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    header: {
      height: "45%",
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    logoContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
      overflow: "hidden",
    },
    logo: {
      width: 100,
      height: 100,
    },
    titulo: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: 10,
      textAlign: "center",
    },
    subtitulo: {
      fontSize: 18,
      color: "#FFFFFF",
      opacity: 0.9,
      textAlign: "center",
    },
    contenidoBlanco: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      paddingHorizontal: 30,
      paddingTop: 50,
      justifyContent: "flex-start",
    },
    boton: {
      height: 55,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 15,
    },
    botonPrimario: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
    },
    botonSecundario: {
      backgroundColor: "#FFFFFF",
      borderWidth: 2,
      borderColor: colors.primary,
    },
    textoBotonPrimario: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    textoBotonSecundario: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Encabezado con color Tigo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require("../assets/images/iconoTigo.png")} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.titulo}>Bienvenido a Tigo</Text>
        <Text style={styles.subtitulo}>Descubre nuestros planes</Text>
      </View>

      {/* Área de botones */}
      <View style={styles.contenidoBlanco}>
        <TouchableOpacity
          style={[styles.boton, styles.botonPrimario]}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.textoBotonPrimario}>Explorar como Invitado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, styles.botonSecundario]}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.textoBotonSecundario}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, styles.botonSecundario]}
          onPress={() => router.push("/auth/registro")}
        >
          <Text style={styles.textoBotonSecundario}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

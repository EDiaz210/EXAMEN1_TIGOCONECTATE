import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { globalStyles } from "../../src/styles/globalStyles";
import { fontSize, spacing } from "../../src/styles/theme";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function LoginScreen() {
  const { colors } = useTheme();
  // ESTADO LOCAL
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  // HOOKS
  const { iniciarSesion } = useAuth();
  const router = useRouter();

  /**
   * Manejar inicio de sesión
   */
  const handleLogin = async () => {
    // VALIDACIÓN: Campos vacíos
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    // INICIO DE SESIÓN
    setCargando(true);
    const resultado = await iniciarSesion(email, password);
    setCargando(false);

    // MANEJO DE RESULTADO
    if (resultado.success) {
      // Éxito: Redirigir a tabs
      // replace() para que no pueda volver con botón atrás
      router.replace("/(tabs)");
    } else {
      // Error: Mostrar mensaje
      Alert.alert("Error", resultado.error || "No se pudo iniciar sesión");
    }
  };

  const styles = StyleSheet.create({
    titulo: {
      fontSize: fontSize.xxxl,
      fontWeight: "bold" as const,
      textAlign: "center" as const,
      marginBottom: spacing.sm,
      marginTop: spacing.xxl * 2,
      color: "#000000",
    },
    subtitulo: {
      fontSize: fontSize.md,
      textAlign: "center" as const,
      marginBottom: spacing.xl,
      color: colors.textSecondary,
    },
    botonLogin: {
      marginTop: spacing.sm,
    },
    linkOlvide: {
      textAlign: "center" as const,
      marginTop: spacing.lg,
      color: colors.primary,
      fontSize: fontSize.sm,
      textDecorationLine: "underline" as const,
    },
  });

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.contentPadding}>
        <Text style={styles.titulo}>Tigo Conecta</Text>
        <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>

        <TextInput
          style={globalStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"        // No capitalizar
          keyboardType="email-address" // Teclado de email
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry // Ocultar texto
        />

        <TouchableOpacity
          style={[
            globalStyles.button,
            globalStyles.buttonPrimary,
            styles.botonLogin,
          ]}
          onPress={handleLogin}
          disabled={cargando} // Deshabilitar mientras carga
        >
          {cargando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/olvide-contrasena")}>
          <Text style={styles.linkOlvide}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
import { supabase } from "../../src/data/services/supabaseClient";
import { globalStyles } from "../../src/styles/globalStyles";
import { fontSize, spacing } from "../../src/styles/theme";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function OlvideContrasenaScreen() {
  const { colors } = useTheme();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleEnviarEmail = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico");
      return;
    }

    try {
      setCargando(true);

      // Verificar que el usuario existe
      const { data: usuario, error: buscarError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (buscarError || !usuario) {
        Alert.alert("Error", "No se encontró ninguna cuenta con ese correo");
        return;
      }

      // Enviar email de recuperación
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim()
      );

      if (error) throw error;

      // Pasar al paso 2
      setPaso(2);
      Alert.alert(
        "📧 Email Enviado",
        "Revisa tu correo y luego ingresa tu nueva contraseña aquí"
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo enviar el correo de recuperación"
      );
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarContrasena = async () => {
    if (!nuevaContrasena || !confirmarContrasena) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (nuevaContrasena.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      setCargando(true);

      // Actualizar contraseña en la tabla usuarios
      const { error } = await supabase
        .from("usuarios")
        .update({ contrasena: nuevaContrasena })
        .eq("email", email.toLowerCase().trim());

      if (error) throw error;

      Alert.alert(
        "Contraseña Actualizada",
        "Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión.",
        [
          {
            text: "Iniciar Sesión",
            onPress: () => router.push("/auth/login"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo cambiar la contraseña"
      );
    } finally {
      setCargando(false);
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
      paddingHorizontal: spacing.sm,
    },
    botonEnviar: {
      marginTop: spacing.sm,
    },
    botonVolver: {
      marginTop: spacing.lg,
      padding: spacing.sm,
    },
    textoVolver: {
      textAlign: "center" as const,
      color: colors.primary,
      fontSize: fontSize.sm,
    },
    emailInfo: {
      backgroundColor: "#E3F2FD",
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    emailInfoTexto: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: "center" as const,
    },
  });

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.contentPadding}>
        <Text style={styles.titulo}>🔒 Recuperar Contraseña</Text>
        <Text style={styles.subtitulo}>
          {paso === 1
            ? "Ingresa tu correo electrónico"
            : "Ahora ingresa tu nueva contraseña"}
        </Text>

        {paso === 1 ? (
          // PASO 1: Ingresar email
          <>
            <TextInput
              style={globalStyles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!cargando}
            />

            <TouchableOpacity
              style={[
                globalStyles.button,
                globalStyles.buttonPrimary,
                styles.botonEnviar,
              ]}
              onPress={handleEnviarEmail}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={globalStyles.buttonText}>Enviar Email</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          // PASO 2: Ingresar nueva contraseña
          <>
            <View style={styles.emailInfo}>
              <Text style={styles.emailInfoTexto}>
                📧 Email enviado a: {email}
              </Text>
            </View>

            <TextInput
              style={globalStyles.input}
              placeholder="Nueva contraseña (min. 6 caracteres)"
              value={nuevaContrasena}
              onChangeText={setNuevaContrasena}
              secureTextEntry
              editable={!cargando}
            />

            <TextInput
              style={globalStyles.input}
              placeholder="Confirmar contraseña"
              value={confirmarContrasena}
              onChangeText={setConfirmarContrasena}
              secureTextEntry
              editable={!cargando}
            />

            <TouchableOpacity
              style={[
                globalStyles.button,
                globalStyles.buttonPrimary,
                styles.botonEnviar,
              ]}
              onPress={handleCambiarContrasena}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={globalStyles.buttonText}>Cambiar Contraseña</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonVolver}
              onPress={() => setPaso(1)}
              disabled={cargando}
            >
              <Text style={styles.textoVolver}>← Volver a enviar email</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => router.back()}
          disabled={cargando}
        >
          <Text style={styles.textoVolver}>← Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

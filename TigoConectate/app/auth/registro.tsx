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
import {
  borderRadius,
  fontSize,
  spacing,
} from "../../src/styles/theme";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function RegistroScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargando, setCargando] = useState(false);
  const { registrar } = useAuth();
  const router = useRouter();

  const handleRegistro = async () => {
    // VALIDACIÓN 1: Campos vacíos
    if (!email || !password || !nombre) {
      Alert.alert("Error", "Email, contraseña y nombre son obligatorios");
      return;
    }

    // VALIDACIÓN 2: Longitud de contraseña
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // REGISTRO - Siempre como usuario_registrado
    setCargando(true);
    const resultado = await registrar(email, password, "usuario_registrado", nombre, telefono || undefined);
    setCargando(false);

    if (resultado.success) {
      // Éxito: Redirigir a login
      Alert.alert("Éxito", "Cuenta creada correctamente", [
        { text: "OK", onPress: () => router.replace("/auth/login") },
      ]);
    } else {
      Alert.alert("Error", resultado.error || "No se pudo crear la cuenta");
    }
  };

  const styles = StyleSheet.create({
    espacioBarra: {
      height: 50,
    },
    infoContainer: {
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginVertical: spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    infoTexto: {
      fontSize: fontSize.sm,
      color: colors.textPrimary,
      lineHeight: 20,
    },
    linkVolver: {
      textAlign: "center" as const,
      marginTop: spacing.lg,
      color: colors.primary,
      fontSize: fontSize.sm,
    },
  });

  return (
    <View style={globalStyles.container}>
      <View style={styles.espacioBarra} />
      <View style={globalStyles.contentPadding}>
        <Text style={globalStyles.title}>Registro Tigo Conecta</Text>

        <TextInput
          style={globalStyles.input}
          placeholder="Nombre completo *"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Email *"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Teléfono (opcional)"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Contraseña (mínimo 6 caracteres) *"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Información sobre registro */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTexto}>
            Registrándote como usuario podrás solicitar planes móviles y recibir atención personalizada.
          </Text>
        </View>

        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary]}
          onPress={handleRegistro}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkVolver}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

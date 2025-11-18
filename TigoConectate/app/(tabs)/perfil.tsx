import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { usePerfil } from "@/src/presentation/hooks/usePerfil";
import { useTheme } from "@/src/contexts/ThemeContext";
import { fontSize, spacing, borderRadius } from "@/src/styles/theme";

export default function PerfilScreen() {
  const router = useRouter();
  const { usuario, cerrarSesion } = useAuth();
  const { actualizarPerfil, loading } = usePerfil();
  const { colors, themeMode, toggleTheme } = useTheme();

  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setTelefono(usuario.telefono || "");
      setDireccion(usuario.direccion || "");
    }
  }, [usuario]);

  const handleGuardarCambios = async () => {
    if (!usuario?.id) return;

    const resultado = await actualizarPerfil(usuario.id, {
      nombre,
      telefono,
      direccion,
    });

    if (resultado.success) {
      Alert.alert("Éxito", "Perfil actualizado correctamente");
      setEditando(false);
    } else {
      Alert.alert("Error", resultado.error || "No se pudo actualizar el perfil");
    }
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            await cerrarSesion();
            router.replace("/");
          },
        },
      ]
    );
  };

  // Crear estilos dinámicos con los colores del tema
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    espacioBarra: {
      height: 50,
    },
    centrado: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: spacing.xl,
    },
    textoError: {
      fontSize: fontSize.lg,
      color: colors.textSecondary,
      marginBottom: spacing.xl,
      textAlign: "center" as const,
    },
    headerContainer: {
      alignItems: "center" as const,
      paddingVertical: spacing.xl,
      backgroundColor: colors.white,
      marginBottom: spacing.md,
    },
    avatarGrande: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginBottom: spacing.md,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    avatarTexto: {
      fontSize: 48,
      fontWeight: "bold" as const,
      color: colors.white,
    },
    nombreUsuario: {
      fontSize: fontSize.xl,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
      marginTop: spacing.sm,
    },
    badgeContainer: {
      marginTop: spacing.sm,
    },
    badge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.round,
      fontWeight: "600" as const,
      fontSize: fontSize.sm,
    },
    badgeAsesor: {
      backgroundColor: colors.primary,
      color: colors.white,
    },
    badgeUsuario: {
      backgroundColor: colors.background,
      color: colors.textPrimary,
    },
    seccion: {
      backgroundColor: colors.white,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    tituloSeccion: {
      fontSize: fontSize.lg,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    campo: {
      marginBottom: spacing.lg,
    },
    labelCampo: {
      fontSize: fontSize.sm,
      fontWeight: "600" as const,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    inputDeshabilitado: {
      backgroundColor: colors.background,
      padding: spacing.md,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: borderRadius.md,
    },
    textoInputDeshabilitado: {
      fontSize: fontSize.md,
      color: colors.textPrimary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: fontSize.md,
      backgroundColor: colors.white,
      color: colors.textPrimary,
    },
    inputMultilinea: {
      minHeight: 80,
      textAlignVertical: "top" as const,
    },
    seccionBotones: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    boton: {
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: "center" as const,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    botonPrimario: {
      backgroundColor: colors.primary,
    },
    textoBotonPrimario: {
      color: "#FFFFFF",
      fontSize: fontSize.md,
      fontWeight: "600" as const,
    },
    botonEditar: {
      backgroundColor: colors.primary,
    },
    botonGuardar: {
      backgroundColor: colors.success,
    },
    botonCancelar: {
      backgroundColor: colors.white,
      borderWidth: 2,
      borderColor: colors.border,
    },
    botonCerrarSesion: {
      backgroundColor: colors.secondary,
    },
    botonTema: {
      backgroundColor: colors.primary,
      flexDirection: "row" as const,
      gap: spacing.xs,
    },
    textoBoton: {
      color: colors.white,
      fontSize: fontSize.md,
      fontWeight: "600" as const,
    },
    textoBotonSecundario: {
      color: colors.textPrimary,
      fontSize: fontSize.md,
      fontWeight: "600" as const,
    },
    espacioInferior: {
      height: spacing.xxl,
    },
  });

  if (!usuario) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.textoError}>No has iniciado sesión</Text>
        <TouchableOpacity
          style={styles.botonPrimario}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.textoBotonPrimario}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const inicial = (usuario.nombre || usuario.email || "U")[0].toUpperCase();
  const esAsesor = usuario.rol === "asesor_comercial";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.espacioBarra} />

      {/* Header con avatar */}
      <View style={styles.headerContainer}>
        <View style={styles.avatarGrande}>
          <Text style={styles.avatarTexto}>{inicial}</Text>
        </View>
        <Text style={styles.nombreUsuario}>{usuario.nombre || usuario.email}</Text>
        <View style={styles.badgeContainer}>
          <Text style={[styles.badge, esAsesor ? styles.badgeAsesor : styles.badgeUsuario]}>
            {esAsesor ? "Asesor Comercial" : "Usuario"}
          </Text>
        </View>
      </View>

      {/* Información del perfil */}
      <View style={styles.seccion}>
        <Text style={styles.tituloSeccion}>Información Personal</Text>

        <View style={styles.campo}>
          <Text style={styles.labelCampo}>Email</Text>
          <View style={styles.inputDeshabilitado}>
            <Text style={styles.textoInputDeshabilitado}>{usuario.email}</Text>
          </View>
        </View>

        <View style={styles.campo}>
          <Text style={styles.labelCampo}>Nombre Completo</Text>
          {editando ? (
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ingresa tu nombre completo"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <View style={styles.inputDeshabilitado}>
              <Text style={styles.textoInputDeshabilitado}>
                {nombre || "No especificado"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.campo}>
          <Text style={styles.labelCampo}>Teléfono</Text>
          {editando ? (
            <TextInput
              style={styles.input}
              value={telefono}
              onChangeText={setTelefono}
              placeholder="Ingresa tu teléfono"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          ) : (
            <View style={styles.inputDeshabilitado}>
              <Text style={styles.textoInputDeshabilitado}>
                {telefono || "No especificado"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.campo}>
          <Text style={styles.labelCampo}>Dirección</Text>
          {editando ? (
            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Ingresa tu dirección"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
            />
          ) : (
            <View style={styles.inputDeshabilitado}>
              <Text style={styles.textoInputDeshabilitado}>
                {direccion || "No especificado"}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.seccionBotones}>
        {editando ? (
          <>
            <TouchableOpacity
              style={[styles.boton, styles.botonGuardar]}
              onPress={handleGuardarCambios}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.textoBoton}>💾 Guardar Cambios</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.boton, styles.botonCancelar]}
              onPress={() => {
                setEditando(false);
                setNombre(usuario.nombre || "");
                setTelefono(usuario.telefono || "");
                setDireccion(usuario.direccion || "");
              }}
            >
              <Text style={styles.textoBotonSecundario}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.boton, styles.botonEditar]}
              onPress={() => setEditando(true)}
            >
              <Text style={styles.textoBoton}>Editar Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.boton, styles.botonCerrarSesion]}
              onPress={handleCerrarSesion}
            >
              <Text style={styles.textoBoton}>Cerrar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.boton, styles.botonTema]}
              onPress={toggleTheme}
            >
              <Text style={styles.textoBoton}>
                {themeMode === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.espacioInferior} />
    </ScrollView>
  );
}

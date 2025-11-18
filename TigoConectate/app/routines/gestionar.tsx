import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContrataciones } from "@/src/presentation/hooks/useContrataciones";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { Contratacion } from "@/src/domain/models/Contratacion";
import { globalStyles } from "@/src/styles/globalStyles";
import { fontSize, spacing, borderRadius } from "@/src/styles/theme";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function GestionarContratacionScreen() {
  const { colors } = useTheme();
  const { contratacionId } = useLocalSearchParams<{ contratacionId?: string }>();
  const router = useRouter();
  const { usuario } = useAuth();
  const {
    obtenerContratacion,
    aprobarContratacion,
    rechazarContratacion,
    loading,
  } = useContrataciones();

  const [contratacion, setContratacion] = useState<Contratacion | null>(null);
  const [notasAsesor, setNotasAsesor] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (contratacionId) {
      cargarContratacion();
    }
  }, [contratacionId]);

  const cargarContratacion = async () => {
    if (!contratacionId) return;
    const data = await obtenerContratacion(contratacionId);
    if (data) {
      setContratacion(data);
      setNotasAsesor(data.notas_asesor || "");
    }
  };

  const handleAprobar = async () => {
    if (!contratacionId || !usuario) return;

    Alert.alert(
      "Aprobar Contratación",
      "¿Estás seguro de aprobar esta contratación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprobar",
          style: "default",
          onPress: async () => {
            setProcesando(true);
            const resultado = await aprobarContratacion(
              contratacionId,
              usuario.id,
              notasAsesor || undefined
            );
            setProcesando(false);

            if (resultado.success) {
              Alert.alert("Éxito", "Contratación aprobada correctamente", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } else {
              Alert.alert("Error", resultado.error || "No se pudo aprobar la contratación");
            }
          },
        },
      ]
    );
  };

  const handleRechazar = async () => {
    if (!contratacionId || !usuario) return;

    if (!notasAsesor.trim()) {
      Alert.alert(
        "Motivo requerido",
        "Debes proporcionar un motivo para rechazar la contratación"
      );
      return;
    }

    Alert.alert(
      "Rechazar Contratación",
      "¿Estás seguro de rechazar esta contratación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Rechazar",
          style: "destructive",
          onPress: async () => {
            setProcesando(true);
            const resultado = await rechazarContratacion(
              contratacionId,
              usuario.id,
              notasAsesor
            );
            setProcesando(false);

            if (resultado.success) {
              Alert.alert("Contratación rechazada", "Se ha notificado al cliente", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } else {
              Alert.alert("Error", resultado.error || "No se pudo rechazar la contratación");
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    centrado: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: spacing.lg,
    },
    textoError: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      textAlign: "center" as const,
      marginBottom: spacing.xl,
    },
    textoCargando: {
      marginTop: spacing.md,
      fontSize: fontSize.md,
      color: colors.textSecondary,
    },
    header: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      paddingHorizontal: spacing.lg,
      paddingTop: 60,
      paddingBottom: spacing.md,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    botonCerrar: {
      width: 40,
      height: 40,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    textoCerrar: {
      fontSize: 28,
      color: colors.textSecondary,
      fontWeight: "300" as const,
    },
    tituloHeader: {
      fontSize: fontSize.xl,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
    },
    contenido: {
      flex: 1,
    },
    contenidoPadding: {
      padding: spacing.md,
    },
    seccionTitulo: {
      fontSize: fontSize.md,
      fontWeight: "600" as const,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    nombrePlan: {
      fontSize: fontSize.xl,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    precio: {
      fontSize: fontSize.xxl,
      fontWeight: "bold" as const,
      color: colors.primary,
      marginBottom: spacing.md,
    },
    caracteristicas: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      marginTop: spacing.sm,
    },
    caracteristicaItem: {
      flex: 1,
      alignItems: "center" as const,
    },
    caracteristicaLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginBottom: spacing.xs / 2,
    },
    caracteristicaValor: {
      fontSize: fontSize.md,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
    },
    infoCliente: {
      gap: spacing.sm,
    },
    infoRow: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      paddingVertical: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontWeight: "600" as const,
    },
    infoValor: {
      fontSize: fontSize.sm,
      color: colors.textPrimary,
      flex: 1,
      textAlign: "right" as const,
      marginLeft: spacing.md,
    },
    notasUsuario: {
      fontSize: fontSize.sm,
      color: colors.textPrimary,
      lineHeight: 22,
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
    },
    notasAyuda: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    textArea: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: fontSize.sm,
      color: colors.textPrimary,
      minHeight: 100,
      textAlignVertical: "top" as const,
    },
    contador: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      textAlign: "right" as const,
      marginTop: spacing.xs,
    },
    botonesContainer: {
      flexDirection: "row" as const,
      gap: spacing.md,
      marginTop: spacing.lg,
      marginBottom: spacing.xxl,
    },
    botonRechazar: {
      flex: 1,
      backgroundColor: colors.danger,
    },
    botonAprobar: {
      flex: 1,
    },
    estadoFinalContainer: {
      alignItems: "center" as const,
      marginVertical: spacing.xl,
    },
    estadoBadge: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.sm,
    },
    estadoTexto: {
      fontSize: fontSize.lg,
      fontWeight: "bold" as const,
    },
    fechaEstado: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
  });

  if (!usuario || usuario.rol !== "asesor_comercial") {
    return (
      <View style={[globalStyles.container, styles.centrado]}>
        <Text style={styles.textoError}>
          Solo los asesores pueden acceder a esta pantalla
        </Text>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary]}
          onPress={() => router.back()}
        >
          <Text style={globalStyles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading || !contratacion) {
    return (
      <View style={[globalStyles.container, styles.centrado]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.textoCargando}>Cargando contratación...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botonCerrar}>
          <Text style={styles.textoCerrar}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Gestionar Contratación</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.contenido} contentContainerStyle={styles.contenidoPadding}>
        {/* Información del Plan */}
        <View style={globalStyles.card}>
          <Text style={styles.seccionTitulo}>📱 Plan Solicitado</Text>
          <Text style={styles.nombrePlan}>{contratacion.plan?.nombre}</Text>
          <Text style={styles.precio}>${contratacion.plan?.precio.toFixed(2)}/mes</Text>
          
          <View style={styles.caracteristicas}>
            <View style={styles.caracteristicaItem}>
              <Text style={styles.caracteristicaLabel}>Datos:</Text>
              <Text style={styles.caracteristicaValor}>{contratacion.plan?.datos_gb}</Text>
            </View>
            <View style={styles.caracteristicaItem}>
              <Text style={styles.caracteristicaLabel}>Minutos:</Text>
              <Text style={styles.caracteristicaValor}>
                {contratacion.plan?.minutos === "ILIMITADO" ? "∞" : contratacion.plan?.minutos}
              </Text>
            </View>
            <View style={styles.caracteristicaItem}>
              <Text style={styles.caracteristicaLabel}>SMS:</Text>
              <Text style={styles.caracteristicaValor}>
                {contratacion.plan?.sms === "ILIMITADO" ? "∞" : contratacion.plan?.sms}
              </Text>
            </View>
          </View>
        </View>

        {/* Información del Cliente */}
        <View style={globalStyles.card}>
          <Text style={styles.seccionTitulo}>👤 Información del Cliente</Text>
          <View style={styles.infoCliente}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValor}>
                {contratacion.usuario?.nombre || "No proporcionado"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValor}>{contratacion.usuario?.email}</Text>
            </View>
            {contratacion.usuario?.telefono && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teléfono:</Text>
                <Text style={styles.infoValor}>{contratacion.usuario.telefono}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha solicitud:</Text>
              <Text style={styles.infoValor}>
                {new Date(contratacion.fecha_solicitud).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Notas del Cliente */}
        {contratacion.notas_usuario && (
          <View style={globalStyles.card}>
            <Text style={styles.seccionTitulo}>💬 Comentarios del Cliente</Text>
            <Text style={styles.notasUsuario}>{contratacion.notas_usuario}</Text>
          </View>
        )}

        {/* Notas del Asesor */}
        <View style={globalStyles.card}>
          <Text style={styles.seccionTitulo}>📝 Notas del Asesor</Text>
          <Text style={styles.notasAyuda}>
            {contratacion.estado === "pendiente"
              ? "Agrega notas para el cliente (opcional para aprobar, requerido para rechazar)"
              : "Notas registradas:"}
          </Text>
          <TextInput
            style={styles.textArea}
            value={notasAsesor}
            onChangeText={setNotasAsesor}
            placeholder="Ejemplo: Se aprueba la contratación. El plan será activado en 24-48 horas."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            maxLength={500}
            editable={contratacion.estado === "pendiente"}
          />
          <Text style={styles.contador}>{notasAsesor.length}/500</Text>
        </View>

        {/* Botones de Acción */}
        {contratacion.estado === "pendiente" && (
          <View style={styles.botonesContainer}>
            <TouchableOpacity
              style={[globalStyles.button, styles.botonRechazar]}
              onPress={handleRechazar}
              disabled={procesando}
            >
              {procesando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={globalStyles.buttonText}>✗ Rechazar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonPrimary, styles.botonAprobar]}
              onPress={handleAprobar}
              disabled={procesando}
            >
              {procesando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={globalStyles.buttonText}>✓ Aprobar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {contratacion.estado !== "pendiente" && (
          <View style={styles.estadoFinalContainer}>
            <View
              style={[
                styles.estadoBadge,
                {
                  backgroundColor:
                    contratacion.estado === "aprobada"
                      ? colors.success + "20"
                      : colors.danger + "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.estadoTexto,
                  {
                    color:
                      contratacion.estado === "aprobada"
                        ? colors.success
                        : colors.danger,
                  },
                ]}
              >
                {contratacion.estado === "aprobada"
                  ? "✓ Contratación Aprobada"
                  : "✗ Contratación Rechazada"}
              </Text>
            </View>
            {contratacion.fecha_aprobacion && (
              <Text style={styles.fechaEstado}>
                {new Date(contratacion.fecha_aprobacion).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

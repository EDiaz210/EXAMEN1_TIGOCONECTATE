import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { usePlanes } from "../../src/presentation/hooks/usePlanes";
import { useContrataciones } from "../../src/presentation/hooks/useContrataciones";
import { globalStyles } from "../../src/styles/globalStyles";
import { fontSize, spacing, borderRadius } from "../../src/styles/theme";
import { PlanMovil } from "../../src/domain/models/PlanMovil";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function DetallePlanScreen() {
  const { colors } = useTheme();
  const { usuario } = useAuth();
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const { obtenerPlanPorId, loading: loadingPlan } = usePlanes();
  const { 
    solicitarContratacion, 
    obtenerContratacionesUsuario,
    loading: loadingContratacion 
  } = useContrataciones();
  const router = useRouter();

  const [plan, setPlan] = useState<PlanMovil | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [notasUsuario, setNotasUsuario] = useState("");
  const [tienePlanActivo, setTienePlanActivo] = useState(false);

  useEffect(() => {
    if (planId) {
      cargarPlan();
    }
  }, [planId]);

  useEffect(() => {
    if (usuario) {
      verificarPlanActivo();
    }
  }, [usuario]);

  const cargarPlan = async () => {
    if (!planId) return;
    const planData = await obtenerPlanPorId(planId);
    if (planData) {
      setPlan(planData);
    }
  };

  const verificarPlanActivo = async () => {
    if (!usuario) return;
    const contrataciones = await obtenerContratacionesUsuario(usuario.id);
    // Verificar si tiene algún plan aprobado (activo)
    const tieneActivo = contrataciones.some(c => c.estado === "aprobada");
    setTienePlanActivo(tieneActivo);
  };

  const handleContratar = () => {
    if (!usuario) {
      Alert.alert(
        "Iniciar Sesión",
        "Debes iniciar sesión para contratar un plan",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar Sesión", onPress: () => router.push("/auth/login") },
        ]
      );
      return;
    }

    // NUEVA VALIDACIÓN: Verificar si ya tiene plan activo
    if (tienePlanActivo) {
      Alert.alert(
        "Plan Activo",
        "Ya tienes un plan activo. Debes esperar a que finalice tu plan actual para poder contratar uno nuevo.",
        [
          { 
            text: "Ver Mi Plan", 
            onPress: () => router.push("/(tabs)/progreso") 
          },
          { text: "OK" },
        ]
      );
      return;
    }

    setMostrarFormulario(true);
  };

  const handleConfirmarContratacion = async () => {
    if (!usuario || !plan) return;

    const resultado = await solicitarContratacion(
      usuario.id,
      plan.id,
      notasUsuario || undefined
    );

    if (resultado.success) {
      Alert.alert(
        "¡Solicitud Enviada!",
        "Tu solicitud de contratación ha sido enviada. Un asesor la revisará pronto.",
        [
          {
            text: "Ver Mis Contrataciones",
            onPress: () => router.push("/(tabs)/progreso"),
          },
          { text: "OK" },
        ]
      );
      setMostrarFormulario(false);
      setNotasUsuario("");
    } else {
      Alert.alert("Error", resultado.error || "No se pudo enviar la solicitud");
    }
  };

  const getColorSegmento = (segmento: string) => {
    switch (segmento) {
      case "basico":
        return "#4CAF50";
      case "medio":
        return "#FF9800";
      case "premium":
        return "#9C27B0";
      default:
        return colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    containerConPadding: {
      paddingTop: 60,
      paddingHorizontal: spacing.md,
    },
    centerContent: {
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    emptyContainer: {
      alignItems: "center" as const,
      marginTop: spacing.xxl,
    },
    emptyEmoji: {
      fontSize: 80,
      marginBottom: spacing.lg,
    },
    emptyText: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      textAlign: "center" as const,
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    imagenGrande: {
      width: "100%",
      height: 300,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
    },
    imagenPlaceholder: {
      backgroundColor: colors.background,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    placeholderText: {
      fontSize: 100,
    },
    badgeSegmento: {
      position: "absolute" as const,
      top: 70,
      right: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    textoSegmento: {
      color: colors.white,
      fontSize: fontSize.sm,
      fontWeight: "bold" as const,
    },
    contenidoPrincipal: {
      marginTop: spacing.md,
    },
    nombrePlan: {
      fontSize: fontSize.xxl,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    precioPlan: {
      fontSize: fontSize.xxxl,
      fontWeight: "bold" as const,
      color: colors.primary,
      marginBottom: spacing.lg,
    },
    descripcion: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      marginBottom: spacing.xl,
      lineHeight: 24,
    },
    seccion: {
      marginBottom: spacing.xl,
    },
    tituloSeccion: {
      fontSize: fontSize.lg,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    caracteristicasGrid: {
      flexDirection: "row" as const,
      justifyContent: "space-around" as const,
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
    },
    caracteristicaItem: {
      alignItems: "center" as const,
    },
    iconoCaract: {
      fontSize: fontSize.xxxl,
      marginBottom: spacing.xs,
    },
    labelCaract: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginBottom: spacing.xs / 2,
    },
    valorCaract: {
      fontSize: fontSize.lg,
      fontWeight: "bold" as const,
      color: colors.primary,
    },
    infoItem: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      fontWeight: "500" as const,
    },
    infoValor: {
      fontSize: fontSize.md,
      color: colors.textPrimary,
      fontWeight: "600" as const,
    },
    beneficiosList: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    beneficioItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingVertical: spacing.sm,
    },
    checkIcon: {
      fontSize: fontSize.xl,
      color: colors.success,
      marginRight: spacing.md,
      fontWeight: "bold" as const,
    },
    beneficioTexto: {
      fontSize: fontSize.md,
      color: colors.textPrimary,
    },
    formularioContratacion: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.xl,
    },
    tituloFormulario: {
      fontSize: fontSize.lg,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    textArea: {
      height: 100,
      paddingTop: spacing.md,
    },
    botonesFormulario: {
      flexDirection: "row" as const,
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    botonFormulario: {
      flex: 1,
    },
    botonContratar: {
      marginTop: spacing.xl,
      marginBottom: spacing.xxl,
      paddingVertical: spacing.lg,
    },
  });

  if (loadingPlan) {
    return (
      <View style={[globalStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!plan) {
    return (
      <ScrollView style={globalStyles.container}>
        <View style={styles.containerConPadding}>
          <Text style={globalStyles.title}>📱 Explora Planes</Text>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📱</Text>
            <Text style={styles.emptyText}>
              Selecciona un plan desde el catálogo para ver sus detalles
            </Text>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonPrimary]}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={globalStyles.buttonText}>Ver Catálogo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.containerConPadding}>
        {/* Imagen del plan */}
        {plan.imagen_url ? (
          <Image
            source={{ uri: plan.imagen_url }}
            style={styles.imagenGrande}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagenGrande, styles.imagenPlaceholder]}>
            <Text style={styles.placeholderText}>📱</Text>
          </View>
        )}

        {/* Badge de segmento */}
        <View
          style={[
            styles.badgeSegmento,
            { backgroundColor: getColorSegmento(plan.segmento) },
          ]}
        >
          <Text style={styles.textoSegmento}>{plan.segmento.toUpperCase()}</Text>
        </View>

        {/* Información principal */}
        <View style={styles.contenidoPrincipal}>
          <Text style={styles.nombrePlan}>{plan.nombre}</Text>
          <Text style={styles.precioPlan}>${plan.precio.toFixed(2)}/mes</Text>

          {plan.descripcion && (
            <Text style={styles.descripcion}>{plan.descripcion}</Text>
          )}

          {/* Características principales */}
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>📊 Características</Text>
            <View style={styles.caracteristicasGrid}>
              <View style={styles.caracteristicaItem}>
                <Text style={styles.iconoCaract}>📶</Text>
                <Text style={styles.labelCaract}>Datos</Text>
                <Text style={styles.valorCaract}>{plan.datos_gb}</Text>
              </View>
              <View style={styles.caracteristicaItem}>
                <Text style={styles.iconoCaract}>📞</Text>
                <Text style={styles.labelCaract}>Minutos</Text>
                <Text style={styles.valorCaract}>
                  {plan.minutos === "ILIMITADO" ? "∞" : plan.minutos}
                </Text>
              </View>
              <View style={styles.caracteristicaItem}>
                <Text style={styles.iconoCaract}>💬</Text>
                <Text style={styles.labelCaract}>SMS</Text>
                <Text style={styles.valorCaract}>
                  {plan.sms === "ILIMITADO" ? "∞" : plan.sms}
                </Text>
              </View>
            </View>
          </View>

          {/* Velocidades */}
          {(plan.velocidad_4g || plan.velocidad_5g) && (
            <View style={styles.seccion}>
              <Text style={styles.tituloSeccion}>⚡ Velocidad</Text>
              {plan.velocidad_4g && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>4G:</Text>
                  <Text style={styles.infoValor}>{plan.velocidad_4g}</Text>
                </View>
              )}
              {plan.velocidad_5g && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>5G:</Text>
                  <Text style={styles.infoValor}>{plan.velocidad_5g}</Text>
                </View>
              )}
            </View>
          )}

          {/* Beneficios adicionales */}
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>✨ Beneficios Incluidos</Text>
            <View style={styles.beneficiosList}>
              {plan.whatsapp_gratis && (
                <View style={styles.beneficioItem}>
                  <Text style={styles.checkIcon}>✓</Text>
                  <Text style={styles.beneficioTexto}>WhatsApp ilimitado</Text>
                </View>
              )}
              {plan.redes_sociales_gratis && (
                <View style={styles.beneficioItem}>
                  <Text style={styles.checkIcon}>✓</Text>
                  <Text style={styles.beneficioTexto}>Redes sociales gratis</Text>
                </View>
              )}
              {plan.llamadas_internacionales && (
                <View style={styles.beneficioItem}>
                  <Text style={styles.checkIcon}>✓</Text>
                  <Text style={styles.beneficioTexto}>
                    Llamadas internacionales
                  </Text>
                </View>
              )}
              {plan.roaming && (
                <View style={styles.beneficioItem}>
                  <Text style={styles.checkIcon}>✓</Text>
                  <Text style={styles.beneficioTexto}>Roaming incluido</Text>
                </View>
              )}
            </View>
          </View>

          {/* Formulario de contratación */}
          {mostrarFormulario ? (
            <View style={styles.formularioContratacion}>
              <Text style={styles.tituloFormulario}>
                Solicitar Contratación
              </Text>
              <TextInput
                style={[globalStyles.input, styles.textArea]}
                placeholder="Comentarios o consultas (opcional)"
                value={notasUsuario}
                onChangeText={setNotasUsuario}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.botonesFormulario}>
                <TouchableOpacity
                  style={[
                    globalStyles.button,
                    globalStyles.buttonSecondary,
                    styles.botonFormulario,
                  ]}
                  onPress={() => setMostrarFormulario(false)}
                >
                  <Text style={globalStyles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    globalStyles.button,
                    globalStyles.buttonPrimary,
                    styles.botonFormulario,
                  ]}
                  onPress={handleConfirmarContratacion}
                  disabled={loadingContratacion}
                >
                  {loadingContratacion ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={globalStyles.buttonText}>Confirmar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                globalStyles.button,
                globalStyles.buttonPrimary,
                styles.botonContratar,
              ]}
              onPress={handleContratar}
            >
              <Text style={globalStyles.buttonText}>🚀 Contratar Este Plan</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

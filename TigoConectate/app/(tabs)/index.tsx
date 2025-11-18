import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { usePlanes } from "../../src/presentation/hooks/usePlanes";
import { useContrataciones } from "../../src/presentation/hooks/useContrataciones";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalStyles } from "../../src/styles/globalStyles";
import {
  borderRadius,
  fontSize,
  spacing,
  lightColors,
} from "../../src/styles/theme";
import { PlanMovil } from "../../src/domain/models/PlanMovil";

export default function CatalogoScreen() {
  const { colors: themeColors } = useTheme();
  const { usuario, esAsesor } = useAuth();
  
  // Si no hay usuario (modo invitado), forzar tema claro
  const colors = usuario ? themeColors : lightColors;
  const { planesActivos, loading, obtenerPlanesActivos, buscarPlanes, filtrarPorSegmento } = usePlanes();
  const { obtenerContratacionesUsuario } = useContrataciones();
  
  const [busqueda, setBusqueda] = useState("");
  const [refrescando, setRefrescando] = useState(false);
  const [segmentoSeleccionado, setSegmentoSeleccionado] = useState<"basico" | "medio" | "premium" | null>(null);
  const [tienePlanActivo, setTienePlanActivo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    cargarPlanes();
  }, []);

  useEffect(() => {
    if (usuario && !esAsesor) {
      verificarPlanActivo();
    }
  }, [usuario, esAsesor]);

  const cargarPlanes = async () => {
    await obtenerPlanesActivos();
  };

  const verificarPlanActivo = async () => {
    if (!usuario) return;
    const contrataciones = await obtenerContratacionesUsuario(usuario.id);
    const tieneActivo = contrataciones.some(c => c.estado === "aprobada");
    setTienePlanActivo(tieneActivo);
  };

  const handleBuscar = async () => {
    if (busqueda.trim()) {
      await buscarPlanes(busqueda);
    } else {
      await obtenerPlanesActivos();
    }
  };

  const handleFiltrarSegmento = async (segmento: "basico" | "medio" | "premium" | null) => {
    setSegmentoSeleccionado(segmento);
    if (segmento) {
      await filtrarPorSegmento(segmento);
    } else {
      await obtenerPlanesActivos();
    }
  };

  const handleRefresh = async () => {
    setRefrescando(true);
    setBusqueda("");
    setSegmentoSeleccionado(null);
    await obtenerPlanesActivos();
    setRefrescando(false);
  };

  const handleSeleccionarPlan = (plan: PlanMovil) => {
    // Si es asesor, ir a editar el plan
    if (esAsesor) {
      router.push({
        pathname: "/planes/gestionar",
        params: { planId: plan.id },
      });
      return;
    }

    // Si no está autenticado, pedir login
    if (!usuario) {
      Alert.alert(
        "Iniciar Sesión",
        "Debes iniciar sesión o registrarte para contratar un plan",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar Sesión", onPress: () => router.push("/auth/login") },
          { text: "Registrarse", onPress: () => router.push("/auth/registro") },
        ]
      );
      return;
    }

    // Navegar a detalles del plan
    router.push({
      pathname: "/(tabs)/explore",
      params: { planId: plan.id },
    });
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

  // Crear estilos dinámicos con los colores del tema
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerConPadding: {
      paddingTop: 60,
    },
    headerContent: {
      flexDirection: "row" as const,
      justifyContent: "flex-start" as const,
      alignItems: "center" as const,
      width: "100%",
    },
    logoContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      overflow: "hidden" as const,
      marginRight: spacing.xs,
      backgroundColor: colors.white,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    logo: {
      width: 36,
      height: 36,
    },
    headerRight: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: spacing.sm,
    },
    titulo: {
      fontSize: fontSize.xxl,
      fontWeight: "bold" as const,
      color: colors.primary,
    },
    bienvenida: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontWeight: "600" as const,
    },
    botonCerrar: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    botonLogin: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    contenedorBusqueda: {
      flexDirection: "row" as const,
      padding: spacing.md,
      gap: spacing.sm,
      backgroundColor: colors.white,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: fontSize.md,
      backgroundColor: colors.background,
      color: colors.textPrimary,
    },
    inputBusqueda: {
      flex: 1,
      marginBottom: 0,
    },
    botonBuscar: {
      width: 50,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    iconoBuscar: {
      fontSize: fontSize.lg,
    },
    contenedorFiltros: {
      flexDirection: "row" as const,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    filtroChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.round,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.white,
    },
    filtroChipActivo: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    textoFiltro: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontWeight: "600" as const,
    },
    textoFiltroActivo: {
      color: colors.white,
    },
    emptyContainer: {
      alignItems: "center" as const,
      marginTop: spacing.xl,
    },
    emptyEmoji: {
      fontSize: 64,
      marginBottom: spacing.md,
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    planCard: {
      padding: 0,
      overflow: "hidden" as const,
    },
    imagenPlan: {
      width: "100%",
      height: 180,
    },
    imagenPlaceholder: {
      backgroundColor: colors.background,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    placeholderText: {
      fontSize: 64,
    },
    badgeSegmento: {
      position: "absolute" as const,
      top: spacing.md,
      right: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    textoSegmento: {
      color: colors.white,
      fontSize: fontSize.xs,
      fontWeight: "bold" as const,
    },
    infoPlan: {
      padding: spacing.md,
    },
    nombrePlan: {
      fontSize: fontSize.xl,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    precioPlan: {
      fontSize: fontSize.xxl,
      fontWeight: "bold" as const,
      color: colors.primary,
      marginBottom: spacing.md,
    },
    caracteristicas: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      marginBottom: spacing.md,
    },
    caracteristica: {
      alignItems: "center" as const,
      flex: 1,
    },
    iconoCaracteristica: {
      fontSize: fontSize.xl,
      marginBottom: spacing.xs / 2,
    },
    textoCaracteristica: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontWeight: "600" as const,
    },
    extras: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    extraBadge: {
      backgroundColor: colors.success + "20",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: borderRadius.sm,
    },
    extraText: {
      fontSize: fontSize.xs,
      color: colors.success,
      fontWeight: "600" as const,
    },
    botonContratar: {
      marginTop: spacing.sm,
    },
    botonFlotante: {
      position: "absolute" as const,
      bottom: spacing.xl,
      right: spacing.lg,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 30,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    textoBotonFlotante: {
      color: colors.white,
      fontSize: fontSize.md,
      fontWeight: "bold" as const,
    },
    avisoPlanActivo: {
      margin: spacing.md,
      padding: spacing.md,
      backgroundColor: "#E3F2FD",
      borderRadius: borderRadius.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
    },
    avisoTexto: {
      flex: 1,
      fontSize: fontSize.sm,
      color: "#01579B",
      fontWeight: "500" as const,
      marginRight: spacing.sm,
    },
    botonVerPlan: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    textoBotonVerPlan: {
      color: colors.white,
      fontSize: fontSize.xs,
      fontWeight: "600" as const,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, styles.headerConPadding]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={require("../../assets/images/iconoTigo.png")} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.titulo}>Tigo Conecta</Text>
        </View>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.contenedorBusqueda}>
        <TextInput
          style={[styles.input, styles.inputBusqueda]}
          placeholder="Buscar planes..."
          value={busqueda}
          onChangeText={setBusqueda}
          onSubmitEditing={handleBuscar}
        />
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary, styles.botonBuscar]}
          onPress={handleBuscar}
        >
          <IconSymbol name="magnifyingglass" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filtros por segmento */}
      <View style={styles.contenedorFiltros}>
        <TouchableOpacity
          style={[
            styles.filtroChip,
            !segmentoSeleccionado && styles.filtroChipActivo,
          ]}
          onPress={() => handleFiltrarSegmento(null)}
        >
          <Text style={[styles.textoFiltro, !segmentoSeleccionado && styles.textoFiltroActivo]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filtroChip,
            segmentoSeleccionado === "basico" && styles.filtroChipActivo,
            segmentoSeleccionado === "basico" && { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
          ]}
          onPress={() => handleFiltrarSegmento("basico")}
        >
          <Text style={[styles.textoFiltro, segmentoSeleccionado === "basico" && styles.textoFiltroActivo]}>
            Básico
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filtroChip,
            segmentoSeleccionado === "medio" && styles.filtroChipActivo,
            segmentoSeleccionado === "medio" && { backgroundColor: "#FF9800", borderColor: "#FF9800" },
          ]}
          onPress={() => handleFiltrarSegmento("medio")}
        >
          <Text style={[styles.textoFiltro, segmentoSeleccionado === "medio" && styles.textoFiltroActivo]}>
            Medio
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filtroChip,
            segmentoSeleccionado === "premium" && styles.filtroChipActivo,
            segmentoSeleccionado === "premium" && { backgroundColor: "#9C27B0", borderColor: "#9C27B0" },
          ]}
          onPress={() => handleFiltrarSegmento("premium")}
        >
          <Text style={[styles.textoFiltro, segmentoSeleccionado === "premium" && styles.textoFiltroActivo]}>
            Premium
          </Text>
        </TouchableOpacity>
      </View>

      {/* AVISO: Usuario con plan activo */}
      {usuario && !esAsesor && tienePlanActivo && (
        <View style={styles.avisoPlanActivo}>
          <Text style={styles.avisoTexto}>
            Ya tienes un plan activo. No puedes contratar otro hasta que finalice.
          </Text>
          <TouchableOpacity
            style={styles.botonVerPlan}
            onPress={() => router.push("/(tabs)/progreso")}
          >
            <Text style={styles.textoBotonVerPlan}>Ver Mi Plan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de planes */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : (
        <FlatList
          data={planesActivos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📱</Text>
              <Text style={globalStyles.emptyState}>No hay planes disponibles</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, styles.planCard]}
              onPress={() => handleSeleccionarPlan(item)}
              activeOpacity={0.7}
            >
              {/* Imagen del plan */}
              {item.imagen_url ? (
                <Image source={{ uri: item.imagen_url }} style={styles.imagenPlan} resizeMode="cover" />
              ) : (
                <View style={[styles.imagenPlan, styles.imagenPlaceholder]}>
                  <Text style={styles.placeholderText}>📱</Text>
                </View>
              )}

              {/* Badge de segmento */}
              <View style={[styles.badgeSegmento, { backgroundColor: getColorSegmento(item.segmento) }]}>
                <Text style={styles.textoSegmento}>{item.segmento.toUpperCase()}</Text>
              </View>

              {/* Información del plan */}
              <View style={styles.infoPlan}>
                <Text style={styles.nombrePlan}>{item.nombre}</Text>
                <Text style={styles.precioPlan}>${item.precio.toFixed(2)}/mes</Text>
                
                {/* Características principales */}
                <View style={styles.caracteristicas}>
                  <View style={styles.caracteristica}>
                    <Text style={styles.iconoCaracteristica}>📊</Text>
                    <Text style={styles.textoCaracteristica}>{item.datos_gb} datos</Text>
                  </View>
                  <View style={styles.caracteristica}>
                    <Text style={styles.iconoCaracteristica}>📞</Text>
                    <Text style={styles.textoCaracteristica}>
                      {item.minutos === "ILIMITADO" ? "∞ min" : `${item.minutos} min`}
                    </Text>
                  </View>
                  <View style={styles.caracteristica}>
                    <Text style={styles.iconoCaracteristica}>💬</Text>
                    <Text style={styles.textoCaracteristica}>
                      {item.sms === "ILIMITADO" ? "∞ SMS" : `${item.sms} SMS`}
                    </Text>
                  </View>
                </View>

                {/* Extras */}
                <View style={styles.extras}>
                  {item.whatsapp_gratis && (
                    <View style={styles.extraBadge}>
                      <Text style={styles.extraText}>✓ WhatsApp gratis</Text>
                    </View>
                  )}
                  {item.redes_sociales_gratis && (
                    <View style={styles.extraBadge}>
                      <Text style={styles.extraText}>✓ Redes gratis</Text>
                    </View>
                  )}
                  {item.velocidad_5g && (
                    <View style={styles.extraBadge}>
                      <Text style={styles.extraText}>✓ 5G</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[globalStyles.button, globalStyles.buttonPrimary, styles.botonContratar]}
                  onPress={() => handleSeleccionarPlan(item)}
                >
                  <Text style={globalStyles.buttonText}>
                    {esAsesor ? "Editar Plan" : "Ver Detalles"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Botón flotante para asesores */}
      {esAsesor && (
        <TouchableOpacity
          style={styles.botonFlotante}
          onPress={() => router.push("/planes/gestionar")}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotonFlotante}>+ Nuevo Plan</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}


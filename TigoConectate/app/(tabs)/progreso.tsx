import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { useContrataciones } from "../../src/presentation/hooks/useContrataciones";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalStyles } from "../../src/styles/globalStyles";
import {
  borderRadius,
  fontSize,
  spacing,
} from "../../src/styles/theme";
import { supabase } from "../../src/data/services/supabaseClient";

/**
 * Pantalla de Mis Planes (usuarios) / Pendientes (asesores)
 */
export default function MisPlanesScreen() {
  const { colors } = useTheme();
  const { usuario, esAsesor } = useAuth();
  const router = useRouter();
  const {
    contrataciones,
    contratacionesPendientes,
    obtenerContratacionesUsuario,
    obtenerContratacionesPendientes,
    loading,
  } = useContrataciones();

  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarPlanes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id]);

  const cargarPlanes = async () => {
    if (!usuario) return;
    
    if (esAsesor) {
      await obtenerContratacionesPendientes();
    } else {
      const datos = await obtenerContratacionesUsuario(usuario.id);
      
      // Verificar y actualizar planes vencidos
      await verificarPlanesVencidos(datos);
    }
  };

  const verificarPlanesVencidos = async (contrataciones: any[]) => {
    const ahora = new Date();
    
    for (const contratacion of contrataciones) {
      if (contratacion.estado === "aprobada" && contratacion.fecha_fin) {
        const fechaFin = new Date(contratacion.fecha_fin);
        
        if (ahora > fechaFin) {
          // Actualizar estado a vencida
          await supabase
            .from("contrataciones")
            .update({ estado: "vencida" })
            .eq("id", contratacion.id);
        }
      }
    }
    
    // Recargar datos después de actualizar
    if (usuario?.id) {
      await obtenerContratacionesUsuario(usuario.id);
    }
  };

  const aprobarContratacion = async (contratacionId: string) => {
    if (!usuario?.id) {
      Alert.alert("Error", "No se pudo identificar el usuario");
      return;
    }

    try {
      const ahora = new Date();
      const fechaFin = new Date(ahora.getTime() + 10 * 60 * 1000); // +10 minutos

      const { error } = await supabase
        .from("contrataciones")
        .update({ 
          estado: "aprobada",
          asesor_id: usuario.id,
          fecha_aprobacion: ahora.toISOString(),
          fecha_fin: fechaFin.toISOString(),
          duracion_minutos: 10
        })
        .eq("id", contratacionId);

      if (error) throw error;

      Alert.alert("Aprobada", "La contratación ha sido aprobada. El plan estará activo por 10 minutos.");
      cargarPlanes();
    } catch {
      Alert.alert("Error", "No se pudo aprobar la contratación");
    }
  };

  const eliminarSolicitud = async (contratacionId: string) => {
    Alert.alert(
      "Eliminar Solicitud",
      "¿Estás seguro de eliminar esta solicitud pendiente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("contrataciones")
                .delete()
                .eq("id", contratacionId);

              if (error) throw error;

              Alert.alert("Eliminada", "La solicitud ha sido eliminada.");
              cargarPlanes();
            } catch {
              Alert.alert("Error", "No se pudo eliminar la solicitud");
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefrescando(true);
    await cargarPlanes();
    setRefrescando(false);
  };

  // Para asesor: mostrar pendientes, para usuario: mostrar aprobados
  const datosAMostrar = esAsesor 
    ? contratacionesPendientes 
    : contrataciones.filter((c) => c.estado === "aprobada");

  // Crear estilos dinámicos con los colores del tema
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    espacioBarra: {
      height: 50,
    },
    centerContent: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: spacing.lg,
    },
    textoNoUsuario: {
      fontSize: fontSize.lg,
      color: colors.textSecondary,
      textAlign: "center" as const,
      marginBottom: spacing.xl,
    },
    header: {
      padding: spacing.lg,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tituloContenedor: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    titulo: {
      fontSize: fontSize.xxl,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    subtitulo: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    contenedorFiltros: {
      flexDirection: "row" as const,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.white,
    },
    filtroChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.round,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.white,
      marginRight: spacing.sm,
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
    listaContenedor: {
      padding: spacing.md,
    },
    emptyContainer: {
      alignItems: "center" as const,
      marginTop: spacing.xxl,
      paddingHorizontal: spacing.lg,
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
    },
    cardHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      marginBottom: spacing.md,
    },
    nombrePlan: {
      fontSize: fontSize.xl,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    descripcionPlan: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.md,
      lineHeight: 20,
    },
    caracteristicas: {
      flexDirection: "row" as const,
      marginBottom: spacing.md,
    },
    caracteristicaItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginRight: spacing.lg,
    },
    caracteristicaIcono: {
      fontSize: fontSize.md,
      marginRight: spacing.xs,
    },
    caracteristicaTexto: {
      fontSize: fontSize.sm,
      color: colors.textPrimary,
      fontWeight: "500" as const,
    },
    footer: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginTop: spacing.sm,
    },
    precio: {
      fontSize: fontSize.xl,
      fontWeight: "bold" as const,
      color: colors.primary,
    },
    botonChat: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
    },
    textoBotonChat: {
      color: colors.white,
      fontSize: fontSize.sm,
      fontWeight: "600" as const,
    },
    tarjetaPlan: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      overflow: "hidden" as const,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    imagenPlan: {
      width: "100%",
      height: 180,
      backgroundColor: colors.border,
    },
    imagenPlaceholder: {
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor: colors.background,
    },
    placeholderEmoji: {
      fontSize: 60,
    },
    infoPlan: {
      padding: spacing.lg,
    },
    avisoContainer: {
      margin: spacing.lg,
      padding: spacing.xl,
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      alignItems: "center" as const,
      borderWidth: 1,
      borderColor: "#FFA500",
    },
    avisoEmoji: {
      fontSize: 50,
      marginBottom: spacing.md,
    },
    avisoTitulo: {
      fontSize: fontSize.lg,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
      textAlign: "center" as const,
      marginBottom: spacing.sm,
    },
    avisoTexto: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: "center" as const,
      marginBottom: spacing.lg,
    },
    contratacionPendiente: {
      width: "100%",
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
    },
    planPendiente: {
      fontSize: fontSize.md,
      fontWeight: "600" as const,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    estadoPendiente: {
      fontSize: fontSize.sm,
      color: "#FFA500",
      fontWeight: "500" as const,
    },
    tarjetaPendiente: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    headerPendiente: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginBottom: spacing.sm,
    },
    usuarioPendiente: {
      fontSize: fontSize.md,
      fontWeight: "600" as const,
      color: colors.textPrimary,
      flex: 1,
    },
    fechaPendiente: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    infoPendiente: {
      marginBottom: spacing.md,
    },
    nombrePlanPendiente: {
      fontSize: fontSize.lg,
      fontWeight: "bold" as const,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    detallePendiente: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    descripcionPendiente: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      fontStyle: "italic" as const,
    },
    botonesAccion: {
      flexDirection: "row" as const,
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    botonAprobar: {
      flex: 1,
      flexDirection: "row" as const,
      gap: spacing.xs,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    textoBotonAprobar: {
      color: colors.white,
      fontSize: fontSize.md,
      fontWeight: "600" as const,
    },
    botonEliminarSolicitud: {
      flex: 1,
      flexDirection: "row" as const,
      gap: spacing.xs,
      backgroundColor: colors.secondary,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    textoBotonEliminar: {
      color: colors.white,
      fontSize: fontSize.md,
      fontWeight: "600" as const,
    },
    tiempoRestante: {
      backgroundColor: "#FFF9C4",
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      marginVertical: spacing.sm,
      borderLeftWidth: 3,
      borderLeftColor: "#FFC107",
    },
    tiempoTexto: {
      fontSize: fontSize.md,
      fontWeight: "bold" as const,
      color: "#F57F17",
      marginBottom: spacing.xs / 2,
    },
    venceTexto: {
      fontSize: fontSize.xs,
      color: "#F57F17",
      fontStyle: "italic" as const,
    },
  });

  if (!usuario) {
    return (
      <View style={[globalStyles.container, styles.centerContent]}>
        <Text style={styles.textoNoUsuario}>
          Inicia sesión para ver tus planes contratados
        </Text>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary]}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.espacioBarra} />
      <View style={styles.header}>
        <View style={styles.tituloContenedor}>
          {esAsesor && <IconSymbol name="list.bullet" size={28} color={colors.textPrimary} />}
          {!esAsesor && <IconSymbol name="iphone" size={28} color={colors.textPrimary} />}
          <Text style={styles.titulo}>
            {esAsesor ? 'Solicitudes Pendientes' : 'Mis Planes'}
          </Text>
        </View>
        <Text style={styles.subtitulo}>
          {esAsesor 
            ? `${datosAMostrar.length} solicitud${datosAMostrar.length !== 1 ? 'es' : ''} por revisar`
            : `Planes contratados activos (${datosAMostrar.length})`
          }
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.subtitulo}>Cargando planes...</Text>
        </View>
      ) : (
        <>
          {/* Mostrar info de contrataciones pendientes si las hay (solo usuarios) */}
          {!esAsesor && contrataciones.length > 0 && datosAMostrar.length === 0 && (
            <View style={styles.avisoContainer}>
              <Text style={styles.avisoEmoji}>⏳</Text>
              <Text style={styles.avisoTitulo}>
                Tienes {contrataciones.length} solicitud{contrataciones.length > 1 ? 'es' : ''} pendiente{contrataciones.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.avisoTexto}>
                El asesor está revisando tu solicitud. Te notificaremos cuando sea aprobada.
              </Text>
              {contrataciones.map((c) => (
                <View key={c.id} style={styles.contratacionPendiente}>
                  <Text style={styles.planPendiente}>📱 {c.plan?.nombre}</Text>
                  <Text style={styles.estadoPendiente}>
                    Estado: {c.estado === 'pendiente' ? '⏳ Pendiente' : c.estado === 'rechazada' ? '❌ Rechazada' : c.estado}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          <FlatList
            data={datosAMostrar}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listaContenedor}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={handleRefresh}
              />
            }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol 
                name={esAsesor ? "list.bullet" : "iphone"} 
                size={80} 
                color={colors.textSecondary} 
              />
              <Text style={styles.emptyText}>
                {esAsesor 
                  ? 'No hay solicitudes pendientes'
                  : 'No tienes planes contratados aún'
                }
              </Text>
              {!esAsesor && (
                <TouchableOpacity
                  style={[globalStyles.button, globalStyles.buttonPrimary]}
                  onPress={() => router.push("/(tabs)")}
                >
                  <Text style={globalStyles.buttonText}>Ver Planes Disponibles</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => {
            // Vista ASESOR: Mostrar solicitudes pendientes con botón aprobar
            if (esAsesor) {
              return (
                <View style={styles.tarjetaPendiente}>
                  <View style={styles.headerPendiente}>
                    <Text style={styles.usuarioPendiente}>
                      👤 {item.usuario?.nombre || item.usuario?.email}
                    </Text>
                    <Text style={styles.fechaPendiente}>
                      📅 {new Date(item.fecha_solicitud).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.infoPendiente}>
                    <Text style={styles.nombrePlanPendiente}>{item.plan?.nombre}</Text>
                    <Text style={styles.detallePendiente}>
                      💰 ${item.plan?.precio}/mes | 📊 {item.plan?.datos_gb}
                    </Text>
                    {item.plan?.descripcion && (
                      <Text style={styles.descripcionPendiente} numberOfLines={2}>
                        {item.plan?.descripcion}
                      </Text>
                    )}
                  </View>

                  <View style={styles.botonesAccion}>
                    <TouchableOpacity
                      style={styles.botonAprobar}
                      onPress={() => aprobarContratacion(item.id)}
                    >
                      <IconSymbol name="checkmark" size={20} color={colors.white} />
                      <Text style={styles.textoBotonAprobar}>Aprobar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.botonEliminarSolicitud}
                      onPress={() => eliminarSolicitud(item.id)}
                    >
                      <IconSymbol name="trash" size={20} color={colors.white} />
                      <Text style={styles.textoBotonEliminar}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            // Vista USUARIO: Mostrar planes aprobados con botón chat
            return (
            <View style={styles.tarjetaPlan}>
              {/* Imagen del plan */}
              {item.plan?.imagen_url ? (
                <Image
                  source={{ uri: item.plan.imagen_url }}
                  style={styles.imagenPlan}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.imagenPlan, styles.imagenPlaceholder]}>
                  <IconSymbol name="iphone" size={64} color={colors.textSecondary} />
                </View>
              )}

              {/* Información del plan */}
              <View style={styles.infoPlan}>
                <Text style={styles.nombrePlan}>{item.plan?.nombre}</Text>
                
                {/* Indicador de tiempo restante */}
                {item.fecha_fin && (() => {
                  const ahora = new Date();
                  const fin = new Date(item.fecha_fin);
                  const minutosRestantes = Math.max(0, Math.floor((fin.getTime() - ahora.getTime()) / (1000 * 60)));
                  const segundosRestantes = Math.max(0, Math.floor((fin.getTime() - ahora.getTime()) / 1000) % 60);
                  
                  return (
                    <View style={styles.tiempoRestante}>
                      <Text style={styles.tiempoTexto}>
                        ⏱️ Tiempo restante: {minutosRestantes}m {segundosRestantes}s
                      </Text>
                      <Text style={styles.venceTexto}>
                        Vence: {fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  );
                })()}
                
                <Text style={styles.descripcionPlan} numberOfLines={2}>
                  {item.plan?.descripcion}
                </Text>
                
                <View style={styles.caracteristicas}>
                  <View style={styles.caracteristicaItem}>
                    <Text style={styles.caracteristicaIcono}>📊</Text>
                    <Text style={styles.caracteristicaTexto}>
                      {item.plan?.datos_gb}
                    </Text>
                  </View>
                  <View style={styles.caracteristicaItem}>
                    <Text style={styles.caracteristicaIcono}>📞</Text>
                    <Text style={styles.caracteristicaTexto}>
                      {item.plan?.minutos}
                    </Text>
                  </View>
                  <View style={styles.caracteristicaItem}>
                    <Text style={styles.caracteristicaIcono}>💬</Text>
                    <Text style={styles.caracteristicaTexto}>
                      {item.plan?.sms}
                    </Text>
                  </View>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.precio}>
                    ${item.plan?.precio.toFixed(2)}/mes
                  </Text>
                  <TouchableOpacity
                    style={styles.botonChat}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/chat",
                        params: { 
                          contratacionId: item.id,
                          asesorId: item.asesor_id 
                        },
                      })
                    }
                  >
                    <Text style={styles.textoBotonChat}>Chatear con Asesor</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            );
          }}
        />
        </>
      )}
    </View>
  );
}


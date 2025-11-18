import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useChat } from "@/src/presentation/hooks/useChat";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useContrataciones } from "@/src/presentation/hooks/useContrataciones";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Mensaje } from "@/src/domain/models/Mensaje";
import { Contratacion } from "@/src/domain/models/Contratacion";
import { fontSize, spacing, borderRadius } from "@/src/styles/theme";

export default function ChatScreen() {
  const { colors } = useTheme();
  const { contratacionId, asesorId } = useLocalSearchParams<{ contratacionId?: string; asesorId?: string }>();
  const router = useRouter();
  const { usuario } = useAuth();
  const {
    mensajes,
    cargando,
    enviando,
    enviarMensaje,
    notificarEscribiendo,
    usuariosEscribiendo,
    cargarMensajesContratacion,
  } = useChat();
  const { 
    contrataciones, 
    obtenerContratacion,
    obtenerContratacionesUsuario,
    obtenerContratacionesAsesor 
  } = useContrataciones();

  const esAsesor = usuario?.rol === "asesor_comercial";
  const esUsuario = usuario?.rol === "usuario_registrado";
  
  const [textoMensaje, setTextoMensaje] = useState("");
  const [contratacion, setContratacion] = useState<Contratacion | null>(null);
  const [chatsConMensajes, setChatsConMensajes] = useState<Contratacion[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Para usuario: cargar sus chats aprobados
  useEffect(() => {
    if (esUsuario && !contratacionId && usuario) {
      cargarChatsUsuario();
    }
  }, [esUsuario, usuario?.id, contrataciones]);

  // Para asesor: cargar lista de contrataciones con mensajes
  useEffect(() => {
    if (esAsesor && !contratacionId && usuario) {
      cargarChatsAsesor();
    }
  }, [esAsesor, usuario?.id]);

  // NUEVO: Si es usuario y tiene solo 1 chat, redirigir automáticamente
  useEffect(() => {
    if (esUsuario && !contratacionId && chatsConMensajes.length === 1) {
      router.replace({
        pathname: "/(tabs)/chat",
        params: { contratacionId: chatsConMensajes[0].id },
      });
    }
  }, [esUsuario, contratacionId, chatsConMensajes]);

  const cargarChatsUsuario = async () => {
    if (!usuario) return;
    // Para usuario: obtener sus contrataciones aprobadas
    const datos = await obtenerContratacionesUsuario(usuario.id);
    const aprobadas = datos.filter((c: Contratacion) => c.estado === "aprobada");
    setChatsConMensajes(aprobadas);
  };

  const cargarChatsAsesor = async () => {
    if (!usuario) return;
    const contratos = await obtenerContratacionesAsesor(usuario.id);
    // Filtrar solo contrataciones aprobadas (que potencialmente tienen mensajes)
    const aprobadas = contratos.filter((c: Contratacion) => c.estado === "aprobada");
    setChatsConMensajes(aprobadas);
  };

  // Cargar contratación específica
  useEffect(() => {
    if (contratacionId) {
      cargarContratacion();
      cargarMensajesContratacion(contratacionId);
    }
  }, [contratacionId]);

  const cargarContratacion = async () => {
    if (!contratacionId) return;
    const data = await obtenerContratacion(contratacionId);
    if (data) {
      setContratacion(data);
    }
  };

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    if (mensajes.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [mensajes]);

  // ✅ NUEVO: Manejar cambios en el input
  const handleCambioTexto = (texto: string) => {
    setTextoMensaje(texto);

    // Notificar que estoy escribiendo
    if (texto.trim()) {
      notificarEscribiendo();

      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Enviar notificación cada 1 segundo mientras escribo
      timeoutRef.current = setTimeout(() => {
        if (texto.trim()) {
          notificarEscribiendo();
        }
      }, 1000);
    }
  };

  const handleEnviar = async () => {
    if (!textoMensaje.trim() || enviando || !contratacionId) return;

    const mensaje = textoMensaje;
    setTextoMensaje("");

    const resultado = await enviarMensaje(mensaje, contratacionId);

    if (resultado.success) {
      // Recargar mensajes para reflejar el nuevo mensaje inmediatamente
      await cargarMensajesContratacion(contratacionId);
    } else {
      Alert.alert("Error", resultado.error || "No se pudo enviar el mensaje");
      setTextoMensaje(mensaje);
    }
  };

  const renderMensaje = ({ item }: { item: Mensaje }) => {
    const esMio = item.usuario_id === usuario?.id;
    const emailUsuario = item.usuario?.email || "Usuario desconocido";

    return (
      <View
        style={[
          styles.mensajeContainer,
          esMio ? styles.mensajeMio : styles.mensajeOtro,
        ]}
      >
        {!esMio && <Text style={styles.nombreUsuario}>{emailUsuario}</Text>}
        <Text
          style={[
            styles.contenidoMensaje,
            esMio && styles.contenidoMensajeMio,
          ]}
        >
          {item.contenido}
        </Text>
        <Text style={[styles.horaMensaje, esMio && styles.horaMensajeMio]}>
          {new Date(item.created_at).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  // ✅ NUEVO: Componente de indicador de escritura
  const IndicadorEscritura = () => {
    const animacion1 = useRef(new Animated.Value(0)).current;
    const animacion2 = useRef(new Animated.Value(0)).current;
    const animacion3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animarPuntos = () => {
        Animated.sequence([
          Animated.timing(animacion1, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animacion2, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animacion3, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(animacion1, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(animacion2, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(animacion3, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => animarPuntos());
      };

      animarPuntos();
    }, []);

    if (usuariosEscribiendo.length === 0) return null;

    const nombresUsuarios = usuariosEscribiendo
      .map((u) => u.usuario_email.split("@")[0])
      .join(", ");

    return (
      <View style={styles.indicadorContainer}>
        <Text style={styles.indicadorTexto}>
          {usuariosEscribiendo.length === 1
            ? `${nombresUsuarios} está escribiendo`
            : `${nombresUsuarios} están escribiendo`}
        </Text>
        <View style={styles.puntosContainer}>
          <Animated.View
            style={[
              styles.punto,
              {
                opacity: animacion1,
                transform: [
                  {
                    translateY: animacion1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.punto,
              {
                opacity: animacion2,
                transform: [
                  {
                    translateY: animacion2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.punto,
              {
                opacity: animacion3,
                transform: [
                  {
                    translateY: animacion3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    espacioBarra: {
      height: 50,
      backgroundColor: colors.background,
    },
    espacioSuperior: {
      height: 10,
      backgroundColor: colors.background,
    },
    centrado: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: 20,
    },
    textoCargando: {
      marginTop: 10,
      fontSize: 16,
      color: colors.textSecondary,
    },
    textoError: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center" as const,
      marginBottom: 20,
    },
    botonAccion: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    textoBotonAccion: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600" as const,
    },
    headerContratacion: {
      backgroundColor: colors.white,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitulo: {
      fontSize: 18,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
      marginBottom: 8,
    },
    headerInfo: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
    },
    headerPrecio: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.primary,
    },
    headerBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    headerBadgeTexto: {
      fontSize: 12,
      fontWeight: "bold" as const,
      color: "#FFF",
    },
    listContainer: {
      padding: 16,
    },
    mensajeContainer: {
      maxWidth: "75%",
      padding: 12,
      borderRadius: 16,
      marginBottom: 8,
    },
    mensajeMio: {
      alignSelf: "flex-end" as const,
      backgroundColor: colors.primary,
    },
    mensajeOtro: {
      alignSelf: "flex-start" as const,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
    },
    nombreUsuario: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    contenidoMensaje: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    contenidoMensajeMio: {
      color: "#FFFFFF",
    },
    horaMensaje: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
      alignSelf: "flex-end" as const,
    },
    horaMensajeMio: {
      color: "rgba(255, 255, 255, 0.7)",
    },
    indicadorContainer: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    indicadorTexto: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: "italic" as const,
      marginRight: 8,
    },
    puntosContainer: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 4,
    },
    punto: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    inputContainer: {
      flexDirection: "row" as const,
      padding: 12,
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: "#E0E0E0",
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.background,
      borderRadius: 20,
      fontSize: 16,
      color: colors.textPrimary,
    },
    botonEnviar: {
      marginLeft: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.primary,
      borderRadius: 20,
      justifyContent: "center" as const,
    },
    botonDeshabilitado: {
      backgroundColor: colors.border,
    },
    textoBotonEnviar: {
      color: "#FFFFFF",
      fontWeight: "600" as const,
      fontSize: 16,
    },
    header: {
      padding: spacing.lg,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
    listaChats: {
      padding: spacing.md,
    },
    emptyContainer: {
      alignItems: "center" as const,
      marginTop: spacing.xxl * 2,
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
    },
    emptySubtext: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: "center" as const,
      marginTop: spacing.sm,
      paddingHorizontal: spacing.xl,
    },
    botonVolver: {
      marginBottom: spacing.sm,
    },
    textoVolver: {
      fontSize: fontSize.md,
      color: colors.primary,
      fontWeight: "600" as const,
    },
    headerContenido: {
      flex: 1,
    },
    tarjetaChat: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      backgroundColor: colors.white,
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    avatarContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginRight: spacing.md,
    },
    avatarTexto: {
      color: colors.white,
      fontSize: fontSize.xl,
      fontWeight: "bold" as const,
    },
    infoChat: {
      flex: 1,
    },
    planNombre: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    flechaContainer: {
      marginLeft: spacing.sm,
    },
    flechaIcono: {
      fontSize: 24,
      color: colors.textSecondary,
    },
  });

  if (!usuario) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.textoError}>Debes iniciar sesión para chatear</Text>
        <TouchableOpacity
          style={styles.botonAccion}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.textoBotonAccion}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Vista de lista de chats - SOLO para asesor o usuario con múltiples chats
  if (!contratacionId && (esAsesor || (esUsuario && chatsConMensajes.length > 1))) {
    return (
      <View style={styles.container}>
        <View style={styles.espacioBarra} />
        <View style={styles.header}>
          <Text style={styles.titulo}>💬 Mensajes</Text>
          <Text style={styles.subtitulo}>
            {esAsesor ? "Chats con clientes" : "Tus chats activos"}
          </Text>
        </View>

        {cargando ? (
          <View style={styles.centrado}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={chatsConMensajes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listaChats}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyText}>
                  {esAsesor 
                    ? "No tienes chats activos aún" 
                    : "No tienes planes aprobados aún"}
                </Text>
                {esUsuario && (
                  <Text style={styles.emptySubtext}>
                    Cuando tu plan sea aprobado, podrás chatear con tu asesor
                  </Text>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.tarjetaChat}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/chat",
                    params: { contratacionId: item.id },
                  })
                }
              >
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarTexto}>
                    {(item.usuario?.nombre || item.usuario?.email || "?")[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.infoChat}>
                  <Text style={styles.nombreUsuario}>
                    {item.usuario?.nombre || item.usuario?.email || "Usuario"}
                  </Text>
                  <Text style={styles.planNombre} numberOfLines={1}>
                    Plan: {item.plan?.nombre}
                  </Text>
                </View>
                <View style={styles.flechaContainer}>
                  <Text style={styles.flechaIcono}>›</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  // Vista de chat individual
  if (!contratacionId) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.textoError}>No se especificó una contratación</Text>
        <TouchableOpacity
          style={styles.botonAccion}
          onPress={() => router.back()}
        >
          <Text style={styles.textoBotonAccion}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.textoCargando}>Cargando mensajes...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={styles.espacioBarra} />
      <View style={styles.espacioSuperior} />
      
      {/* Header con botón volver y info de la contratación */}
      {contratacion && (
        <View style={styles.headerContratacion}>
          {esAsesor && (
            <TouchableOpacity 
              style={styles.botonVolver}
              onPress={() => router.push("/(tabs)/chat")}
            >
              <Text style={styles.textoVolver}>Volver</Text>
            </TouchableOpacity>
          )}
          <View style={styles.headerContenido}>
            <Text style={styles.headerTitulo}>{contratacion.plan?.nombre || "Plan"}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerPrecio}>${contratacion.plan?.precio}/mes</Text>
            <View
              style={[
                styles.headerBadge,
                {
                  backgroundColor:
                    contratacion.estado === "aprobada"
                      ? "#10B981"
                      : contratacion.estado === "rechazada"
                      ? "#EF4444"
                      : "#F59E0B",
                },
              ]}
            >
              <Text style={styles.headerBadgeTexto}>
                {contratacion.estado === "pendiente"
                  ? "⏳ Pendiente"
                  : contratacion.estado === "aprobada"
                  ? "✓ Aprobada"
                  : "✗ Rechazada"}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      <FlatList
        ref={flatListRef}
        data={mensajes}
        renderItem={renderMensaje}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* ✅ NUEVO: Mostrar indicador de escritura */}
      <IndicadorEscritura />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={textoMensaje}
          onChangeText={handleCambioTexto}
          placeholder="Escribe un mensaje..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.botonEnviar,
            (!textoMensaje.trim() || enviando) && styles.botonDeshabilitado,
          ]}
          onPress={handleEnviar}
          disabled={!textoMensaje.trim() || enviando}
        >
          <Text style={styles.textoBotonEnviar}>
            {enviando ? "..." : "Enviar"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
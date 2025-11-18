import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { usePlanes } from "@/src/presentation/hooks/usePlanes";
import { fontSize, spacing, borderRadius } from "@/src/styles/theme";
import { mostrarOpcionesFoto } from "@/src/utils/mediaPicker";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function GestionarPlanScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const { usuario } = useAuth();
  const { crearPlan, actualizarPlan, obtenerPlanPorId, loading } = usePlanes();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [datosGb, setDatosGb] = useState("");
  const [minutos, setMinutos] = useState("");
  const [sms, setSms] = useState("");
  const [velocidad4g, setVelocidad4g] = useState("");
  const [velocidad5g, setVelocidad5g] = useState("");
  const [segmento, setSegmento] = useState<"basico" | "medio" | "premium">("basico");
  const [whatsappGratis, setWhatsappGratis] = useState(false);
  const [redesSocialesGratis, setRedesSocialesGratis] = useState(false);
  const [roamingIncluido, setRoamingIncluido] = useState(false);
  const [soporta5g, setSoporta5g] = useState(false);
  const [activo, setActivo] = useState(true);
  const [imagenUri, setImagenUri] = useState<string | null>(null);

  useEffect(() => {
    if (planId) {
      cargarPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const cargarPlan = async () => {
    if (!planId) return;
    const plan = await obtenerPlanPorId(planId);
    if (plan) {
      setNombre(plan.nombre);
      setDescripcion(plan.descripcion || "");
      setPrecio(plan.precio.toString());
      setDatosGb(plan.datos_gb);
      setMinutos(plan.minutos);
      setSms(plan.sms);
      setVelocidad4g(plan.velocidad_4g);
      setVelocidad5g(plan.velocidad_5g || "");
      setSegmento(plan.segmento);
      setWhatsappGratis(plan.whatsapp_gratis);
      // Verificar si redes_sociales_gratis es string o boolean
      const redesGratis = typeof plan.redes_sociales_gratis === 'string' 
        ? (plan.redes_sociales_gratis !== "No incluido" && plan.redes_sociales_gratis.length > 0)
        : plan.redes_sociales_gratis;
      setRedesSocialesGratis(redesGratis);
      setRoamingIncluido(plan.roaming !== "No incluido");
      setSoporta5g(!!plan.velocidad_5g);
      setActivo(plan.activo);
      if (plan.imagen_url) {
        setImagenUri(plan.imagen_url);
      }
    }
  };

  const handleSeleccionarImagen = async () => {
    const uri = await mostrarOpcionesFoto();
    if (uri) {
      setImagenUri(uri);
    }
  };

  const handleEliminarImagen = () => {
    Alert.alert(
      "Eliminar Imagen",
      "¿Estás seguro de eliminar la imagen?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => setImagenUri(null) },
      ]
    );
  };

  const handleEliminarPlan = async () => {
    if (!planId) return;
    
    Alert.alert(
      "Eliminar Plan",
      "¿Estás seguro de eliminar este plan? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const resultado = await actualizarPlan(planId, { activo: false });
            if (resultado.success) {
              Alert.alert(
                "Éxito",
                "Plan eliminado correctamente",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } else {
              Alert.alert("Error", resultado.error || "No se pudo eliminar el plan");
            }
          },
        },
      ]
    );
  };

  const validarFormulario = () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre del plan es requerido");
      return false;
    }
    if (!descripcion.trim()) {
      Alert.alert("Error", "La descripción es requerida");
      return false;
    }
    if (!precio || isNaN(parseFloat(precio))) {
      Alert.alert("Error", "El precio debe ser un número válido");
      return false;
    }
    if (!datosGb.trim()) {
      Alert.alert("Error", "Los datos GB son requeridos");
      return false;
    }
    if (!minutos.trim()) {
      Alert.alert("Error", "Los minutos son requeridos");
      return false;
    }
    if (!sms.trim()) {
      Alert.alert("Error", "Los SMS son requeridos");
      return false;
    }
    if (!velocidad4g.trim()) {
      Alert.alert("Error", "La velocidad 4G es requerida");
      return false;
    }
    return true;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    const planData: any = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: parseFloat(precio),
      datos_gb: datosGb.trim(),
      minutos: minutos.trim(),
      sms: sms.trim(),
      velocidad_4g: velocidad4g.trim(),
      velocidad_5g: velocidad5g.trim() || undefined,
      segmento,
      whatsapp_gratis: whatsappGratis,
      redes_sociales_gratis: redesSocialesGratis ? "Facebook, Instagram, TikTok" : "No incluido",
      llamadas_internacionales: "$0.15/min", // Valor por defecto
      roaming: roamingIncluido ? "500 MB (Sudamérica)" : "No incluido",
      activo,
      imagen_url: imagenUri || undefined,
    };

    // Solo agregar asesor_id si es creación nueva
    if (!planId && usuario?.id) {
      planData.asesor_id = usuario.id;
    }

    let resultado;
    if (planId) {
      resultado = await actualizarPlan(planId, planData);
    } else {
      resultado = await crearPlan(planData);
    }

    if (resultado.success) {
      Alert.alert(
        "Éxito",
        planId ? "Plan actualizado correctamente" : "Plan creado correctamente",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } else {
      Alert.alert("Error", resultado.error || "No se pudo guardar el plan");
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
    header: {
      paddingTop: 60,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.white,
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
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
    },
    titulo: {
      fontSize: fontSize.xxl,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
    },
    scroll: {
      flex: 1,
    },
    seccion: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.white,
    },
    tituloSeccion: {
      fontSize: fontSize.lg,
      fontWeight: "bold" as const,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: "600" as const,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: fontSize.md,
      color: colors.textPrimary,
      backgroundColor: colors.white,
    },
    inputMultilinea: {
      height: 80,
      textAlignVertical: "top" as const,
    },
    segmentos: {
      flexDirection: "row" as const,
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    botonSegmento: {
      flex: 1,
      padding: spacing.md,
      borderWidth: 2,
      borderRadius: borderRadius.md,
      alignItems: "center" as const,
    },
    botonSegmentoActivo: {
      backgroundColor: colors.background,
    },
    textoSegmento: {
      fontSize: fontSize.sm,
      fontWeight: "600" as const,
      color: colors.textSecondary,
    },
    switchItem: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    switchLabel: {
      fontSize: fontSize.md,
      color: colors.textPrimary,
      fontWeight: "500" as const,
    },
    botones: {
      flexDirection: "row" as const,
      gap: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.white,
    },
    botonEliminar: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      backgroundColor: "#FFFFFF",
      borderWidth: 2,
      borderColor: colors.secondary,
      borderRadius: borderRadius.sm,
    },
    textoEliminar: {
      fontSize: fontSize.sm,
      color: "#000000",
      fontWeight: "600" as const,
    },
    contenedorImagen: {
      alignItems: "center" as const,
      marginTop: spacing.sm,
    },
    imagenPreview: {
      width: "100%",
      height: 200,
      borderRadius: borderRadius.md,
      backgroundColor: colors.border,
    },
    botonesImagen: {
      flexDirection: "row" as const,
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    botonCambiarImagen: {
      flex: 1,
      padding: spacing.md,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      alignItems: "center" as const,
    },
    textoBotonImagen: {
      color: colors.white,
      fontSize: fontSize.sm,
      fontWeight: "600" as const,
    },
    botonEliminarImagen: {
      padding: spacing.md,
      backgroundColor: "#FFFFFF",
      borderWidth: 2,
      borderColor: "#000000",
      borderRadius: borderRadius.md,
      alignItems: "center" as const,
      paddingHorizontal: spacing.lg,
    },
    textoBotonEliminarImagen: {
      color: "#000000",
      fontSize: fontSize.sm,
      fontWeight: "600" as const,
    },
    botonAgregarImagen: {
      padding: spacing.xl,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed" as const,
      borderRadius: borderRadius.md,
      alignItems: "center" as const,
      marginTop: spacing.sm,
    },
    textoAgregarImagen: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      fontWeight: "600" as const,
    },
    botonCancelar: {
      flex: 1,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      backgroundColor: "#FFFFFF",
      borderWidth: 2,
      borderColor: "#000000",
    },
    textoCancelar: {
      color: "#000000",
      fontSize: fontSize.md,
      fontWeight: "600" as const,
    },
    botonActualizar: {
      flex: 1,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      backgroundColor: colors.primary,
    },
    textoActualizar: {
      color: "#FFFFFF",
      fontSize: fontSize.md,
      fontWeight: "600" as const,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
          <Text style={styles.textoVolver}>Volver</Text>
        </TouchableOpacity>
        <View style={styles.headerContenido}>
          <Text style={styles.titulo}>
            {planId ? "Editar Plan" : "Nuevo Plan"}
          </Text>
          {planId && (
            <TouchableOpacity onPress={handleEliminarPlan} style={styles.botonEliminar}>
              <Text style={styles.textoEliminar}>Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Imagen del Plan */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>🖼️ Imagen del Plan</Text>
          
          {imagenUri ? (
            <View style={styles.contenedorImagen}>
              <Image source={{ uri: imagenUri }} style={styles.imagenPreview} />
              <View style={styles.botonesImagen}>
                <TouchableOpacity
                  style={styles.botonCambiarImagen}
                  onPress={handleSeleccionarImagen}
                >
                  <Text style={styles.textoBotonImagen}>Cambiar Imagen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botonEliminarImagen}
                  onPress={handleEliminarImagen}
                >
                  <Text style={styles.textoBotonEliminarImagen}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.botonAgregarImagen}
              onPress={handleSeleccionarImagen}
            >
              <Text style={styles.textoAgregarImagen}>Agregar Imagen</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Información Básica */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>📋 Información Básica</Text>

          <Text style={styles.label}>Nombre del Plan *</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Plan Básico 5GB"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.inputMultilinea]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Describe las características principales..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Precio (USD) *</Text>
          <TextInput
            style={styles.input}
            value={precio}
            onChangeText={setPrecio}
            placeholder="15.99"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Segmento *</Text>
          <View style={styles.segmentos}>
            {(["basico", "medio", "premium"] as const).map((seg) => (
              <TouchableOpacity
                key={seg}
                style={[
                  styles.botonSegmento,
                  segmento === seg && styles.botonSegmentoActivo,
                  { borderColor: getColorSegmento(seg) },
                ]}
                onPress={() => setSegmento(seg)}
              >
                <Text
                  style={[
                    styles.textoSegmento,
                    segmento === seg && { color: getColorSegmento(seg) },
                  ]}
                >
                  {seg.charAt(0).toUpperCase() + seg.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Datos y Velocidad */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>📊 Datos y Velocidad</Text>

          <Text style={styles.label}>Datos GB *</Text>
          <TextInput
            style={styles.input}
            value={datosGb}
            onChangeText={setDatosGb}
            placeholder="Ej: 5GB o ILIMITADO"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Minutos *</Text>
          <TextInput
            style={styles.input}
            value={minutos}
            onChangeText={setMinutos}
            placeholder="Ej: 100 o ILIMITADO"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>SMS *</Text>
          <TextInput
            style={styles.input}
            value={sms}
            onChangeText={setSms}
            placeholder="Ej: 50 o ILIMITADO"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Velocidad 4G *</Text>
          <TextInput
            style={styles.input}
            value={velocidad4g}
            onChangeText={setVelocidad4g}
            placeholder="Ej: 10 Mbps"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Velocidad 5G (opcional)</Text>
          <TextInput
            style={styles.input}
            value={velocidad5g}
            onChangeText={setVelocidad5g}
            placeholder="Ej: 1 Gbps"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Beneficios Adicionales */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>🎁 Beneficios Adicionales</Text>

          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>WhatsApp Gratis</Text>
            <Switch
              value={whatsappGratis}
              onValueChange={setWhatsappGratis}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Redes Sociales Gratis</Text>
            <Switch
              value={redesSocialesGratis}
              onValueChange={setRedesSocialesGratis}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Roaming Incluido</Text>
            <Switch
              value={roamingIncluido}
              onValueChange={setRoamingIncluido}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Soporta 5G</Text>
            <Switch
              value={soporta5g}
              onValueChange={setSoporta5g}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Plan Activo</Text>
            <Switch
              value={activo}
              onValueChange={setActivo}
              trackColor={{ false: colors.border, true: colors.success }}
            />
          </View>
        </View>

        {/* Botones */}
        <View style={styles.botones}>
          <TouchableOpacity
            style={styles.botonCancelar}
            onPress={() => router.back()}
          >
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonActualizar}
            onPress={handleGuardar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoActualizar}>
                {planId ? "Actualizar" : "Crear Plan"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

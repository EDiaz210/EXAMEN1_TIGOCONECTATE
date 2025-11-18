import { useRouter, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { globalStyles } from '@/src/styles/globalStyles';
import { colors, spacing, fontSize, borderRadius } from '@/src/styles/theme';

export default function ModalScreen() {
  const router = useRouter();
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();

  const player = useVideoPlayer(videoUrl || '', (player) => {
    player.loop = false;
    player.play();
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Video Demostrativo</Text>
        <TouchableOpacity
          style={styles.botonCerrar}
          onPress={() => router.back()}
        >
          <Text style={styles.textoCerrar}>✕</Text>
        </TouchableOpacity>
      </View>

      {videoUrl ? (
        <VideoView
          player={player}
          style={styles.video}
          nativeControls
          contentFit="contain"
        />
      ) : (
        <View style={styles.containerError}>
          <Text style={styles.textoError}>No hay video disponible</Text>
        </View>
      )}

      <TouchableOpacity
        style={[globalStyles.button, globalStyles.buttonPrimary, styles.botonVolver]}
        onPress={() => router.back()}
      >
        <Text style={globalStyles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  titulo: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  botonCerrar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCerrar: {
    fontSize: fontSize.xl,
    color: colors.white,
    fontWeight: 'bold',
  },
  video: {
    flex: 1,
    backgroundColor: colors.black,
    borderRadius: borderRadius.md,
  },
  containerError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoError: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  botonVolver: {
    marginTop: spacing.lg,
  },
});

import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/**
 * Utilidades para seleccionar imágenes y videos
 */

/**
 * Solicitar permisos de cámara y galería
 */
export async function solicitarPermisos(): Promise<boolean> {
  if (Platform.OS !== 'web') {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos permisos de cámara y galería para esta funcionalidad'
      );
      return false;
    }
  }
  return true;
}

/**
 * Seleccionar foto de la galería
 */
export async function seleccionarFoto(): Promise<string | null> {
  try {
    const tienePermisos = await solicitarPermisos();
    if (!tienePermisos) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch {
    Alert.alert('Error', 'No se pudo seleccionar la foto');
    return null;
  }
}

/**
 * Tomar foto con la cámara
 */
export async function tomarFoto(): Promise<string | null> {
  try {
    const tienePermisos = await solicitarPermisos();
    if (!tienePermisos) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch {
    Alert.alert('Error', 'No se pudo tomar la foto');
    return null;
  }
}

/**
 * Seleccionar video de la galería
 */
export async function seleccionarVideo(): Promise<string | null> {
  try {
    const tienePermisos = await solicitarPermisos();
    if (!tienePermisos) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60, // Máximo 60 segundos
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch {
    Alert.alert('Error', 'No se pudo seleccionar el video');
    return null;
  }
}

/**
 * Grabar video con la cámara
 */
export async function grabarVideo(): Promise<string | null> {
  try {
    const tienePermisos = await solicitarPermisos();
    if (!tienePermisos) return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60, // Máximo 60 segundos
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch {
    Alert.alert('Error', 'No se pudo grabar el video');
    return null;
  }
}

/**
 * Mostrar opciones para seleccionar foto (galería o cámara)
 */
export async function mostrarOpcionesFoto(): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert(
      'Agregar Foto',
      'Selecciona de dónde quieres obtener la foto',
      [
        {
          text: '📷 Tomar Foto',
          onPress: async () => {
            const uri = await tomarFoto();
            resolve(uri);
          },
        },
        {
          text: '🖼️ Galería',
          onPress: async () => {
            const uri = await seleccionarFoto();
            resolve(uri);
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
}

/**
 * Mostrar opciones para seleccionar video (galería o cámara)
 */
export async function mostrarOpcionesVideo(): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert(
      'Agregar Video',
      'Selecciona de dónde quieres obtener el video',
      [
        {
          text: '🎥 Grabar Video',
          onPress: async () => {
            const uri = await grabarVideo();
            resolve(uri);
          },
        },
        {
          text: '📹 Galería',
          onPress: async () => {
            const uri = await seleccionarVideo();
            resolve(uri);
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
}

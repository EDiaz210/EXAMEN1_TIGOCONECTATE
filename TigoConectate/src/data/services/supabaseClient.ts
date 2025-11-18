import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import Constants from "expo-constants";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "❌ ERROR: Faltan variables de entorno.\n\n" +
    "Asegúrate de tener configuradas las variables:\n" +
    "- EXPO_PUBLIC_SUPABASE_URL\n" +
    "- EXPO_PUBLIC_SUPABASE_ANON_KEY\n\n" +
    "En eas.json o app.json (sección extra)."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // ✅ CAMBIO: Usar AsyncStorage para persistir sesión
    storage: AsyncStorage,
    
    autoRefreshToken: true,
    
    // ✅ CAMBIO: Activar persistencia
    persistSession: true,
    
    detectSessionInUrl: false,
  },
});
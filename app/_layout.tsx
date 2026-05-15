import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, Slot, useRouter, useSegments } from 'expo-router'; // Importamos o Slot e o GPS
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react'; // Memória e Gatilho
import { onAuthStateChanged } from 'firebase/auth'; // O Vigilante
import { auth } from '@/services/firebaseConfig'; // Nossas chaves
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins'

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<any>(null); // Memória do usuário
  const [initializing, setInitializing] = useState(true); // Memória de "carregando"
  const router = useRouter();
  const segments = useSegments(); // Diz em qual "pasta" o app está agora
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });

  // Aqui é onde ligamos o Vigilante do Firebase
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber; // Desliga o vigilante se o app fechar
  }, []);

    // A Lógica do "Vigilante de Rotas"
  useEffect(() => {
    if (initializing) return; // Espera o Firebase acordar
    
    const inAuthGroup = segments[0] === '(auth)'; // O segments[0] nos diz em qual "pasta" o app está agora

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login'); // Se NÃO tem usuário e NÃO estamos no login... manda pro Login!
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, initializing, fontsLoaded]); // Se TEM usuário mas ele tentou entrar no login... manda pra Home!

  if (initializing || !fontsLoaded) return null; // Enquanto o Firebase não responde OU as fontes não carregam, não mostra nada

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

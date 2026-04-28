import {
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import {
  WorkSans_400Regular,
  useFonts as useWorkSansFonts,
} from '@expo-google-fonts/work-sans';

export function useAppFonts() {
  const [interLoaded, interError] = useInterFonts({
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const [workSansLoaded, workSansError] = useWorkSansFonts({
    WorkSans_400Regular,
  });

  return {
    fontsLoaded: interLoaded && workSansLoaded,
    fontError: interError || workSansError,
  };
}

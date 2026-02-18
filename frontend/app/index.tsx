import { Redirect } from 'expo-router';
import { useAppStore } from '../lib/store';
import { LoadingScreen } from '../components/LoadingScreen';

export default function Index() {
  const user = useAppStore((s) => s.user);
  const isLoading = useAppStore((s) => s.isLoading);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // If no user, show welcome screen
  if (!user) {
    return <Redirect href="/welcome" />;
  }

  // If user exists, go to tabs
  return <Redirect href="/(tabs)" />;
}

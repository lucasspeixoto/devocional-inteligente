import BibleSplashScreen from '@/components/ui/SplashScreen';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

function NavigationStack() {
  const { isDark } = useTheme();
  
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}

function RootContent() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <BibleSplashScreen />;
  }

  return <NavigationStack />;
}

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <ThemeProvider>
        <RootContent />
      </ThemeProvider>
    </DatabaseProvider>
  );
}

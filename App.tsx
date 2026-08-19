import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { useHydrateStores } from './src/hooks/useHydrateStores';
import { useThemeStore } from './src/store/themeStore';
import { colors } from './src/theme';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  const hydrated = useHydrateStores();
  const activeTheme = (theme && colors[theme]) ? theme : 'light';
  const activeColors = colors[activeTheme];

  if (!hydrated) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.light.background }]}>
        <ActivityIndicator color={colors.light.accent} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: activeColors.background }}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={activeColors.card} />
        <RootNavigator />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ============================================================
//  App.tsx
//  エントリーポイント
// ============================================================

import './global.css';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { GameScreen } from './src/screens/GameScreen';
import { StartScreen } from './src/screens/StartScreen';

type Screen = 'start' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {screen === 'start' ? (
        <StartScreen
          onStart={() => setScreen('game')}
          onContinue={() => setScreen('game')}
        />
      ) : (
        <GameScreen />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
});

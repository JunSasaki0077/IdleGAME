// ============================================================
//  App.tsx
//  エントリーポイント
// ============================================================

import './global.css';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { GameScreen } from './src/screens/GameScreen';
import { StartScreen } from './src/screens/StartScreen';
import { INITIAL_PERMANENT, type PermanentData } from './src/state/permanentState';
import { loadPermanent, savePermanent } from './src/utils/storage';

type Screen = 'start' | 'game';

export default function App() {
  const [screen, setScreen]       = useState<Screen>('start');
  const [permanent, setPermanent] = useState<PermanentData>(INITIAL_PERMANENT);

  // 永続データをロード
  useEffect(() => {
    loadPermanent().then(setPermanent);
  }, []);

  const handlePermanentUpdate = (data: PermanentData) => {
    setPermanent(data);
    savePermanent(data).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {screen === 'start' ? (
        <StartScreen
          permanent={permanent}
          onPermanentUpdate={handlePermanentUpdate}
          onStart={() => setScreen('game')}
          onContinue={() => setScreen('game')}
        />
      ) : (
        <GameScreen
          permanent={permanent}
          onPermanentUpdate={handlePermanentUpdate}
          onGoToStart={() => setScreen('start')}
        />
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

// ============================================================
//  screens/StartScreen.tsx
//  タイトル画面
// ============================================================

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { deleteSave, loadGame } from '../utils/storage';
import { LabModal } from '../components/LabModal';
import { purchasePermanentUpgrade, type PermanentData } from '../state/permanentState';

type Props = {
  permanent: PermanentData;
  onPermanentUpdate: (data: PermanentData) => void;
  onStart: () => void;    // 新規ゲーム
  onContinue: () => void; // 続きから
};

export const StartScreen: React.FC<Props> = ({ permanent, onPermanentUpdate, onStart, onContinue }) => {
  const [hasSave, setHasSave]     = useState(false);
  const [showLab, setShowLab]     = useState(false);
  const glowAnim                  = React.useRef(new Animated.Value(0)).current;

  // セーブデータの有無を確認
  useEffect(() => {
    loadGame().then((data) => setHasSave(data !== null));
  }, []);

  // タイトルロゴのゆらぎアニメーション
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [glowAnim]);

  const logoOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });

  const handleNewGame = () => {
    deleteSave().then(onStart);
  };

  const handleLabPurchase = (upgradeId: string) => {
    const updated = purchasePermanentUpgrade(permanent, upgradeId);
    if (updated) onPermanentUpdate(updated);
  };

  const handleSelectStage = (stageId: number) => {
    onPermanentUpdate({ ...permanent, currentStage: stageId });
  };

  return (
    <View className="flex-1 bg-[#07071a] items-center justify-center gap-0">

      {/* 背景の星 */}
      <View className="absolute inset-0">
        {STARS.map((s, i) => (
          <Text
            key={i}
            style={{ position: 'absolute', top: s.top, left: s.left, fontSize: s.size, opacity: s.opacity }}
          >
            ✦
          </Text>
        ))}
      </View>

      {/* タイトルロゴ */}
      <Animated.View style={{ opacity: logoOpacity }} className="items-center mb-16">
        <Text style={{ fontSize: 64 }}>⚔️</Text>
        <Text
          className="font-mono font-bold tracking-[6px] mt-3"
          style={{ fontSize: 28, color: '#c084fc' }}
        >
          IDLE RPG
        </Text>
        <Text className="font-mono text-[11px] tracking-[3px] mt-1" style={{ color: 'rgba(160,130,255,0.5)' }}>
          — ENDLESS BATTLE —
        </Text>
      </Animated.View>

      {/* ボタン群 */}
      <View className="gap-3 w-56">
        {hasSave && (
          <Pressable
            className="bg-[#6d28d9] rounded-xl py-4 items-center border border-[#9f67ff]"
            onPress={onContinue}
          >
            <Text className="text-white font-bold text-base tracking-widest">続きから</Text>
          </Pressable>
        )}

        <Pressable
          className="rounded-xl py-4 items-center border border-[#4a3060]"
          style={{ backgroundColor: hasSave ? '#1a0f2e' : '#6d28d9' }}
          onPress={hasSave ? handleNewGame : onContinue}
        >
          <Text
            className="font-bold text-base tracking-widest"
            style={{ color: hasSave ? '#9f67ff' : '#fff' }}
          >
            はじめる
          </Text>
        </Pressable>

        {/* ラボボタン */}
        <Pressable
          className="rounded-xl py-3.5 items-center border border-[#2a2a4a] flex-row justify-center gap-2"
          style={{ backgroundColor: '#07071a' }}
          onPress={() => setShowLab(true)}
        >
          <Text className="font-bold text-sm tracking-widest" style={{ color: '#9f67ff' }}>
            🔬 ラボ
          </Text>
          {permanent.gems > 0 && (
            <View className="bg-[#1a0f2e] border border-[#4a3060] rounded-full px-2 py-0.5">
              <Text className="font-mono text-[9px] text-yellow-300">💎 {permanent.gems}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* フッター */}
      <Text className="absolute bottom-8 font-mono text-[9px] tracking-[2px]" style={{ color: 'rgba(100,80,150,0.4)' }}>
        v1.0.0
      </Text>

      {/* ラボモーダル */}
      <LabModal
        visible={showLab}
        permanent={permanent}
        onPurchase={handleLabPurchase}
        onSelectStage={handleSelectStage}
        onClose={() => setShowLab(false)}
      />

    </View>
  );
};

// 固定の星の位置
const STARS = [
  { top: '8%',  left: '12%', size: 6,  opacity: 0.4 },
  { top: '15%', left: '75%', size: 4,  opacity: 0.3 },
  { top: '22%', left: '40%', size: 5,  opacity: 0.25 },
  { top: '5%',  left: '55%', size: 7,  opacity: 0.35 },
  { top: '30%', left: '88%', size: 4,  opacity: 0.3 },
  { top: '12%', left: '28%', size: 5,  opacity: 0.2 },
  { top: '40%', left: '6%',  size: 6,  opacity: 0.25 },
  { top: '18%', left: '92%', size: 4,  opacity: 0.35 },
  { top: '72%', left: '15%', size: 5,  opacity: 0.2 },
  { top: '78%', left: '82%', size: 6,  opacity: 0.25 },
  { top: '85%', left: '50%', size: 4,  opacity: 0.3 },
  { top: '65%', left: '92%', size: 5,  opacity: 0.2 },
] as const;

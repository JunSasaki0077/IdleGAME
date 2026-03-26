// ============================================================
//  components/RunOverModal.tsx
//  ランオーバー（HP=0 or リタイア）時の結果画面
// ============================================================

import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';

type Props = {
  visible: boolean;
  waveReached: number;
  gemsEarned: number;
  onRetry: () => void;
  onGoToLab: () => void;
};

export const RunOverModal: React.FC<Props> = React.memo(({ visible, waveReached, gemsEarned, onRetry, onGoToLab }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View className="flex-1 bg-black/75 items-center justify-center px-6">
      <View
        className="w-full rounded-2xl border-2 border-[#4a3060] px-6 py-8 items-center gap-4"
        style={{ backgroundColor: '#0d0d20' }}
      >
        {/* タイトル */}
        <Text style={{ fontSize: 48 }}>💀</Text>
        <Text className="font-mono font-bold text-xl tracking-widest text-white">RUN OVER</Text>

        {/* 結果 */}
        <View className="w-full bg-[#07071a] rounded-xl px-4 py-4 gap-2 mt-2 border border-[#2a2a4a]">
          <View className="flex-row justify-between items-center">
            <Text className="text-[#9f67ff] text-sm font-bold">到達ウェーブ</Text>
            <Text className="text-white font-mono font-bold text-base">WAVE {waveReached}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-[#9f67ff] text-sm font-bold">獲得ジェム</Text>
            <Text className="text-yellow-300 font-mono font-bold text-base">💎 {gemsEarned}</Text>
          </View>
        </View>

        {/* ボタン */}
        <View className="w-full gap-3 mt-2">
          <Pressable
            className="bg-[#6d28d9] rounded-xl py-4 items-center border border-[#9f67ff]"
            onPress={onRetry}
          >
            <Text className="text-white font-bold text-base tracking-widest">▶ リトライ</Text>
          </Pressable>

          <Pressable
            className="rounded-xl py-4 items-center border border-[#4a3060]"
            style={{ backgroundColor: '#1a0f2e' }}
            onPress={onGoToLab}
          >
            <Text className="font-bold text-base tracking-widest" style={{ color: '#9f67ff' }}>
              🔬 ラボへ
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
));

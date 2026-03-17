// ============================================================
//  components/status/GoldDisplay.tsx
//  Gold残高と獲得レートの表示
// ============================================================

import React from 'react';
import { View, Text } from 'react-native';
import { formatNumber } from '../../utils/format';

// ─────────────────────────────────────────
//  Props
// ─────────────────────────────────────────

type Props = {
  gold: number;
  goldPerSec: number;
};

// ─────────────────────────────────────────
//  コンポーネント
// ─────────────────────────────────────────

export const GoldDisplay: React.FC<Props> = React.memo(({ gold, goldPerSec }) => {
  return (
    <View className="bg-[#1a1500] border border-[#3a3000] rounded-lg py-1.5 px-3 items-end">
      <Text className="font-mono text-[13px] text-[#f0c040] font-bold">
        🪙 {formatNumber(gold)}
      </Text>
      <Text className="text-[10px] text-[#8a7020] mt-0.5">
        +{formatNumber(goldPerSec)}/s
      </Text>
    </View>
  );
}, (prev, next) => {
  return (
    Math.floor(prev.gold) === Math.floor(next.gold) &&
    prev.goldPerSec === next.goldPerSec
  );
});

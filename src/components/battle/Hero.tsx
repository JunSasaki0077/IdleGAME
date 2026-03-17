// ============================================================
//  components/battle/Hero.tsx
//  主人公キャラクターの表示
//  - 攻撃エフェクト（スケールアップ + 剣閃）
//  - ダメージエフェクト（赤フラッシュ）
// ============================================================

import React from 'react';
import { View, Text } from 'react-native';
import { GAME_CONFIG } from '../../constants/gameConfig';

type Props = {
  emoji: string;
  isAttacking: boolean;
  isHit: boolean;
};

export const Hero: React.FC<Props> = React.memo(({ emoji, isAttacking, isHit }) => {
  return (
    <View
      className="absolute bottom-[45%] items-center z-10"
      style={{ left: `${GAME_CONFIG.HERO_POSITION_X}%` }}
    >
      {/* ダメージ受けオーバーレイ */}
      {isHit && (
        <View
          className="absolute w-[50px] h-[50px] rounded-full z-[11]"
          style={{ backgroundColor: 'rgba(255, 50, 50, 0.45)' }}
        />
      )}

      {/* 主人公スプライト */}
      <Text
        className="text-4xl"
        style={{
          transform: [
            ...(isAttacking ? [{ scale: 1.25 }, { translateX: 6 }] : []),
            ...(isHit ? [{ translateX: -4 }] : []),
          ],
          opacity: isHit ? 0.5 : 1,
        }}
      >
        {emoji}
      </Text>

      {/* 攻撃エフェクト（剣閃） */}
      {isAttacking && (
        <Text className="absolute -right-6 top-1 text-2xl">⚡</Text>
      )}

    </View>
  );
}, (prev, next) => {
  return (
    prev.emoji === next.emoji &&
    prev.isAttacking === next.isAttacking &&
    prev.isHit === next.isHit
  );
});

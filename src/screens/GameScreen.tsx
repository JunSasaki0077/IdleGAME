// ============================================================
//  screens/GameScreen.tsx
//  ゲーム画面全体のレイアウト
//  BattleField（上）+ StatusPanel（下）を縦に並べる
// ============================================================

import React from 'react';
import { View } from 'react-native';
import { BattleField } from '../components/battle/BattleField';
import { StatusPanel } from '../components/status/StatusPanel';
import { useGameLoop } from '../state/useGameLoop';

// ─────────────────────────────────────────
//  コンポーネント
// ─────────────────────────────────────────

export const GameScreen: React.FC = () => {
  const { state, upgrades, damageNumbers, isAttacking, isHit, buyUpgrade } = useGameLoop();

  return (
    <View className="flex-1 bg-game-dark">
      {/* 上部：戦闘フィールド */}
      <BattleField
        state={state}
        damageNumbers={damageNumbers}
        isAttacking={isAttacking}
        isHit={isHit}
      />

      {/* 下部：ステータス・アップグレード */}
      <StatusPanel
        state={state}
        upgrades={upgrades}
        onBuy={buyUpgrade}
      />


    </View>
  );
};

// ============================================================
//  components/status/UpgradeList.tsx
//  アップグレード一覧と購入ボタン
// ============================================================

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { formatNumber } from '../../utils/format';
import type { Upgrade } from '../../types/gameTypes';

// ─────────────────────────────────────────
//  Props
// ─────────────────────────────────────────

type Props = {
  upgrades: Upgrade[];
  gold: number;
  onBuy: (id: string) => void;
};

// ─────────────────────────────────────────
//  個別アップグレードアイテム
// ─────────────────────────────────────────

const UpgradeItem: React.FC<{
  upgrade: Upgrade;
  canAfford: boolean;
  currentCost: number;
  onBuy: (id: string) => void;
}> = React.memo(({ upgrade, canAfford, currentCost, onBuy }) => {
  return (
    <TouchableOpacity
      className={`flex-row items-center gap-2.5 bg-[#0d0d20] border border-[#2a2a4a] rounded-lg py-2 px-3 mb-1.5 ${
        !canAfford ? 'opacity-35' : ''
      }`}
      onPress={() => onBuy(upgrade.id)}
      disabled={!canAfford}
      activeOpacity={0.7}
    >
      {/* アイコン */}
      <Text className="text-xl">{upgrade.icon}</Text>

      {/* 名前・説明 */}
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-0.5">
          <Text className="text-xs font-bold text-game-text">{upgrade.name}</Text>
          {upgrade.level > 0 && (
            <View className="bg-game-purple-dark border border-game-purple rounded px-1 py-0.5">
              <Text className="font-mono text-[8px] text-game-purple-light">Lv{upgrade.level}</Text>
            </View>
          )}
        </View>
        <Text className="text-[10px] text-[#6666aa]">{upgrade.desc}</Text>
      </View>

      {/* コスト */}
      <Text
        className={`font-mono text-[11px] font-bold ${
          canAfford ? 'text-[#f0c040]' : 'text-[#6666aa]'
        }`}
      >
        🪙{formatNumber(currentCost)}
      </Text>
    </TouchableOpacity>
  );
}, (prev, next) => {
  return (
    prev.upgrade.id === next.upgrade.id &&
    prev.upgrade.level === next.upgrade.level &&
    prev.canAfford === next.canAfford
  );
});

// ─────────────────────────────────────────
//  メインコンポーネント
// ─────────────────────────────────────────

export const UpgradeList: React.FC<Props> = React.memo(({ upgrades, gold, onBuy }) => {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {upgrades.map((u) => {
        const currentCost = Math.floor(
          u.baseCost * Math.pow(GAME_CONFIG.UPGRADE_COST_MULTIPLIER, u.level)
        );
        return (
          <UpgradeItem
            key={u.id}
            upgrade={u}
            canAfford={gold >= currentCost}
            currentCost={currentCost}
            onBuy={onBuy}
          />
        );
      })}
    </ScrollView>
  );
}, (prev, next) => {
  return (
    prev.upgrades === next.upgrades &&
    Math.floor(prev.gold / 10) === Math.floor(next.gold / 10)
  );
});

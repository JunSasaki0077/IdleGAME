// ============================================================
//  components/status/UpgradeList.tsx
//  アップグレード一覧と購入ボタン
// ============================================================

import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
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

type ItemProps = {
  upgrade: Upgrade;
  canAfford: boolean;
  onBuy: (id: string) => void;
};

const UpgradeItem: React.FC<ItemProps> = React.memo(({ upgrade, canAfford, onBuy }) => (
  <Pressable
    className={`flex-row items-center gap-2.5 bg-[#0d0d20] border border-[#2a2a4a] rounded-lg py-2 px-3 mb-1.5 ${
      !canAfford ? 'opacity-35' : ''
    }`}
    onPress={() => onBuy(upgrade.id)}
    disabled={!canAfford}
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
      🪙{formatNumber(upgrade.cost)}
    </Text>
  </Pressable>
), (prev, next) => (
  prev.upgrade.id    === next.upgrade.id &&
  prev.upgrade.level === next.upgrade.level &&
  prev.upgrade.cost  === next.upgrade.cost &&
  prev.canAfford     === next.canAfford
));

// ─────────────────────────────────────────
//  FlatListに渡すアイテムデータ型
// ─────────────────────────────────────────

type UpgradeListItem = {
  upgrade: Upgrade;
  canAfford: boolean;
};

// ─────────────────────────────────────────
//  メインコンポーネント
// ─────────────────────────────────────────

export const UpgradeList: React.FC<Props> = React.memo(({ upgrades, gold, onBuy }) => {
  const items: UpgradeListItem[] = useMemo(() =>
    upgrades.map((u) => ({ upgrade: u, canAfford: gold >= u.cost })),
    [upgrades, gold]
  );

  const renderItem = useCallback(({ item }: { item: UpgradeListItem }) => (
    <UpgradeItem
      upgrade={item.upgrade}
      canAfford={item.canAfford}
      onBuy={onBuy}
    />
  ), [onBuy]);

  const keyExtractor = useCallback((item: UpgradeListItem) => item.upgrade.id, []);

  return (
    <FlatList
      className="flex-1"
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
}, (prev, next) => (
  prev.upgrades === next.upgrades &&
  Math.floor(prev.gold / 10) === Math.floor(next.gold / 10)
));

// ============================================================
//  components/status/StatusPanel.tsx
//  下部ステータスパネル全体
//  アップグレード / スキル タブ切り替え対応
// ============================================================

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ResourceBar } from './ResourceBar';
import { GoldDisplay } from './GoldDisplay';
import { UpgradeList } from './UpgradeList';
import { AcquiredSkillList } from './AcquiredSkillList';
import { getCurrentClass } from '../../state/gameState';
import type { GameState } from '../../state/gameState';
import type { Upgrade } from '../../types/gameTypes';

type Tab = 'upgrade' | 'skill';

type Props = {
  state: GameState;
  upgrades: Upgrade[];
  onBuy: (id: string) => void;
};

export const StatusPanel: React.FC<Props> = ({ state, upgrades, onBuy }) => {
  const [tab, setTab] = useState<Tab>('upgrade');
  const currentClass = getCurrentClass(state.level);

  return (
    <View className="flex-1 bg-game-dark px-3.5 pt-2.5 pb-2 gap-2 border-t-2 border-game-border">

      {/* ── 上段：キャラ情報 + Gold ── */}
      <View className="flex-row items-center gap-2.5">
        {/* ポートレート */}
        <View className="w-[46px] h-[46px] bg-game-darker border-2 border-game-border-light rounded-lg items-center justify-center relative">
          <Text className="text-2xl">{currentClass.emoji}</Text>
          <View className="absolute -bottom-1.5 -right-1.5 bg-game-purple-dark border border-game-purple rounded px-1 py-0.5">
            <Text className="font-mono text-[8px] text-game-purple-light">Lv{state.level}</Text>
          </View>
        </View>

        {/* 名前・クラス */}
        <View className="flex-1">
          <Text className="font-mono text-[11px] text-game-text font-bold mb-0.5">ALBERT</Text>
          <Text className="text-[11px] text-game-text-muted">{currentClass.name}</Text>
        </View>

        {/* Gold */}
        <GoldDisplay gold={state.gold} goldPerSec={state.goldPerSec} />
      </View>

      {/* ── 中段：HP・XPバー ── */}
      <View className="gap-1">
        <ResourceBar icon="❤️" current={state.hp}  max={state.maxHp} color="#e74c3c" />
        <ResourceBar icon="⭐" current={state.xp}  max={state.maxXp} color="#2ecc71" />
      </View>

      {/* ── タブ切り替え ── */}
      <View className="flex-row gap-1">
        <Pressable
          className={`flex-1 items-center py-1.5 rounded-lg border ${
            tab === 'upgrade'
              ? 'bg-game-purple-dark border-game-purple'
              : 'bg-transparent border-[#2a2a4a]'
          }`}
          onPress={() => setTab('upgrade')}
        >
          <Text className={`text-xs font-bold ${tab === 'upgrade' ? 'text-game-purple-light' : 'text-[#6666aa]'}`}>
            ⚔️ アップグレード
          </Text>
        </Pressable>

        <Pressable
          className={`flex-1 items-center py-1.5 rounded-lg border ${
            tab === 'skill'
              ? 'bg-game-purple-dark border-game-purple'
              : 'bg-transparent border-[#2a2a4a]'
          }`}
          onPress={() => setTab('skill')}
        >
          <Text className={`text-xs font-bold ${tab === 'skill' ? 'text-game-purple-light' : 'text-[#6666aa]'}`}>
            ✨ スキル {state.acquiredSkills.length > 0 ? `(${state.acquiredSkills.length})` : ''}
          </Text>
        </Pressable>
      </View>

      {/* ── 下段：タブコンテンツ ── */}
      {tab === 'upgrade' ? (
        <UpgradeList upgrades={upgrades} gold={state.gold} onBuy={onBuy} />
      ) : (
        <AcquiredSkillList acquiredSkills={state.acquiredSkills} />
      )}

    </View>
  );
};

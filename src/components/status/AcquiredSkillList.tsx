// ============================================================
//  components/status/AcquiredSkillList.tsx
//  習得済みスキルの一覧表示
// ============================================================

import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { getSkillDef } from '../../constants/skillData';
import type { AcquiredSkill } from '../../types/skillTypes';

type Props = {
  acquiredSkills: AcquiredSkill[];
};

const SkillItem: React.FC<{ skill: AcquiredSkill }> = React.memo(({ skill }) => {
  const def = getSkillDef(skill.defId);
  if (!def) return null;

  const effect = def.getEffect(skill.skillLv);
  const effectText = effect.atkMultiplier
    ? `攻撃力 ×${effect.atkMultiplier.toFixed(1)}`
    : effect.chainCount
    ? `チェーン ${effect.chainCount}回`
    : effect.slowAmount
    ? `スロウ ${Math.round((effect.slowAmount ?? 0) * 100)}%`
    : '';

  return (
    <View className="flex-row items-center gap-3 bg-[#0d0d20] border border-[#2a2a4a] rounded-lg py-2.5 px-3 mb-1.5">
      <Text className="text-3xl">{def.icon}</Text>
      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-0.5">
          <Text className="text-xs font-bold text-game-text">{def.name}</Text>
          <View className="bg-game-purple-dark border border-game-purple rounded px-1 py-0.5">
            <Text className="font-mono text-[8px] text-game-purple-light">Lv{skill.skillLv}</Text>
          </View>
        </View>
        <Text className="text-[10px] text-[#6666aa]">{def.desc}</Text>
      </View>
      {effectText ? (
        <Text className="font-mono text-[10px] text-yellow-300 font-bold">{effectText}</Text>
      ) : null}
    </View>
  );
});

export const AcquiredSkillList: React.FC<Props> = React.memo(({ acquiredSkills }) => {
  if (acquiredSkills.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-2">
        <Text className="text-4xl">✨</Text>
        <Text className="text-[#6666aa] text-xs text-center">
          レベルアップするとスキルを習得できます
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1"
      data={acquiredSkills}
      keyExtractor={(item) => item.defId}
      renderItem={({ item }) => <SkillItem skill={item} />}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
}, (prev, next) => {
  if (prev.acquiredSkills.length !== next.acquiredSkills.length) return false;
  return prev.acquiredSkills.every((s, i) =>
    s.defId === next.acquiredSkills[i].defId &&
    s.skillLv === next.acquiredSkills[i].skillLv
  );
});

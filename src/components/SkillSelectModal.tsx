// ============================================================
//  components/SkillSelectModal.tsx
//  レベルアップ時のスキル選択モーダル
// ============================================================

import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import type { SkillDef } from '../types/skillTypes';

type Props = {
  choices: SkillDef[];
  acquiredIds: string[];
  onSelect: (skillDefId: string) => void;
};

export const SkillSelectModal: React.FC<Props> = React.memo(({ choices, acquiredIds, onSelect }) => (
  <Modal transparent animationType="fade" visible>
    <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <View className="w-80 rounded-2xl border-2 border-yellow-400 p-5 items-center" style={{ backgroundColor: '#0f0f2e' }}>

        {/* タイトル */}
        <Text className="text-yellow-300 text-xl font-bold mb-1">⬆ LEVEL UP!</Text>
        <Text className="text-[#a0a0c0] text-xs mb-5">スキルを1つ選んでください</Text>

        {/* スキル選択肢 */}
        {choices.map((skill) => {
          const isUpgrade = acquiredIds.includes(skill.id);
          return (
            <Pressable
              key={skill.id}
              className="w-full bg-[#1a1a3e] border border-[#3a3a6e] rounded-xl p-4 mb-3 flex-row items-center gap-3"
              onPress={() => onSelect(skill.id)}
            >
              {/* アイコン */}
              <Text className="text-4xl">{skill.icon}</Text>

              {/* 説明 */}
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-0.5">
                  <Text className="text-white font-bold text-sm">{skill.name}</Text>
                  {isUpgrade && (
                    <View className="bg-yellow-600 rounded px-1.5 py-0.5">
                      <Text className="text-yellow-100 text-[9px] font-bold">レベルUP</Text>
                    </View>
                  )}
                </View>
                <Text className="text-[#8080b0] text-xs">{skill.desc}</Text>
              </View>

              {/* 矢印 */}
              <Text className="text-[#6060a0] text-lg">›</Text>
            </Pressable>
          );
        })}

      </View>
    </View>
  </Modal>
));

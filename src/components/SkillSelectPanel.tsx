// ============================================================
//  components/SkillSelectPanel.tsx
//  レベルアップ時のスキル選択（The Towerスタイル）
//  画面下からスライドアップ、ゲームは背後で動き続ける
// ============================================================

import React, { useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { SkillDef } from '../types/skillTypes';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type Props = {
  choices: SkillDef[];
  acquiredIds: string[];
  onSelect: (skillDefId: string) => void;
};

export const SkillSelectPanel: React.FC<Props> = React.memo(({ choices, acquiredIds, onSelect }) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    overlayOpacity.value = withTiming(1, { duration: 200 });
  }, []);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View className="absolute inset-0" pointerEvents="box-none">
      {/* 半透明オーバーレイ（ゲームが透けて見える） */}
      <Animated.View
        style={[overlayStyle, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' }]}
        pointerEvents="none"
      />

      {/* カードパネル（下からスライドアップ） */}
      <Animated.View
        style={[panelStyle, { position: 'absolute', left: 0, right: 0, bottom: 0 }]}
      >
        <View className="px-3 pb-6 pt-4" style={{ backgroundColor: '#0a0a1e' }}>
          {/* ヘッダー */}
          <View className="items-center mb-4">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-yellow-300 text-base font-bold tracking-widest">⬆ LEVEL UP</Text>
            </View>
            <Text className="text-[#5555aa] text-[10px] tracking-wider">スキルを選択</Text>
          </View>

          {/* カード横並び */}
          <View className="flex-row gap-2">
            {choices.map((skill) => {
              const isUpgrade = acquiredIds.includes(skill.id);
              return (
                <Pressable
                  key={skill.id}
                  className="flex-1 rounded-2xl p-3 items-center"
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? '#2a2a5e' : '#141430',
                    borderWidth: 1.5,
                    borderColor: isUpgrade ? '#c8a000' : '#2a2a6e',
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}
                  onPress={() => onSelect(skill.id)}
                >
                  {/* アップグレードバッジ */}
                  {isUpgrade && (
                    <View className="absolute top-2 right-2 bg-yellow-600 rounded px-1 py-0.5">
                      <Text className="text-yellow-100 text-[8px] font-bold">UP</Text>
                    </View>
                  )}

                  {/* アイコン */}
                  <Text style={{ fontSize: 36 }}>{skill.icon}</Text>

                  {/* スキル名 */}
                  <Text className="text-white font-bold text-xs mt-2 text-center" numberOfLines={1}>
                    {skill.name}
                  </Text>

                  {/* 説明 */}
                  <Text className="text-[#6666aa] text-[9px] mt-1 text-center leading-3" numberOfLines={2}>
                    {skill.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
});

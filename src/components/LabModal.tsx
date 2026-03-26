// ============================================================
//  components/LabModal.tsx
//  永続強化（ラボ）UI
// ============================================================

import React from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { PERMANENT_UPGRADES, type PermanentData } from '../state/permanentState';

type Props = {
  visible: boolean;
  permanent: PermanentData;
  onPurchase: (upgradeId: string) => void;
  onClose: () => void;
};

export const LabModal: React.FC<Props> = ({ visible, permanent, onPurchase, onClose }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View className="flex-1 bg-black/80 justify-end">
      <View
        className="rounded-t-3xl border-t-2 border-[#4a3060] px-5 pt-6 pb-8"
        style={{ backgroundColor: '#0d0d20' }}
      >
        {/* ヘッダー */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="font-mono font-bold text-lg text-white tracking-widest">🔬 ラボ</Text>
            <Text className="text-[#6666aa] text-xs mt-0.5">ランを超えて持続する永続強化</Text>
          </View>
          <View className="flex-row items-center gap-2 bg-[#1a0f2e] border border-[#4a3060] rounded-xl px-3 py-2">
            <Text className="text-yellow-300 font-mono font-bold text-base">💎 {permanent.gems}</Text>
          </View>
        </View>

        {/* 強化リスト */}
        <FlatList
          data={PERMANENT_UPGRADES}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const currentLv  = permanent.upgrades[item.id] ?? 0;
            const atMaxLv    = currentLv >= item.maxLv;
            const cost       = item.gemCost(currentLv);
            const canAfford  = permanent.gems >= cost;

            return (
              <View className="flex-row items-center gap-3 bg-[#07071a] border border-[#2a2a4a] rounded-xl py-3 px-3 mb-2">
                <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-0.5">
                    <Text className="text-xs font-bold text-white">{item.name}</Text>
                    <View className="bg-[#1a0f2e] border border-[#4a3060] rounded px-1 py-0.5">
                      <Text className="font-mono text-[8px] text-[#9f67ff]">Lv{currentLv}/{item.maxLv}</Text>
                    </View>
                  </View>
                  <Text className="text-[10px] text-[#6666aa]">{item.desc}</Text>
                </View>

                {atMaxLv ? (
                  <View className="rounded px-2 py-1.5 border border-[#2a2a4a]">
                    <Text className="font-mono text-[9px] text-[#4a4a7a]">MAX</Text>
                  </View>
                ) : (
                  <Pressable
                    className={`rounded-lg px-3 py-1.5 border ${
                      canAfford ? 'bg-[#1a0f2e] border-[#9f67ff]' : 'border-[#2a2a4a] opacity-40'
                    }`}
                    onPress={() => canAfford && onPurchase(item.id)}
                    disabled={!canAfford}
                  >
                    <Text className="font-mono text-[9px] text-yellow-300">💎 {cost}</Text>
                  </Pressable>
                )}
              </View>
            );
          }}
        />

        {/* 閉じるボタン */}
        <Pressable
          className="mt-3 rounded-xl py-3.5 items-center border border-[#2a2a4a]"
          style={{ backgroundColor: '#07071a' }}
          onPress={onClose}
        >
          <Text className="text-[#6666aa] font-bold text-sm tracking-widest">閉じる</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

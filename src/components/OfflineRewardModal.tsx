// ============================================================
//  components/OfflineRewardModal.tsx
//  オフライン放置報酬を表示するモーダル
// ============================================================

import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import type { OfflineReward } from '../utils/offlineRewards';
import { formatOfflineTime } from '../utils/offlineRewards';
import { formatNumber } from '../utils/format';

type Props = {
  reward: OfflineReward;
  onClaim: () => void;
};

export const OfflineRewardModal: React.FC<Props> = React.memo(({ reward, onClaim }) => (
  <Modal transparent animationType="fade" visible>
    {/* 背景オーバーレイ */}
    <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <View className="w-72 rounded-2xl border-2 border-[#6d28d9] p-6 items-center" style={{ backgroundColor: '#0f0f2e' }}>

        {/* タイトル */}
        <Text className="text-yellow-300 text-xl font-bold mb-1">おかえりなさい！</Text>
        <Text className="text-[#a0a0c0] text-xs mb-5">
          {formatOfflineTime(reward.seconds)}の間、放置していました
        </Text>

        {/* 報酬内容 */}
        <View className="w-full bg-[#1a1a3e] rounded-xl p-4 mb-5 gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-[#a0a0c0] text-sm">💰 ゴールド</Text>
            <Text className="text-yellow-300 text-base font-bold">+{formatNumber(reward.gold)}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-[#a0a0c0] text-sm">✨ 経験値</Text>
            <Text className="text-purple-300 text-base font-bold">+{formatNumber(reward.xp)}</Text>
          </View>
          <Text className="text-[#606080] text-[10px] text-center mt-1">
            ※オフライン効率 50%
          </Text>
        </View>

        {/* 受け取るボタン */}
        <Pressable
          className="w-full bg-[#6d28d9] rounded-xl py-3 items-center"
          onPress={onClaim}
        >
          <Text className="text-white font-bold text-base">受け取る</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
));

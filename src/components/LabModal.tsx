// ============================================================
//  components/LabModal.tsx
//  永続強化（ラボ）UI
// ============================================================

import React from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { PERMANENT_UPGRADES, STAGE_DEFS, type PermanentData } from '../state/permanentState';

type Props = {
  visible: boolean;
  permanent: PermanentData;
  onPurchase: (upgradeId: string) => void;
  onSelectStage: (stageId: number) => void;
  onClose: () => void;
};

// ─────────────────────────────────────────
//  ステージカード
// ─────────────────────────────────────────

type StageCardProps = {
  stage: (typeof STAGE_DEFS)[number];
  selected: boolean;
  unlocked: boolean;
  onPress: () => void;
};

const StageCard: React.FC<StageCardProps> = ({ stage, selected, unlocked, onPress }) => (
  <Pressable
    onPress={onPress}
    disabled={!unlocked}
    style={{ flex: 1, minWidth: '28%' }}
  >
    <View
      className="rounded-2xl items-center py-3 px-1"
      style={{
        backgroundColor: selected ? '#1e0f3a' : unlocked ? '#0a0a1a' : '#060610',
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? '#9f67ff' : unlocked ? '#2a2a4a' : '#12122a',
        opacity: unlocked ? 1 : 0.45,
        shadowColor: selected ? '#9f67ff' : 'transparent',
        shadowOpacity: selected ? 0.6 : 0,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: selected ? 6 : 0,
      }}
    >
      {/* 選択中インジケーター */}
      {selected && (
        <View
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: '#9f67ff' }}
        />
      )}

      <Text style={{ fontSize: 22 }}>{stage.icon}</Text>
      <Text
        className="font-bold text-[11px] mt-1"
        style={{ color: selected ? '#ffffff' : unlocked ? '#aaaacc' : '#444466' }}
      >
        {stage.name}
      </Text>

      {unlocked ? (
        <View className="mt-1.5 gap-0.5 items-center">
          <Text style={{ fontSize: 8, color: '#ff6b6b' }}>HP ×{stage.hpMultiplier}</Text>
          <Text style={{ fontSize: 8, color: '#6bffb8' }}>報酬 ×{stage.rewardMultiplier}</Text>
        </View>
      ) : (
        <View className="mt-1.5 items-center gap-0.5">
          <Text style={{ fontSize: 10 }}>🔒</Text>
          <Text style={{ fontSize: 8, color: '#444466' }}>W{stage.unlockWave}</Text>
        </View>
      )}
    </View>
  </Pressable>
);

// ─────────────────────────────────────────
//  アップグレードカード
// ─────────────────────────────────────────

type UpgradeCardProps = {
  item: (typeof PERMANENT_UPGRADES)[number];
  currentLv: number;
  gems: number;
  onPurchase: () => void;
};

const UpgradeCard: React.FC<UpgradeCardProps> = ({ item, currentLv, gems, onPurchase }) => {
  const atMaxLv   = currentLv >= item.maxLv;
  const cost      = item.gemCost(currentLv);
  const canAfford = gems >= cost && !atMaxLv;
  const progress  = currentLv / item.maxLv;

  return (
    <View
      className="rounded-2xl mb-3 overflow-hidden"
      style={{
        backgroundColor: '#09091c',
        borderWidth: 1,
        borderColor: atMaxLv ? '#2a4a2a' : canAfford ? '#2a2050' : '#1a1a30',
      }}
    >
      <View className="flex-row items-center gap-3 px-4 pt-3 pb-2">
        {/* アイコン */}
        <View
          className="w-12 h-12 rounded-xl items-center justify-center"
          style={{ backgroundColor: '#12102a' }}
        >
          <Text style={{ fontSize: 26 }}>{item.icon}</Text>
        </View>

        {/* テキスト */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-sm text-white">{item.name}</Text>
            {atMaxLv && (
              <View className="bg-[#1a4a1a] border border-[#2a8a2a] rounded px-1.5 py-0.5">
                <Text style={{ fontSize: 8, color: '#4aff4a' }}>MAX</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 10, color: '#7777aa', marginTop: 2 }}>{item.desc}</Text>
        </View>

        {/* レベル＋購入ボタン */}
        <View className="items-end gap-1">
          <Text className="font-mono text-xs" style={{ color: '#9f67ff' }}>
            {currentLv} / {item.maxLv}
          </Text>
          {!atMaxLv && (
            <Pressable
              onPress={onPurchase}
              disabled={!canAfford}
              className="rounded-lg px-3 py-1.5"
              style={{
                backgroundColor: canAfford ? '#2a1060' : '#0d0d20',
                borderWidth: 1,
                borderColor: canAfford ? '#9f67ff' : '#222240',
                opacity: canAfford ? 1 : 0.5,
              }}
            >
              <Text className="font-mono" style={{ fontSize: 10, color: '#fde047' }}>
                💎 {cost}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* プログレスバー */}
      <View className="mx-4 mb-3 h-1 rounded-full" style={{ backgroundColor: '#1a1a30' }}>
        <View
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: atMaxLv ? '#4aff4a' : '#9f67ff',
          }}
        />
      </View>
    </View>
  );
};

// ─────────────────────────────────────────
//  メインコンポーネント
// ─────────────────────────────────────────

export const LabModal: React.FC<Props> = React.memo(({ visible, permanent, onPurchase, onSelectStage, onClose }) => {
  const currentStageDef = STAGE_DEFS.find((s) => s.id === permanent.currentStage);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/85 justify-end">
        <View
          className="rounded-t-3xl"
          style={{ backgroundColor: '#07071a', maxHeight: '92%', borderTopWidth: 2, borderColor: '#3a2060' }}
        >
          {/* ━━━ ヘッダー ━━━ */}
          <View
            className="px-5 pt-5 pb-4 rounded-t-3xl"
            style={{ backgroundColor: '#0d0d25', borderBottomWidth: 1, borderColor: '#1e1e38' }}
          >
            <View className="flex-row justify-between items-start">
              {/* タイトル */}
              <View>
                <Text className="font-mono font-bold text-xl tracking-widest" style={{ color: '#c084fc' }}>
                  🔬 LABORATORY
                </Text>
                <Text style={{ fontSize: 10, color: '#5555aa', marginTop: 2 }}>
                  ランを超えて持続する永続強化
                </Text>
              </View>

              {/* ジェム残高 */}
              <View
                className="rounded-2xl px-4 py-2.5 items-center"
                style={{ backgroundColor: '#1a0f35', borderWidth: 1, borderColor: '#5a3090' }}
              >
                <Text style={{ fontSize: 9, color: '#9f67ff', marginBottom: 1 }}>所持ジェム</Text>
                <Text className="font-mono font-bold text-lg" style={{ color: '#fde047' }}>
                  💎 {permanent.gems}
                </Text>
              </View>
            </View>

            {/* 現在のステージ表示 */}
            {currentStageDef && (
              <View
                className="mt-3 flex-row items-center gap-2 rounded-xl px-3 py-2"
                style={{ backgroundColor: '#12102a', borderWidth: 1, borderColor: '#2a2050' }}
              >
                <Text style={{ fontSize: 14 }}>{currentStageDef.icon}</Text>
                <Text style={{ fontSize: 11, color: '#aaaacc' }}>
                  現在のステージ:
                </Text>
                <Text className="font-bold" style={{ fontSize: 11, color: '#ffffff' }}>
                  Stage {currentStageDef.id} {currentStageDef.name}
                </Text>
                <View className="flex-1" />
                <Text style={{ fontSize: 9, color: '#ff6b6b' }}>HP×{currentStageDef.hpMultiplier}</Text>
                <Text style={{ fontSize: 9, color: '#888' }}>  /  </Text>
                <Text style={{ fontSize: 9, color: '#6bffb8' }}>報酬×{currentStageDef.rewardMultiplier}</Text>
              </View>
            )}
          </View>

          <ScrollView
            className="px-5 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {/* ━━━ ステージ選択 ━━━ */}
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-1 h-3 rounded-full" style={{ backgroundColor: '#9f67ff' }} />
              <Text className="font-bold tracking-widest" style={{ fontSize: 11, color: '#9f67ff' }}>
                ステージ選択
              </Text>
              <Text style={{ fontSize: 9, color: '#555577' }}>
                （ウェーブ到達で解禁）
              </Text>
            </View>
            <View className="flex-row gap-2 mb-5">
              {STAGE_DEFS.map((stage) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  selected={stage.id === permanent.currentStage}
                  unlocked={stage.id <= permanent.maxUnlockedStage}
                  onPress={() => onSelectStage(stage.id)}
                />
              ))}
            </View>

            {/* ━━━ 永続強化 ━━━ */}
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-1 h-3 rounded-full" style={{ backgroundColor: '#9f67ff' }} />
              <Text className="font-bold tracking-widest" style={{ fontSize: 11, color: '#9f67ff' }}>
                永続強化
              </Text>
              <Text style={{ fontSize: 9, color: '#555577' }}>
                （ジェムで購入）
              </Text>
            </View>
            {PERMANENT_UPGRADES.map((item) => (
              <UpgradeCard
                key={item.id}
                item={item}
                currentLv={permanent.upgrades[item.id] ?? 0}
                gems={permanent.gems}
                onPurchase={() => onPurchase(item.id)}
              />
            ))}
          </ScrollView>

          {/* ━━━ 閉じるボタン ━━━ */}
          <View className="px-5 pb-8 pt-2" style={{ borderTopWidth: 1, borderColor: '#1e1e38' }}>
            <Pressable
              className="rounded-2xl py-4 items-center"
              style={{ backgroundColor: '#0f0f22', borderWidth: 1, borderColor: '#2a2a4a' }}
              onPress={onClose}
            >
              <Text className="font-bold tracking-widest" style={{ color: '#7777aa', fontSize: 13 }}>
                閉じる
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
});

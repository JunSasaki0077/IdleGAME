// ============================================================
//  components/battle/Hero.tsx
//  PNG画像を使ったドット絵アニメーション
//  フレームを一定間隔で切り替えて動かす
// ============================================================

import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

// ─────────────────────────────────────────
//  アニメーションの種類
// ─────────────────────────────────────────

export type HeroAnim = 'idle' | 'walk' | 'attack' | 'damage';

// ─────────────────────────────────────────
//  画像の読み込み
//  requireはビルド時に解決されるので
//  動的なパスが使えないため全部列挙する
// ─────────────────────────────────────────

const FRAMES: Record<HeroAnim, ReturnType<typeof require>[]> = {
  idle: [
    require('../../../assets/sprites/mage_idle_1.png'),
    require('../../../assets/sprites/mage_idle_2.png'),
    require('../../../assets/sprites/mage_idle_3.png'),
    require('../../../assets/sprites/mage_idle_4.png'),
  ],
  walk: [
    require('../../../assets/sprites/mage_walk_1.png'),
    require('../../../assets/sprites/mage_walk_2.png'),
    require('../../../assets/sprites/mage_walk_3.png'),
    require('../../../assets/sprites/mage_walk_4.png'),
  ],
  attack: [
    require('../../../assets/sprites/mage_attack_1.png'),
    require('../../../assets/sprites/mage_attack_2.png'),
    require('../../../assets/sprites/mage_attack_3.png'),
    require('../../../assets/sprites/mage_attack_4.png'),
  ],
  damage: [
    require('../../../assets/sprites/mage_damage_1.png'),
    require('../../../assets/sprites/mage_damage_2.png'),
    require('../../../assets/sprites/mage_damage_3.png'),
    require('../../../assets/sprites/mage_damage_4.png'),
  ],
};

// アニメーションごとのフレーム切り替え速度（ms）
const ANIM_SPEED: Record<HeroAnim, number> = {
  idle:   600,
  walk:   150,
  attack: 110,
  damage: 100,
};

// ─────────────────────────────────────────
//  Props
// ─────────────────────────────────────────

type Props = {
  anim: HeroAnim;   // 再生するアニメーション
  size?: number;    // 表示サイズ（デフォルト: 72px）
};

// ─────────────────────────────────────────
//  コンポーネント
// ─────────────────────────────────────────

export const Hero: React.FC<Props> = ({ anim, size = 72 }) => {
  const [frameIndex, setFrameIndex] = useState(0);

  // アニメーションが切り替わったらフレームをリセット
  useEffect(() => {
    setFrameIndex(0);
  }, [anim]);

  // フレームを一定間隔で進める
  useEffect(() => {
    const frames = FRAMES[anim];
    const speed  = ANIM_SPEED[anim];

    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, speed);

    return () => clearInterval(timer);
  }, [anim]);

  return (
    <View style={styles.container}>
      <Image
        source={FRAMES[anim][frameIndex]}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

// ─────────────────────────────────────────
//  スタイル
// ─────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '45%',
    left: '18%',
    zIndex: 10,
  },
});

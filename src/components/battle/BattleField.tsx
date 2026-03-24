// ============================================================
//  components/battle/BattleField.tsx
//  Hero に HeroAnim を渡してアニメーションを切り替える
// ============================================================

import React from 'react';
import { View, Text } from 'react-native';
import { Hero, type HeroAnim } from './Hero';
import { EnemySprite } from './EnemySprite';
import { ProjectileSprite } from './ProjectileSprite';
import { GAME_CONFIG } from '../../constants/gameConfig';
import type { GameState } from '../../state/gameState';
import type { DamageNumber } from '../../types/gameTypes';

// ─────────────────────────────────────────
//  Props
// ─────────────────────────────────────────

type Props = {
  state: GameState;
  damageNumbers: DamageNumber[];
  isAttacking: boolean;
  isHit: boolean;
};

// ─────────────────────────────────────────
//  コンポーネント
// ─────────────────────────────────────────

export const BattleField: React.FC<Props> = React.memo(({
  state,
  damageNumbers,
  isAttacking,
  isHit,
}) => {
  const stage = Math.min(Math.floor(state.level / GAME_CONFIG.STAGE_LEVEL_DIVISOR) + 1, GAME_CONFIG.MAX_STAGE);

  // スキルなし時：敵がメレー圏内にいる間はずっと attack アニメーション
  const STOP_X = GAME_CONFIG.HERO_POSITION_X + GAME_CONFIG.ENEMY_STOP_OFFSET;
  const isInMeleeRange =
    state.acquiredSkills.length === 0 &&
    state.enemies.some((e) => e.x <= STOP_X + GAME_CONFIG.ATTACK_RANGE);

  const heroAnim: HeroAnim =
    isHit                       ? 'damage' :
    isInMeleeRange || isAttacking ? 'attack' :
    state.enemies.length > 0    ? 'walk' :
    'idle';

  return (
    <View className="flex-[0.58] bg-[#0a0a1f] overflow-hidden relative border-b-[3px] border-[#111]">

      {/* 空 */}
      <View className="absolute top-0 left-0 right-0 bottom-[45%] bg-[#0a0a1f]" />

      {/* 地面 */}
      <View className="absolute bottom-0 left-0 right-0 h-[45%] bg-[#1e3510] border-t-[3px] border-[#4a7a2e]" />

      {/* 主人公（PNG ドット絵） */}
      <Hero anim={heroAnim} size={160} />

      {/* 敵一覧 */}
      {state.enemies.map((enemy) => (
        <EnemySprite key={enemy.id} enemy={enemy} />
      ))}

      {/* 弾一覧 */}
      {state.projectiles.map((proj) => (
        <ProjectileSprite key={proj.id} projectile={proj} />
      ))}

      {/* ダメージ数字 */}
      {damageNumbers.map((d) => (
        <Text
          key={d.id}
          className="absolute z-[30] font-mono text-[13px] font-bold"
          style={{
            left:  `${d.x}%`,
            top:   `${d.y}%`,
            color: d.color,
            textShadowColor:  '#000',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {d.value}
        </Text>
      ))}

      {/* ステージラベル */}
      <Text
        className="absolute top-2 self-center font-mono text-[9px] tracking-[2px]"
        style={{ color: 'rgba(200,200,255,0.4)' }}
      >
        STAGE {stage} — LV.{state.level}
      </Text>

    </View>
  );
});

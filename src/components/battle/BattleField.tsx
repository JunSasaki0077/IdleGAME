// ============================================================
//  components/battle/BattleField.tsx
//  ウェーブクリアバナー対応
// ============================================================

import React from 'react';
import { View, Text } from 'react-native';
import { Hero, type HeroAnim } from './Hero';
import { EnemySprite } from './EnemySprite';
import { ProjectileSprite } from './ProjectileSprite';
import { WaveClearBanner } from './WaveClearBanner';
import { GAME_CONFIG, STOP_X } from '../../constants/gameConfig';
import type { GameState } from '../../state/gameState';
import type { DamageNumber } from '../../types/gameTypes';

// 背景の木（位置固定・再レンダリングなし）
const TREES = [
  { left: '5%',  size: 28, opacity: 0.5 },
  { left: '14%', size: 22, opacity: 0.35 },
  { left: '30%', size: 30, opacity: 0.45 },
  { left: '42%', size: 20, opacity: 0.3 },
  { left: '55%', size: 26, opacity: 0.5 },
  { left: '65%', size: 32, opacity: 0.4 },
  { left: '75%', size: 22, opacity: 0.35 },
  { left: '83%', size: 28, opacity: 0.45 },
  { left: '91%', size: 24, opacity: 0.3 },
] as const;

const ForestBackground = React.memo(() => (
  <>
    {TREES.map((tree, i) => (
      <Text
        key={i}
        style={{
          position:   'absolute',
          bottom:     '45%',
          left:       tree.left,
          fontSize:   tree.size,
          opacity:    tree.opacity,
          lineHeight: tree.size,
        }}
      >
        🌲
      </Text>
    ))}
  </>
));

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

  const isInMeleeRange =
    state.acquiredSkills.length === 0 &&
    state.enemies.some((e) => e.x <= STOP_X + GAME_CONFIG.ATTACK_RANGE);

  const heroAnim: HeroAnim =
    isHit                         ? 'damage' :
    isInMeleeRange || isAttacking ? 'attack' :
    state.enemies.length > 0      ? 'walk' :
    'idle';

  // クリアしたのが5の倍数ウェーブか（ボス撃破判定）
  const isBossWave = state.waveNumber % GAME_CONFIG.BOSS_WAVE_INTERVAL === 0;

  return (
    <View className="flex-[0.58] bg-[#0a0a1f] overflow-hidden relative border-b-[3px] border-[#111]">

      {/* 空 */}
      <View className="absolute top-0 left-0 right-0 bottom-[45%] bg-[#0a0a1f]" />

      {/* 地面 */}
      <View className="absolute bottom-0 left-0 right-0 h-[45%] bg-[#1e3510] border-t-[3px] border-[#4a7a2e]" />

      {/* 森 */}
      <ForestBackground />

      {/* 主人公 */}
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
            left:             `${d.x}%`,
            top:              `${d.y}%`,
            color:            d.color,
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

      {/* 通常時のウェーブ進捗ラベル（クリア時は非表示） */}
      {!state.waveBreaking && (
        <Text
          className="absolute top-7 self-center font-mono text-[11px] font-bold tracking-widest"
          style={{ color: 'rgba(192,132,252,0.8)' }}
        >
          {`WAVE ${state.waveNumber}  ${state.waveEnemiesKilled}/${state.waveEnemiesTotal}`}
        </Text>
      )}

      {/* ウェーブクリアバナー（Reanimated + Haptics） */}
      <WaveClearBanner
        waveBreaking={state.waveBreaking}
        waveNumber={state.waveNumber}
        waveBreakTimer={state.waveBreakTimer}
        isBossWave={isBossWave}
      />

    </View>
  );
});

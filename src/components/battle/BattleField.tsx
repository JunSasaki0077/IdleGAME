// ============================================================
//  components/battle/BattleField.tsx
//  弾（ProjectileSprite）を追加
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Hero } from './Hero';
import { EnemySprite } from './EnemySprite';
import { ProjectileSprite } from './ProjectileSprite';
import { getCurrentClass } from '../../state/gameState';
import type { GameState } from '../../state/gameState';
import type { DamageNumber } from '../../types/gameTypes';

type Props = {
  state: GameState;
  damageNumbers: DamageNumber[];
  isAttacking: boolean;
  isHit: boolean;
};

export const BattleField: React.FC<Props> = ({
  state,
  damageNumbers,
  isAttacking,
  isHit,
}) => {
  const currentClass = getCurrentClass(state.level);

  return (
    <View style={styles.field}>

      {/* 空 */}
      <View style={styles.sky} />

      {/* 地面 */}
      <View style={styles.ground} />

      {/* 主人公 */}
      <Hero emoji={currentClass.emoji} isAttacking={isAttacking} isHit={isHit} />

      {/* 敵一覧 */}
      {state.enemies.map((enemy) => (
        <EnemySprite key={enemy.id} enemy={enemy} />
      ))}

      {/* 弾一覧（新規追加） */}
      {state.projectiles.map((proj) => (
        <ProjectileSprite key={proj.id} projectile={proj} />
      ))}

      {/* ダメージ数字 */}
      {damageNumbers.map((d) => (
        <Text
          key={d.id}
          style={[
            styles.damageNum,
            {
              left:  `${d.x}%`,
              top:   `${d.y}%`,
              color: d.color,
            },
          ]}
        >
          {d.value}
        </Text>
      ))}

      {/* ステージラベル */}
      <Text style={styles.stageLabel}>
        STAGE {Math.min(Math.floor(state.level / 6) + 1, 5)} — LV.{state.level}
      </Text>

    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    flex: 0.58,
    backgroundColor: '#0a0a1f',
    overflow: 'hidden',
    position: 'relative',
    borderBottomWidth: 3,
    borderBottomColor: '#111',
  },
  sky: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    bottom: '45%',
    backgroundColor: '#0a0a1f',
  },
  ground: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '45%',
    backgroundColor: '#1e3510',
    borderTopWidth: 3,
    borderTopColor: '#4a7a2e',
  },
  damageNum: {
    position: 'absolute',
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: 'bold',
    zIndex: 30,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  stageLabel: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    fontFamily: 'monospace',
    fontSize: 9,
    color: 'rgba(200,200,255,0.4)',
    letterSpacing: 2,
  },
});

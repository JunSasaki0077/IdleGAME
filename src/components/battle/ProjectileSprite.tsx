// ============================================================
//  components/battle/ProjectileSprite.tsx
//  弾1発の表示コンポーネント
// ============================================================

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { PROJECTILE_VISUALS } from '../../types/gameTypes';
import type { Projectile } from '../../types/gameTypes';

type Props = {
  projectile: Projectile;
};

export const ProjectileSprite: React.FC<Props> = React.memo(({ projectile }) => {
  const visual = PROJECTILE_VISUALS[projectile.kind];

  return (
    <Text
      style={[
        styles.projectile,
        {
          left:     `${projectile.x}%`,
          top:      `${projectile.y}%`,
          fontSize: visual.size,
          // 弾の色に合わせた光彩エフェクト
          textShadowColor:  visual.color,
          textShadowRadius: 8,
          textShadowOffset: { width: 0, height: 0 },
        },
      ]}
    >
      {visual.emoji}
    </Text>
  );
}, (prev, next) =>
  prev.projectile.x === next.projectile.x &&
  prev.projectile.y === next.projectile.y
);

const styles = StyleSheet.create({
  projectile: {
    position: 'absolute',
    zIndex: 15,
  },
});

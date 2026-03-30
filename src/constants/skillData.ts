// ============================================================
//  constants/skillData.ts
//  スキル定義データと選択肢生成
// ============================================================

import type { SkillDef } from '../types/skillTypes';

export const SKILL_DEFS: SkillDef[] = [
  {
    id: 'fireball',
    name: 'ファイアボール',
    icon: '🔥',
    desc: '炎の弾を発射。攻撃力が上昇する',
    maxLv: 5,
    getEffect: (lv) => ({ atkMultiplier: 1 + lv * 0.12 }),
  },
  {
    id: 'thunder',
    name: 'サンダー',
    icon: '⚡',
    desc: '雷の弾を発射。チェーン攻撃が発生する',
    maxLv: 5,
    getEffect: (lv) => ({ chainCount: 1 + lv }),
  },
  {
    id: 'ice',
    name: 'アイスボルト',
    icon: '❄️',
    desc: '氷の弾を発射。敵の動きを遅くする',
    maxLv: 5,
    getEffect: (lv) => ({ slowAmount: Math.min(lv * 0.1, 0.5) }),
  },
];

/** IDからスキル定義を取得 */
export function getSkillDef(id: string): SkillDef | undefined {
  return SKILL_DEFS.find((s) => s.id === id);
}

/**
 * レベルアップ時のスキル選択肢を生成（最大3つ）
 * 未習得スキルを優先し、残りは習得済みスキル（レベルアップ可能）で埋める
 */
export function generateSkillChoices(acquiredIds: string[]): SkillDef[] {
  const unacquired = SKILL_DEFS
    .filter((s) => !acquiredIds.includes(s.id))
    .sort(() => Math.random() - 0.5);

  const upgradeable = SKILL_DEFS
    .filter((s) => acquiredIds.includes(s.id))
    .sort(() => Math.random() - 0.5);

  return [...unacquired, ...upgradeable].slice(0, 3);
}

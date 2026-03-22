// ============================================================
//  types/skillTypes.ts
//  スキルシステムの型定義
// ============================================================

/** スキル1レベルあたりの効果 */
export type SkillEffect = {
  atkMultiplier?: number;  // 攻撃力倍率
  chainCount?: number;     // チェーン攻撃数
  slowAmount?: number;     // 敵の移動速度減少量（0〜1）
};

/** スキルの定義 */
export type SkillDef = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  maxLv: number;
  getEffect: (skillLv: number) => SkillEffect;
};

/** 習得済みスキル（プレイヤーが持つ） */
export type AcquiredSkill = {
  defId: string;    // SkillDef.id
  skillLv: number;  // 現在のスキルレベル
};

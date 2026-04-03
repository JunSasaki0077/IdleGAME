// ============================================================
//  constants/gameConfig.ts
//  ゲーム全体で使用する設定値・定数
// ============================================================

export const GAME_CONFIG = {
  // ゲームループ設定
  MAX_DELTA_TIME: 0.2,            // 最大デルタタイム（秒）

  // 位置設定
  HERO_POSITION_X: 22,            // 主人公のX座標（%）
  ENEMY_STOP_OFFSET: 12,          // 敵が止まる位置のオフセット（主人公のすぐ右で止まる）
  PROJ_Y: 30,                     // 弾のY座標（%・地面より少し上）
  ENEMY_MIN_X: 20,                // 敵が通り越せない最小X座標（主人公の位置）
  ENEMY_DESPAWN_X: -20,           // 敵が削除されるX座標
  ENEMY_SPAWN_X: 110,             // 敵が出現するX座標
  ENEMY_MOVE_SPEED: 15,           // 敵の移動速度（%/秒）

  // 戦闘設定
  DAMAGE_VARIANCE_MIN: 0.85,      // ダメージの最小倍率
  DAMAGE_VARIANCE_MAX: 1.15,      // ダメージの最大倍率
  ENEMY_ATTACK_INTERVAL: 1.0,     // 敵の攻撃間隔（秒）
  ENEMY_DAMAGE_DIVISOR: 15,       // 敵ダメージ計算の除数（baseHp ÷ この値）
  ENEMY_DAMAGE_VARIANCE_MIN: 0.8, // 敵のダメージ最小倍率
  ENEMY_DAMAGE_VARIANCE_MAX: 1.2, // 敵のダメージ最大倍率
  ATTACK_RANGE: 5,                // 攻撃可能範囲

  // クリティカルヒット設定
  CRITICAL_HIT_CHANCE: 0.15,      // アップグレードで追加されるクリティカル率（15%）
  CRITICAL_HIT_MULTIPLIER: 2.0,   // クリティカル時のダメージ倍率
  CRITICAL_ANIMATION_DURATION: 300, // クリティカル演出時間（ミリ秒）

  // ボス設定
  BOSS_SPAWN_KILL_COUNT: 10,      // この体数を倒すとボスが出現
  BOSS_HP_MULTIPLIER: 5.0,        // ボスのHP倍率
  BOSS_REWARD_MULTIPLIER: 3.0,    // ボスの報酬倍率
  BOSS_SIZE_MULTIPLIER: 1.5,      // ボスのサイズ倍率

  // レベルアップ設定
  XP_MULTIPLIER: 1.55,            // レベルアップ時のXP必要量倍率
  LEVEL_UP_ATK_BONUS: 3,          // レベルアップ時の攻撃力ボーナス
  LEVEL_UP_HP_BONUS: 25,          // レベルアップ時のHP最大値ボーナス

  // 敵のスケーリング
  ENEMY_TIER_LEVEL_DIVISOR: 8,    // レベル÷この値で敵のTierを決定
  ENEMY_HP_SCALE_PER_LEVEL: 0.15, // レベルごとの敵HP増加率
  ENEMY_GOLD_SCALE_PER_LEVEL: 0.1,// レベルごとの敵Gold増加率
  ENEMY_XP_SCALE_PER_LEVEL: 0.05, // レベルごとの敵XP増加率

  // アップグレード設定
  UPGRADE_COST_MULTIPLIER: 1.6,   // レベルアップごとのコスト倍率

  // UI/エフェクト設定
  ATTACK_ANIMATION_DURATION: 180, // 攻撃アニメーション時間（ミリ秒）
  HIT_ANIMATION_DURATION: 250,    // ダメージアニメーション時間（ミリ秒）
  DAMAGE_NUMBER_DURATION: 1000,   // ダメージ数字の表示時間（ミリ秒）

  // ステージ設定
  STAGE_LEVEL_DIVISOR: 6,         // レベル÷この値でステージ番号を決定
  MAX_STAGE: 5,                   // 最大ステージ数

  // オフライン報酬設定
  OFFLINE_MAX_SECONDS: 28800,     // オフライン報酬の最大蓄積時間（8時間）
  OFFLINE_EFFICIENCY: 0.5,        // オフライン中の資源獲得効率（50%）

  // 弾の判定
  PROJECTILE_DESPAWN_X: 115,      // 弾が画面外とみなされるX座標（%）

  // ウェーブシステム
  WAVE_BASE_ENEMIES: 20,           // Wave 1の敵数
  WAVE_ENEMIES_PER_WAVE: 5,        // ウェーブごとの追加敵数
  WAVE_MAX_ENEMIES: 100,           // ウェーブあたりの最大敵数
  SPAWN_INTERVAL_BASE: 1.5,        // Wave 1のスポーン間隔（秒）
  SPAWN_INTERVAL_PER_WAVE: 0.05,   // ウェーブごとの短縮量（秒）
  SPAWN_INTERVAL_MIN: 0.3,         // スポーン間隔の最小値（秒）
  SPAWN_BATCH_BASE: 2,             // Wave 1の1回スポーン数
  SPAWN_BATCH_PER_WAVES: 2,        // この数のウェーブごとにバッチサイズ+1
  SPAWN_BATCH_MAX: 12,             // 1回スポーンの最大数
  WAVE_BREAK_DURATION: 1.5,       // ウェーブ間の休憩時間（秒）
  BOSS_WAVE_INTERVAL: 5,          // ボスが出現するウェーブ間隔（5の倍数）

  // ジェム・ラボシステム
  GEMS_PER_WAVE: 3,               // ウェーブクリアごとのジェム獲得数

  // 群れ表現
  ENEMY_Y_SPREAD: 14,             // 敵の縦方向ばらつき幅（%・群れの奥行き表現）
} as const;

// HERO_POSITION_X + ENEMY_STOP_OFFSET の合成値（useGameLoop・BattleField共通）
export const STOP_X = GAME_CONFIG.HERO_POSITION_X + GAME_CONFIG.ENEMY_STOP_OFFSET;

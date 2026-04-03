// ============================================================
//  state/useGameLoop.ts
//  弾の発射・移動・当たり判定を追加
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG, STOP_X } from '../constants/gameConfig';
import { UPGRADES } from '../constants/gameData';
import { generateSkillChoices } from '../constants/skillData';
import {
  INITIAL_STATE,
  tickGame,
  createEnemy,
  createProjectile,
  calcSkillEffects,
  calcAttackDamage,
  findClosestEnemy,
  acquireSkill,
  upgradeSkillWithSP,
  MELEE_ATTACK_ID,
  type GameState,
} from './gameState';
import type { Upgrade, DamageNumber, Projectile } from '../types/gameTypes';
import type { SkillDef } from '../types/skillTypes';

// スキルIDと弾の種類を対応させる
const SKILL_TO_PROJECTILE: Record<string, Projectile['kind']> = {
  fireball: 'fireball',
  thunder:  'thunder',
  ice:      'ice',
};

// ─────────────────────────────────────────
//  戻り値の型
// ─────────────────────────────────────────

export type GameLoopResult = {
  state: GameState;
  upgrades: Upgrade[];
  damageNumbers: DamageNumber[];
  isAttacking: boolean;
  isHit: boolean;
  skillChoices: SkillDef[];
  isRunOver: boolean;
  gemsEarned: number;
  buyUpgrade: (id: string) => void;
  selectSkill: (skillDefId: string) => void;
  upgradeSkill: (skillDefId: string) => void;
  retireRun: () => void;
};

// ─────────────────────────────────────────
//  カスタムフック
// ─────────────────────────────────────────

type GameLoopOptions = {
  initialState?: GameState;
  initialUpgrades?: Upgrade[];
  stage?: number;
};

export function useGameLoop(options: GameLoopOptions = {}): GameLoopResult {
  const stage = options.stage ?? 1;
  const [state, setState]                 = useState<GameState>(options.initialState ?? INITIAL_STATE);
  const [upgrades, setUpgrades]           = useState<Upgrade[]>(options.initialUpgrades ?? UPGRADES);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [isAttacking, setIsAttacking]     = useState(false);
  const [isHit, setIsHit]                 = useState(false);
  const [skillChoices, setSkillChoices]   = useState<SkillDef[]>([]);
  const [isRunOver, setIsRunOver]         = useState(false);
  const [gemsEarned, setGemsEarned]       = useState(0);

  const stateRef     = useRef<GameState>(INITIAL_STATE);
  const dmgIdCounter = useRef(0);
  const prevLevelRef = useRef(1);
  const timerRefs    = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => { stateRef.current = state; }, [state]);

  // ─── タイマークリーンアップ ───
  useEffect(() => {
    return () => {
      timerRefs.current.forEach((t) => clearTimeout(t));
      timerRefs.current.clear();
    };
  }, []);

  // ─── レベルアップを検知してスキル選択肢を生成 ───
  useEffect(() => {
    if (state.level > prevLevelRef.current && state.pendingSkillChoice) {
      const choices = generateSkillChoices(state.acquiredSkills.map((s) => s.defId));
      setSkillChoices(choices);
    }
    prevLevelRef.current = state.level;
  }, [state.level, state.pendingSkillChoice]);

  // ─── ダメージ数字 ───
  const spawnDamageNumber = useCallback((
    value: string, x: number, y: number, color = '#ff6666'
  ) => {
    const id = dmgIdCounter.current++;
    setDamageNumbers((prev) => [...prev, { id, value, x, y, color }]);
    const t = setTimeout(() => {
      setDamageNumbers((prev) => prev.filter((d) => d.id !== id));
      timerRefs.current.delete(t);
    }, GAME_CONFIG.DAMAGE_NUMBER_DURATION);
    timerRefs.current.add(t);
  }, []);

  const triggerAttack = useCallback(() => {
    setIsAttacking(true);
    const t = setTimeout(() => {
      setIsAttacking(false);
      timerRefs.current.delete(t);
    }, GAME_CONFIG.ATTACK_ANIMATION_DURATION);
    timerRefs.current.add(t);
  }, []);

  const triggerHit = useCallback(() => {
    setIsHit(true);
    const t = setTimeout(() => {
      setIsHit(false);
      timerRefs.current.delete(t);
    }, GAME_CONFIG.HIT_ANIMATION_DURATION);
    timerRefs.current.add(t);
  }, []);

  // ─── スキル選択 ───
  const selectSkill = useCallback((skillDefId: string) => {
    setState((prev) => acquireSkill(prev, skillDefId, 1 / prev.atkSpeed));
    setSkillChoices([]);
  }, []);

  // ─── SPでスキル強化 ───
  const upgradeSkill = useCallback((skillDefId: string) => {
    setState((prev) => upgradeSkillWithSP(prev, skillDefId));
  }, []);

  // ─── リタイア（手動でランを終了） ───
  const retireRun = useCallback(() => {
    // stateRef.current は常に最新値を持つ（useEffect で同期済み）
    const earned = stateRef.current.waveNumber * GAME_CONFIG.GEMS_PER_WAVE;
    setGemsEarned(earned);
    setIsRunOver(true);
  }, []);

  // ─── アップグレード購入 ───
  const buyUpgrade = useCallback((upgradeId: string) => {
    const current = stateRef.current;
    const upg = upgrades.find((u) => u.id === upgradeId);
    if (!upg || current.gold < upg.cost) return;
    const newState = upg.apply({ ...current, gold: current.gold - upg.cost });
    setState(newState);
    setUpgrades((prev) => prev.map((u) =>
      u.id === upgradeId
        ? { ...u, level: u.level + 1, cost: Math.floor(u.cost * GAME_CONFIG.UPGRADE_COST_MULTIPLIER) }
        : u
    ));
  }, [upgrades]);

  // ─── メインゲームループ（requestAnimationFrame） ───
  useEffect(() => {
    let raf: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, GAME_CONFIG.MAX_DELTA_TIME);
      lastTime = currentTime;

      // setState内で呼べないサイドエフェクトをここに収集する
      const effects: Array<() => void> = [];

      setState((prev) => {
        // StrictModeの二重呼び出しに対応：毎回リセット
        effects.length = 0;

        let s = tickGame(prev, dt);
        const skillFx = calcSkillEffects(s.acquiredSkills);

        // ── ウェーブ間休憩 ──
        if (s.waveBreaking) {
          const remaining = s.waveBreakTimer - dt;
          if (remaining <= 0) {
            const nextWave = s.waveNumber + 1;
            const nextSpawnInterval = Math.max(
              GAME_CONFIG.SPAWN_INTERVAL_BASE - (nextWave - 1) * GAME_CONFIG.SPAWN_INTERVAL_PER_WAVE,
              GAME_CONFIG.SPAWN_INTERVAL_MIN,
            );
            s = {
              ...s,
              waveBreaking: false,
              waveBreakTimer: 0,
              waveNumber: nextWave,
              waveEnemiesTotal: Math.min(GAME_CONFIG.WAVE_BASE_ENEMIES + (nextWave - 1) * GAME_CONFIG.WAVE_ENEMIES_PER_WAVE, GAME_CONFIG.WAVE_MAX_ENEMIES),
              waveEnemiesSpawned: 0,
              waveEnemiesKilled: 0,
              spawnInterval: nextSpawnInterval,
              spawnTimer: nextSpawnInterval, // 即座に最初の敵をスポーン
            };
          } else {
            s = { ...s, waveBreakTimer: remaining };
          }
        }

        // ── 敵スポーン（休憩中以外） ──
        if (!s.waveBreaking && s.waveEnemiesSpawned < s.waveEnemiesTotal && s.spawnTimer >= s.spawnInterval) {
          const isBossWave = s.waveNumber % GAME_CONFIG.BOSS_WAVE_INTERVAL === 0;
          const batchSize  = Math.min(
            GAME_CONFIG.SPAWN_BATCH_BASE + Math.floor((s.waveNumber - 1) / GAME_CONFIG.SPAWN_BATCH_PER_WAVES),
            GAME_CONFIG.SPAWN_BATCH_MAX,
          );
          const remaining  = s.waveEnemiesTotal - s.waveEnemiesSpawned;
          const toSpawn    = Math.min(batchSize, remaining);
          const newEnemies = Array.from({ length: toSpawn }, (_, i) => {
            const spawned   = s.waveEnemiesSpawned + i;
            const isLast    = spawned === s.waveEnemiesTotal - 1;
            const isBoss    = isLast && isBossWave;
            // バッチ内でX方向にずらして縦列の群れを表現
            return createEnemy(s.level, stage, isBoss, i * 7);
          });
          s = {
            ...s,
            spawnTimer: 0,
            waveEnemiesSpawned: s.waveEnemiesSpawned + toSpawn,
            enemies: [...s.enemies, ...newEnemies],
          };
        }

        // ── 敵を移動（スロウ反映） ──
        const moveSpeed = GAME_CONFIG.ENEMY_MOVE_SPEED * (1 - (skillFx.slowAmount ?? 0));
        s = {
          ...s,
          enemies: s.enemies.map((e) => ({
            ...e,
            x: e.x > STOP_X ? Math.max(STOP_X, e.x - moveSpeed * dt) : e.x,
          })),
        };

        // ── 主人公の攻撃 ──
        // デフォルト攻撃とスキル攻撃を統一フォーマットで処理する
        const atkInterval    = 1 / s.atkSpeed;
        const newSkillTimers = { ...s.skillTimers };
        const newProjs: Projectile[] = [];
        let didAnyAttack = false;
        const atkMult = skillFx.atkMultiplier ?? 1;

        // 攻撃スロット: スキルなし → デフォルト(orb)、スキルあり → スキルごと
        const attackSlots: Array<{ timerId: string; kind: Projectile['kind']; yOffset: number }> =
          s.acquiredSkills.length === 0
            ? [{ timerId: MELEE_ATTACK_ID, kind: 'orb', yOffset: 0 }]
            : s.acquiredSkills.map((sk, i) => ({
                timerId: sk.defId,
                kind:    SKILL_TO_PROJECTILE[sk.defId] ?? 'fireball',
                yOffset: i * 6,
              }));

        for (const slot of attackSlots) {
          const timer = (newSkillTimers[slot.timerId] ?? 0) + dt;
          if (timer >= atkInterval && s.enemies.length > 0) {
            newSkillTimers[slot.timerId] = 0;
            didAnyAttack = true;
            const { damage, isCrit } = calcAttackDamage(s.atk, atkMult, s.critChance, s.critMultiplier);
            if (isCrit) effects.push(() => spawnDamageNumber('CRIT!', GAME_CONFIG.HERO_POSITION_X + 5, 15, '#fbbf24'));
            newProjs.push(createProjectile(slot.kind, GAME_CONFIG.HERO_POSITION_X + 5, GAME_CONFIG.PROJ_Y + slot.yOffset, damage));
            // 連射判定
            if (Math.random() < s.multiShotChance) {
              const { damage: bonusDmg, isCrit: bonusCrit } = calcAttackDamage(s.atk, atkMult, s.critChance, s.critMultiplier);
              if (bonusCrit) effects.push(() => spawnDamageNumber('CRIT!', GAME_CONFIG.HERO_POSITION_X + 5, 10, '#fbbf24'));
              newProjs.push(createProjectile(slot.kind, GAME_CONFIG.HERO_POSITION_X + 5, GAME_CONFIG.PROJ_Y + slot.yOffset + 5, bonusDmg));
            }
          } else {
            newSkillTimers[slot.timerId] = timer;
          }
        }

        s = {
          ...s,
          skillTimers: newSkillTimers,
          projectiles: didAnyAttack ? [...s.projectiles, ...newProjs] : s.projectiles,
        };

        if (didAnyAttack) effects.push(() => triggerAttack());

        // ── 弾を移動 ──
        s = {
          ...s,
          projectiles: s.projectiles.map((p) => ({ ...p, x: p.x + p.speed * dt })),
        };

        // ── 弾の当たり判定 ──
        let projectiles    = [...s.projectiles];
        let enemies        = [...s.enemies];
        let goldGain       = 0;
        let xpGain         = 0;
        let waveKillGain   = 0;

        for (const proj of projectiles) {
          if (proj.hit) continue;

          // 毎フレームソートせず、O(n) で最左敵を取得
          const target = findClosestEnemy(enemies);

          if (!target || proj.x < target.x - GAME_CONFIG.ATTACK_RANGE) continue;

          projectiles = projectiles.map((p) => p.id === proj.id ? { ...p, hit: true } : p);
          const newHp = target.hp - proj.damage;

          effects.push(() => spawnDamageNumber(`-${proj.damage}`, target.x, 20, '#ff6666'));

          if (newHp <= 0) {
            effects.push(() => spawnDamageNumber(`+${target.reward.gold}G`, target.x, 10, '#f0c040'));
            goldGain     += target.reward.gold;
            xpGain       += target.reward.xp;
            enemies       = enemies.filter((e) => e.id !== target.id);
            waveKillGain++;
          } else {
            enemies = enemies.map((e) => e.id === target.id ? { ...e, hp: newHp } : e);
          }
        }

        const newWaveKilled = s.waveEnemiesKilled + waveKillGain;

        // ウェーブ完了判定（全スポーン完了 & 全撃破）
        const waveComplete = !s.waveBreaking &&
          s.waveEnemiesSpawned >= s.waveEnemiesTotal &&
          newWaveKilled >= s.waveEnemiesTotal &&
          enemies.length === 0;

        s = {
          ...s,
          gold:               s.gold + goldGain,
          xp:                 s.xp   + xpGain,
          waveEnemiesKilled:  newWaveKilled,
          enemies,
          projectiles: projectiles.filter((p) => !p.hit && p.x < GAME_CONFIG.PROJECTILE_DESPAWN_X),
          ...(waveComplete ? {
            waveBreaking:    true,
            waveBreakTimer:  GAME_CONFIG.WAVE_BREAK_DURATION,
          } : {}),
        };

        // ── 敵の攻撃 ──
        const attackingEnemies = s.enemies.filter((e) => e.x <= STOP_X + GAME_CONFIG.ATTACK_RANGE);
        if (attackingEnemies.length > 0) {
          s = { ...s, enemyAtkTimer: (s.enemyAtkTimer ?? 0) + dt };
          if (s.enemyAtkTimer >= GAME_CONFIG.ENEMY_ATTACK_INTERVAL) {
            s = { ...s, enemyAtkTimer: 0 };
            let totalDmg = 0;
            attackingEnemies.forEach((e) => {
              totalDmg += Math.floor(
                (e.def.baseHp / GAME_CONFIG.ENEMY_DAMAGE_DIVISOR) *
                (GAME_CONFIG.ENEMY_DAMAGE_VARIANCE_MIN + Math.random() *
                  (GAME_CONFIG.ENEMY_DAMAGE_VARIANCE_MAX - GAME_CONFIG.ENEMY_DAMAGE_VARIANCE_MIN))
              );
            });
            const newHp = Math.max(0, s.hp - totalDmg);
            effects.push(() => spawnDamageNumber(`-${totalDmg}`, GAME_CONFIG.HERO_POSITION_X, 25, '#ff4444'));
            effects.push(() => triggerHit());
            s = { ...s, hp: newHp };

            // ── トゲ反射ダメージ ──
            if (s.thornDamage > 0) {
              effects.push(() => spawnDamageNumber(`🌵-${s.thornDamage}`, GAME_CONFIG.HERO_POSITION_X + 10, 35, '#4ade80'));
              s = {
                ...s,
                enemies: s.enemies.map((e) =>
                  attackingEnemies.some((ae) => ae.id === e.id)
                    ? { ...e, hp: e.hp - s.thornDamage }
                    : e
                ).filter((e) => e.hp > 0),
              };
            }

            if (newHp <= 0) {
              // ランオーバー（リバイブなし）
              const earned = s.waveNumber * GAME_CONFIG.GEMS_PER_WAVE;
              s = { ...s, hp: 0, enemies: [], projectiles: [] };
              effects.push(() => {
                setGemsEarned(earned);
                setIsRunOver(true);
              });
            }
          }
        } else {
          s = { ...s, enemyAtkTimer: 0 };
        }

        s = { ...s, enemies: s.enemies.filter((e) => e.x > GAME_CONFIG.ENEMY_DESPAWN_X) };
        return s;
      });

      // サイドエフェクトをsetState完了後に適用
      effects.forEach((fn) => fn());

      raf = requestAnimationFrame(gameLoop);
    };

    raf = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(raf);
  }, [spawnDamageNumber, triggerAttack, triggerHit]);

  return { state, upgrades, damageNumbers, isAttacking, isHit, skillChoices, isRunOver, gemsEarned, buyUpgrade, selectSkill, upgradeSkill, retireRun };
}

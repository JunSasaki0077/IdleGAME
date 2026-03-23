// ============================================================
//  state/useGameLoop.ts
//  弾の発射・移動・当たり判定を追加
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';
import { UPGRADES } from '../constants/gameData';
import { generateSkillChoices } from '../constants/skillData';
import {
  INITIAL_STATE,
  tickGame,
  createEnemy,
  createProjectile,
  calcSkillEffects,
  acquireSkill,
  upgradeSkillWithSP,
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

const STOP_X = GAME_CONFIG.HERO_POSITION_X + GAME_CONFIG.ENEMY_STOP_OFFSET;

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
  buyUpgrade: (id: string) => void;
  selectSkill: (skillDefId: string) => void;
  upgradeSkill: (skillDefId: string) => void;
};

// ─────────────────────────────────────────
//  カスタムフック
// ─────────────────────────────────────────

export function useGameLoop(): GameLoopResult {
  const [state, setState]                 = useState<GameState>(INITIAL_STATE);
  const [upgrades, setUpgrades]           = useState<Upgrade[]>(UPGRADES);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [isAttacking, setIsAttacking]     = useState(false);
  const [isHit, setIsHit]                 = useState(false);
  const [skillChoices, setSkillChoices]   = useState<SkillDef[]>([]);

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

  // ─── アップグレード購入 ───
  const buyUpgrade = useCallback((upgradeId: string) => {
    const current = stateRef.current;
    const upg = upgrades.find((u) => u.id === upgradeId);
    if (!upg || upg.bought || current.gold < upg.cost) return;
    const newState = upg.apply({ ...current, gold: current.gold - upg.cost });
    setState(newState);
    setUpgrades((prev) => prev.map((u) => u.id === upgradeId ? { ...u, bought: true } : u));
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

        // ── 敵スポーン ──
        if (s.spawnTimer >= s.spawnInterval) {
          s = { ...s, spawnTimer: 0, enemies: [...s.enemies, createEnemy(s.level)] };
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

        // ── 主人公の攻撃（スキルごとに独立タイマーで発射） ──
        const atkInterval = 1 / s.atkSpeed;
        const newSkillTimers = { ...s.skillTimers };
        const newProjs: Projectile[] = [];
        let didAnyAttack = false;

        const skillsToProcess = s.acquiredSkills.length > 0
          ? s.acquiredSkills
          : [{ defId: 'fireball', skillLv: 1 }];

        for (let i = 0; i < skillsToProcess.length; i++) {
          const acquired = skillsToProcess[i];
          const timerId = acquired.defId;
          const timer = (newSkillTimers[timerId] ?? 0) + dt;

          if (timer >= atkInterval && s.enemies.length > 0) {
            newSkillTimers[timerId] = 0;
            didAnyAttack = true;

            const baseDmg = Math.floor(
              s.atk * (skillFx.atkMultiplier ?? 1) *
              (GAME_CONFIG.DAMAGE_VARIANCE_MIN + Math.random() * (GAME_CONFIG.DAMAGE_VARIANCE_MAX - GAME_CONFIG.DAMAGE_VARIANCE_MIN))
            );
            const kind = SKILL_TO_PROJECTILE[acquired.defId] ?? 'fireball';
            newProjs.push(createProjectile(
              kind,
              GAME_CONFIG.HERO_POSITION_X + 5,
              GAME_CONFIG.PROJ_Y + i * 6,
              baseDmg,
            ));
          } else {
            newSkillTimers[timerId] = timer;
          }
        }

        if (didAnyAttack) {
          effects.push(() => triggerAttack());
          s = { ...s, skillTimers: newSkillTimers, projectiles: [...s.projectiles, ...newProjs] };
        } else {
          s = { ...s, skillTimers: newSkillTimers };
        }

        // ── 弾を移動 ──
        s = {
          ...s,
          projectiles: s.projectiles.map((p) => ({ ...p, x: p.x + p.speed * dt })),
        };

        // ── 弾の当たり判定 ──
        let projectiles = [...s.projectiles];
        let enemies     = [...s.enemies];
        let goldGain    = 0;
        let xpGain      = 0;

        for (const proj of projectiles) {
          if (proj.hit) continue;

          // 毎フレームソートせず、reduce で最左敵を O(n) で取得
          const target = enemies.length > 0
            ? enemies.reduce((a, b) => a.x < b.x ? a : b)
            : null;

          if (!target || proj.x < target.x - GAME_CONFIG.ATTACK_RANGE) continue;

          projectiles = projectiles.map((p) => p.id === proj.id ? { ...p, hit: true } : p);
          const newHp = target.hp - proj.damage;

          effects.push(() => spawnDamageNumber(`-${proj.damage}`, target.x, 20, '#ff6666'));

          if (newHp <= 0) {
            effects.push(() => spawnDamageNumber(`+${target.reward.gold}G`, target.x, 10, '#f0c040'));
            goldGain += target.reward.gold;
            xpGain   += target.reward.xp;
            enemies   = enemies.filter((e) => e.id !== target.id);
          } else {
            enemies = enemies.map((e) => e.id === target.id ? { ...e, hp: newHp } : e);
          }
        }

        s = {
          ...s,
          gold:        s.gold + goldGain,
          xp:          s.xp   + xpGain,
          enemies,
          projectiles: projectiles.filter((p) => !p.hit && p.x < 115),
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
            if (newHp <= 0) {
              s = { ...s, hp: s.maxHp, enemies: [], projectiles: [] };
              effects.push(() => spawnDamageNumber('💀 REVIVE!', GAME_CONFIG.HERO_POSITION_X, 15, '#c084fc'));
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

  return { state, upgrades, damageNumbers, isAttacking, isHit, skillChoices, buyUpgrade, selectSkill, upgradeSkill };
}

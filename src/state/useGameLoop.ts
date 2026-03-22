// ============================================================
//  state/useGameLoop.ts
//  弾の発射・移動・当たり判定を追加
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
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

const TICK_MS  = 50;
const HERO_X   = 22;   // 主人公のX座標（%）
const STOP_X   = HERO_X + 12;
const PROJ_Y   = 30;   // 弾のY座標（%・地面より少し上）

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

  useEffect(() => { stateRef.current = state; }, [state]);

  // レベルアップを検知してスキル選択肢を生成
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
    setTimeout(() => setDamageNumbers((prev) => prev.filter((d) => d.id !== id)), 1000);
  }, []);

  const triggerAttack = useCallback(() => {
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 180);
  }, []);

  const triggerHit = useCallback(() => {
    setIsHit(true);
    setTimeout(() => setIsHit(false), 250);
  }, []);

  // ─── スキル選択 ───
  const selectSkill = useCallback((skillDefId: string) => {
    setState((prev) => acquireSkill(prev, skillDefId));
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

  // ─── メインゲームループ ───
  useEffect(() => {
    let lastTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const dt  = Math.min((now - lastTime) / 1000, 0.2);
      lastTime  = now;

      setState((prev) => {
        let s = tickGame(prev, dt);
        const skillFx = calcSkillEffects(s.acquiredSkills);

        // ── 敵スポーン ──
        if (s.spawnTimer >= s.spawnInterval) {
          s = { ...s, spawnTimer: 0, enemies: [...s.enemies, createEnemy(s.level)] };
        }

        // ── 敵を移動（スロウ反映） ──
        const moveSpeed = 15 * (1 - (skillFx.slowAmount ?? 0));
        s = {
          ...s,
          enemies: s.enemies.map((e) => ({
            ...e,
            x: e.x > STOP_X ? Math.max(STOP_X, e.x - moveSpeed * dt) : e.x,
          })),
        };

        // ── 主人公の攻撃（弾を発射） ──
        const atkInterval = 1 / s.atkSpeed;
        if (s.atkTimer >= atkInterval && s.enemies.length > 0) {
          s = { ...s, atkTimer: 0 };
          triggerAttack();

          const baseDmg = Math.floor(
            s.atk * (skillFx.atkMultiplier ?? 1) * (0.85 + Math.random() * 0.3)
          );

          // 習得済みスキルに応じて弾を発射
          // スキルがない場合はデフォルト弾（fireball）を発射
          const skillsToFire = s.acquiredSkills.length > 0
            ? s.acquiredSkills.map((a) => SKILL_TO_PROJECTILE[a.defId] ?? 'fireball')
            : ['fireball' as Projectile['kind']];

          // 重複を除いた弾の種類だけ発射
          const uniqueKinds = [...new Set(skillsToFire)];
          const newProjectiles = uniqueKinds.map((kind, i) =>
            createProjectile(
              kind,
              HERO_X + 5,       // 主人公のすぐ右から発射
              PROJ_Y + i * 6,   // 複数の弾は少しずらす
              baseDmg,
            )
          );

          s = { ...s, projectiles: [...s.projectiles, ...newProjectiles] };
        }

        // ── 弾を移動 ──
        s = {
          ...s,
          projectiles: s.projectiles.map((p) => ({
            ...p,
            x: p.x + p.speed * dt,
          })),
        };

        // ── 弾の当たり判定（先頭の敵に当たる） ──
        let newProjectiles = [...s.projectiles];
        let newEnemies     = [...s.enemies];
        let goldGain = 0;
        let xpGain   = 0;

        for (const proj of newProjectiles) {
          if (proj.hit) continue;

          // 先頭の敵（一番左にいる敵）を取得
          const target = [...newEnemies]
            .sort((a, b) => a.x - b.x)[0];

          if (!target) continue;

          // 弾が敵のX座標に到達したか
          if (proj.x >= target.x - 5) {
            // ヒット！
            newProjectiles = newProjectiles.map((p) =>
              p.id === proj.id ? { ...p, hit: true } : p
            );

            const newHp = target.hp - proj.damage;
            spawnDamageNumber(`-${proj.damage}`, target.x, 20, '#ff6666');

            if (newHp <= 0) {
              // 敵を倒した
              spawnDamageNumber(`+${target.reward.gold}G`, target.x, 10, '#f0c040');
              goldGain += target.reward.gold;
              xpGain   += target.reward.xp;
              newEnemies = newEnemies.filter((e) => e.id !== target.id);
            } else {
              newEnemies = newEnemies.map((e) =>
                e.id === target.id ? { ...e, hp: newHp } : e
              );
            }
          }
        }

        s = {
          ...s,
          gold:        s.gold + goldGain,
          xp:          s.xp   + xpGain,
          enemies:     newEnemies,
          // ヒット済み・画面外の弾を削除
          projectiles: newProjectiles.filter((p) => !p.hit && p.x < 115),
        };

        // ── 敵の攻撃 ──
        const attackingEnemies = s.enemies.filter((e) => e.x <= STOP_X + 5);
        if (attackingEnemies.length > 0) {
          s = { ...s, enemyAtkTimer: (s.enemyAtkTimer ?? 0) + dt };
          if (s.enemyAtkTimer >= 1.0) {
            s = { ...s, enemyAtkTimer: 0 };
            let totalDmg = 0;
            attackingEnemies.forEach((e) => {
              totalDmg += Math.floor((e.def.baseHp / 15) * (0.8 + Math.random() * 0.4));
            });
            const newHp = Math.max(0, s.hp - totalDmg);
            spawnDamageNumber(`-${totalDmg}`, HERO_X, 25, '#ff4444');
            triggerHit();
            s = { ...s, hp: newHp };
            if (newHp <= 0) {
              s = { ...s, hp: s.maxHp, enemies: [], projectiles: [] };
              spawnDamageNumber('💀 REVIVE!', HERO_X, 15, '#c084fc');
            }
          }
        } else {
          s = { ...s, enemyAtkTimer: 0 };
        }

        s = { ...s, enemies: s.enemies.filter((e) => e.x > -20) };
        return s;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [spawnDamageNumber, triggerAttack, triggerHit]);

  return { state, upgrades, damageNumbers, isAttacking, isHit, skillChoices, buyUpgrade, selectSkill, upgradeSkill };
}

// ============================================================
//  state/useGameLoop.ts
//  ゲームループを管理するカスタムフック（リファクタリング版）
//  - 分離されたロジック関数を使用
//  - メモリリーク修正
//  - requestAnimationFrameを使用
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';
import { UPGRADES } from '../constants/gameData';
import { INITIAL_STATE, tickGame } from './gameState';
import {
  handleEnemySpawn,
  handleEnemyMovement,
  handlePlayerAttack,
  handleEnemyAttack,
  cleanupOffscreenEnemies,
} from './gameLogic';
import type { GameState } from '../types/gameTypes';
import type { Upgrade, DamageNumber } from '../types/gameTypes';

// ─────────────────────────────────────────
//  戻り値の型
// ─────────────────────────────────────────

export type GameLoopResult = {
  state: GameState;
  upgrades: Upgrade[];
  damageNumbers: DamageNumber[];
  isAttacking: boolean;
  isHit: boolean;
  buyUpgrade: (id: string) => void;
};

// ─────────────────────────────────────────
//  カスタムフック
// ─────────────────────────────────────────

export function useGameLoop(): GameLoopResult {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(UPGRADES);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isHit, setIsHit] = useState(false);

  const stateRef = useRef<GameState>(INITIAL_STATE);
  const dmgIdCounter = useRef(0);
  const damageTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ─── クリーンアップ：タイマーをすべてクリア ───
  useEffect(() => {
    return () => {
      damageTimersRef.current.forEach((timer) => clearTimeout(timer));
      damageTimersRef.current.clear();
    };
  }, []);

  // ─── ダメージ数字をスポーン ───
  const spawnDamageNumber = useCallback(
    (value: string, x: number, y: number, color: string = '#ff6666') => {
      const id = dmgIdCounter.current++;
      setDamageNumbers((prev) => [...prev, { id, value, x, y, color }]);

      const timer = setTimeout(() => {
        setDamageNumbers((prev) => prev.filter((d) => d.id !== id));
        damageTimersRef.current.delete(timer);
      }, GAME_CONFIG.DAMAGE_NUMBER_DURATION);

      damageTimersRef.current.add(timer);
    },
    []
  );

  // ─── 攻撃エフェクト ───
  const triggerAttack = useCallback(() => {
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), GAME_CONFIG.ATTACK_ANIMATION_DURATION);
  }, []);

  // ─── ダメージエフェクト ───
  const triggerHit = useCallback(() => {
    setIsHit(true);
    setTimeout(() => setIsHit(false), GAME_CONFIG.HIT_ANIMATION_DURATION);
  }, []);

  // ─── アップグレード購入 ───
  const buyUpgrade = useCallback(
    (upgradeId: string) => {
      const current = stateRef.current;
      const upg = upgrades.find((u) => u.id === upgradeId);
      if (!upg) return;

      const currentCost = Math.floor(
        upg.baseCost * Math.pow(GAME_CONFIG.UPGRADE_COST_MULTIPLIER, upg.level)
      );
      if (current.gold < currentCost) return;

      const newState = upg.apply({ ...current, gold: current.gold - currentCost });
      setState(newState);
      setUpgrades((prev) =>
        prev.map((u) => (u.id === upgradeId ? { ...u, level: u.level + 1 } : u))
      );
    },
    [upgrades]
  );

  // ─── メインゲームループ（requestAnimationFrame版） ───
  useEffect(() => {
    let lastTime = performance.now();
    let rafId: number;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, GAME_CONFIG.MAX_DELTA_TIME);
      lastTime = currentTime;

      setState((prev) => {
        let s = tickGame(prev, dt);

        // ── 敵のスポーン ──
        s = handleEnemySpawn(s);

        // ── 敵を移動 ──
        s = handleEnemyMovement(s, dt);

        // ── 主人公の攻撃 ──
        const attackResult = handlePlayerAttack(s);
        s = attackResult.state;

        if (attackResult.didAttack && attackResult.damage && attackResult.targetX) {
          // クリティカルの場合は色を変える
          const damageColor = attackResult.isCritical ? '#ffff00' : '#ff6666';
          const damagePrefix = attackResult.isCritical ? 'CRIT! -' : '-';

          spawnDamageNumber(
            `${damagePrefix}${attackResult.damage}`,
            attackResult.targetX,
            20,
            damageColor
          );
          triggerAttack();

          if (attackResult.goldGained) {
            spawnDamageNumber(
              `+${attackResult.goldGained}G`,
              attackResult.targetX,
              10,
              '#f0c040'
            );
          }
        }

        // ── 敵の攻撃 ──
        const enemyAttackResult = handleEnemyAttack(s, dt);
        s = enemyAttackResult.state;

        if (enemyAttackResult.didAttack && enemyAttackResult.totalDamage) {
          spawnDamageNumber(
            `-${enemyAttackResult.totalDamage}`,
            GAME_CONFIG.HERO_POSITION_X,
            25,
            '#ff4444'
          );
          triggerHit();

          if (enemyAttackResult.didDie) {
            spawnDamageNumber(
              '💀 REVIVE!',
              GAME_CONFIG.HERO_POSITION_X,
              15,
              '#c084fc'
            );
          }
        }

        // ── 画面外の敵を削除 ──
        s = cleanupOffscreenEnemies(s);

        return s;
      });

      rafId = requestAnimationFrame(gameLoop);
    };

    rafId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [spawnDamageNumber, triggerAttack, triggerHit]);

  return { state, upgrades, damageNumbers, isAttacking, isHit, buyUpgrade };
}

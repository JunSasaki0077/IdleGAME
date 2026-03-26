// ============================================================
//  screens/GameScreen.tsx
//  ゲーム画面全体のレイアウト
//  セーブ/ロード・オフライン報酬・自動セーブ対応
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react'; // eslint-disable-line
import { View, Text, AppState, type AppStateStatus } from 'react-native';
import { BattleField } from '../components/battle/BattleField';
import { StatusPanel } from '../components/status/StatusPanel';
import { SkillSelectModal } from '../components/SkillSelectModal';
import { useGameLoop } from '../state/useGameLoop';
import { saveGame, loadGame, type SaveData } from '../utils/storage';
import { INITIAL_STATE } from '../state/gameState';
import { UPGRADES } from '../constants/gameData';

const AUTO_SAVE_INTERVAL_MS = 30_000; // 30秒ごとに自動セーブ

// ─────────────────────────────────────────
//  ローディング画面
// ─────────────────────────────────────────

const LoadingScreen: React.FC = () => (
  <View className="flex-1 bg-game-dark items-center justify-center gap-3">
    <Text className="text-4xl">⚔️</Text>
    <Text className="text-game-text font-mono text-sm tracking-widest">LOADING...</Text>
  </View>
);

// ─────────────────────────────────────────
//  ゲーム本体（セーブデータが確定してからマウント）
// ─────────────────────────────────────────

type GameProps = {
  saveData: SaveData | null;
};

const Game: React.FC<GameProps> = ({ saveData }) => {
  const initialState = saveData?.state ?? INITIAL_STATE;

  const {
    state, upgrades, damageNumbers,
    isAttacking, isHit,
    buyUpgrade, skillChoices, selectSkill, upgradeSkill,
  } = useGameLoop({
    initialState,
    initialUpgrades: saveData?.upgrades ?? UPGRADES,
  });

  const stateRef    = useRef(state);
  const upgradesRef = useRef(upgrades);
  useEffect(() => { stateRef.current    = state;    }, [state]);
  useEffect(() => { upgradesRef.current = upgrades; }, [upgrades]);

  const doSave = useCallback(() => {
    saveGame(stateRef.current, upgradesRef.current).catch(() => {});
  }, []);

  // 自動セーブ（30秒ごと）
  useEffect(() => {
    const id = setInterval(doSave, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [doSave]);

  // アプリがバックグラウンドに入った時にセーブ
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status === 'background' || status === 'inactive') doSave();
    });
    return () => sub.remove();
  }, [doSave]);

  return (
    <View className="flex-1 bg-game-dark">
      <BattleField
        state={state}
        damageNumbers={damageNumbers}
        isAttacking={isAttacking}
        isHit={isHit}
      />

      <StatusPanel
        state={state}
        upgrades={upgrades}
        onBuy={buyUpgrade}
        onUpgradeSkill={upgradeSkill}
      />

      {skillChoices.length > 0 && (
        <SkillSelectModal
          choices={skillChoices}
          acquiredIds={state.acquiredSkills.map((s) => s.defId)}
          onSelect={selectSkill}
        />
      )}

    </View>
  );
};

// ─────────────────────────────────────────
//  エントリーポイント（ロード処理）
// ─────────────────────────────────────────

export const GameScreen: React.FC = () => {
  const [loading, setLoading]   = useState(true);
  const [saveData, setSaveData] = useState<SaveData | null>(null);

  useEffect(() => {
    loadGame().then((data) => {
      if (data) setSaveData(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingScreen />;

  return <Game saveData={saveData} />;
};

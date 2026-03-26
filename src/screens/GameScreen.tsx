// ============================================================
//  screens/GameScreen.tsx
//  ゲーム画面全体のレイアウト
//  セーブ/ロード・自動セーブ・ウェーブシステム・ランオーバー対応
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react'; // eslint-disable-line
import { View, Text, Pressable, AppState, type AppStateStatus } from 'react-native';
import { BattleField } from '../components/battle/BattleField';
import { StatusPanel } from '../components/status/StatusPanel';
import { SkillSelectModal } from '../components/SkillSelectModal';
import { RunOverModal } from '../components/RunOverModal';
import { LabModal } from '../components/LabModal';
import { useGameLoop } from '../state/useGameLoop';
import { saveGame, loadGame, type SaveData } from '../utils/storage';
import { INITIAL_STATE } from '../state/gameState';
import { UPGRADES } from '../constants/gameData';
import { applyPermanentBonuses, purchasePermanentUpgrade, type PermanentData } from '../state/permanentState';

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
  permanent: PermanentData;
  onPermanentUpdate: (data: PermanentData) => void;
  onGoToStart: () => void;
};

const Game: React.FC<GameProps> = ({ saveData, permanent, onPermanentUpdate, onGoToStart }) => {
  const baseState    = saveData?.state ?? INITIAL_STATE;
  const initialState = applyPermanentBonuses(baseState, permanent);
  const [showLab, setShowLab] = useState(false);

  const {
    state, upgrades, damageNumbers,
    isAttacking, isHit,
    buyUpgrade, skillChoices, selectSkill, upgradeSkill,
    isRunOver, gemsEarned, retireRun,
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

  // ランオーバー検知 → ジェム保存（一度だけ）
  // permanentRef で最新の permanent を参照しつつ、gemsAdded フラグで二重加算を防ぐ
  const permanentRef = useRef(permanent);
  const gemsAddedRef = useRef(false);
  useEffect(() => { permanentRef.current = permanent; }, [permanent]);
  useEffect(() => {
    if (isRunOver && !gemsAddedRef.current) {
      gemsAddedRef.current = true;
      const updated: PermanentData = {
        ...permanentRef.current,
        gems: permanentRef.current.gems + gemsEarned,
      };
      onPermanentUpdate(updated);
    }
  }, [isRunOver, gemsEarned, onPermanentUpdate]);

  const handleLabPurchase = (upgradeId: string) => {
    const updated = purchasePermanentUpgrade(permanent, upgradeId);
    if (updated) onPermanentUpdate(updated);
  };

  return (
    <View className="flex-1 bg-game-dark">
      <BattleField
        state={state}
        damageNumbers={damageNumbers}
        isAttacking={isAttacking}
        isHit={isHit}
      />

      {/* リタイアボタン */}
      <Pressable
        className="absolute top-2 right-3 bg-[#1a0f2e] border border-[#4a3060] rounded-lg px-2 py-1"
        onPress={retireRun}
      >
        <Text className="font-mono text-[9px] text-[#6666aa]">リタイア</Text>
      </Pressable>

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

      {/* ランオーバーモーダル */}
      <RunOverModal
        visible={isRunOver}
        waveReached={state.waveNumber}
        gemsEarned={gemsEarned}
        onRetry={onGoToStart}
        onGoToLab={() => {
          setShowLab(true);
        }}
      />

      {/* ラボモーダル（ランオーバー後から開ける） */}
      <LabModal
        visible={showLab}
        permanent={permanent}
        onPurchase={handleLabPurchase}
        onClose={() => {
          setShowLab(false);
          onGoToStart();
        }}
      />
    </View>
  );
};

// ─────────────────────────────────────────
//  エントリーポイント（ロード処理）
// ─────────────────────────────────────────

type Props = {
  permanent: PermanentData;
  onPermanentUpdate: (data: PermanentData) => void;
  onGoToStart: () => void;
};

export const GameScreen: React.FC<Props> = ({ permanent, onPermanentUpdate, onGoToStart }) => {
  const [loading, setLoading]   = useState(true);
  const [saveData, setSaveData] = useState<SaveData | null>(null);

  useEffect(() => {
    loadGame().then((data) => {
      if (data) setSaveData(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Game
      saveData={saveData}
      permanent={permanent}
      onPermanentUpdate={onPermanentUpdate}
      onGoToStart={onGoToStart}
    />
  );
};

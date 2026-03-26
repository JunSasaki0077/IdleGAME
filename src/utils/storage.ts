// ============================================================
//  utils/storage.ts
//  AsyncStorage を使ったセーブ・ロード
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_STATE, type GameState } from '../state/gameState';
import { UPGRADES } from '../constants/gameData';
import { INITIAL_PERMANENT, type PermanentData } from '../state/permanentState';
import type { Upgrade } from '../types/gameTypes';

const SAVE_KEY = 'idle_rpg_save_v1';
const PERMANENT_KEY = 'idle_rpg_permanent_v1';

export type SaveData = {
  state: GameState;
  upgrades: Upgrade[];
  savedAt: number; // Date.now()
};

/** ゲームを保存する */
export async function saveGame(state: GameState, upgrades: Upgrade[]): Promise<void> {
  // 戦闘中の一時データはリセットして保存
  const stateToSave: GameState = {
    ...state,
    enemies:       [],
    projectiles:   [],
    spawnTimer:    0,
    enemyAtkTimer: 0,
    skillTimers:   {},
  };
  const data: SaveData = { state: stateToSave, upgrades, savedAt: Date.now() };
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

/** セーブデータを読み込む。存在しない場合は null を返す */
export async function loadGame(): Promise<SaveData | null> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    // 旧バージョンのセーブに存在しないフィールドをデフォルト値で補完
    data.state = { ...INITIAL_STATE, ...data.state, enemies: [], projectiles: [] };
    data.upgrades = mergeUpgrades(data.upgrades);
    return data;
  } catch {
    return null;
  }
}

/** セーブデータを削除する */
export async function deleteSave(): Promise<void> {
  await AsyncStorage.removeItem(SAVE_KEY);
}

// ─────────────────────────────────────────
//  永続データ（ラボ）
// ─────────────────────────────────────────

/** 永続データを保存する */
export async function savePermanent(data: PermanentData): Promise<void> {
  await AsyncStorage.setItem(PERMANENT_KEY, JSON.stringify(data));
}

/** 永続データを読み込む。存在しない場合は初期値を返す */
export async function loadPermanent(): Promise<PermanentData> {
  try {
    const raw = await AsyncStorage.getItem(PERMANENT_KEY);
    if (!raw) return INITIAL_PERMANENT;
    const data = JSON.parse(raw) as PermanentData;
    return { ...INITIAL_PERMANENT, ...data };
  } catch {
    return INITIAL_PERMANENT;
  }
}

/**
 * 保存済みアップグレードと最新の定義をマージする。
 * 新しく追加されたアップグレードはデフォルト値で補完する。
 */
function mergeUpgrades(saved: Upgrade[]): Upgrade[] {
  return UPGRADES.map((def) => {
    const found = saved.find((u) => u.id === def.id);
    return found ?? def;
  });
}

# IdleRPG プロジェクト

## プロジェクト概要
React NativeとExpoを使用したモバイル向け放置系RPGゲーム。
プレイヤーは自動的に敵と戦い、リソースを獲得し、キャラクターを強化していく。

## 技術スタック
- フレームワーク: React Native 0.81.5
- ランタイム: Expo ~54.0.0
- 言語: TypeScript 5.9.2 (strict mode)
- UI: React 19.1.0
- スタイリング: NativeWind (Tailwind CSS for React Native)
- プラットフォーム: iOS, Android, Web

## ディレクトリ構造
```
/src
  /components        - UI コンポーネント（すべてNativeWindでスタイリング）
    /battle         - バトル関連（Hero, EnemySprite, BattleField）
    /status         - ステータス表示（ResourceBar, StatusPanel, GoldDisplay, UpgradeList）
  /screens          - 画面コンポーネント（GameScreen）
  /state            - ゲーム状態管理
    - gameState.ts  - 状態定義・初期値
    - gameLogic.ts  - 分離されたゲームロジック関数群
    - useGameLoop.ts - ゲームループ管理フック（requestAnimationFrame使用）
  /types            - TypeScript 型定義（gameTypes、GameState含む）
  /constants        - ゲーム定数
    - gameData.ts   - 敵・アップグレード・クラスのデータ
    - gameConfig.ts - マジックナンバーを集約した設定値
  /utils            - ユーティリティ関数（format）
/assets             - 画像、音声などの静的リソース
```

## コーディング規則

### TypeScript
- TypeScriptの strict mode を常に有効化
- 型注釈を明示的に記述（any は避ける）
- インターフェースと型定義は `/src/types` に配置
- すべての関数とコンポーネントに適切な型を付与

### React Native コンポーネント
- 関数コンポーネントを使用（クラスコンポーネントは避ける）
- Hooks を活用（useState, useEffect, カスタムフック）
- コンポーネントは単一責任の原則に従う
- パフォーマンス最適化に `React.memo` と `useMemo` を活用

### 命名規則
- コンポーネント: PascalCase（例: `BattleField`, `StatusPanel`）
- 関数・変数: camelCase（例: `useGameLoop`, `gameState`）
- 定数: UPPER_SNAKE_CASE または camelCase（例: `GAME_DATA`）
- ファイル名: コンポーネントは PascalCase、その他は camelCase

### スタイリング
- **NativeWind (Tailwind CSS)** を使用してスタイリング
- `className` プロパティを使用してTailwindクラスを適用
- StyleSheet.create() は使用しない（レガシーコードを除く）
- カスタムカラーは `tailwind.config.js` に定義
  - `game-dark`: メインの背景色
  - `game-purple`: アクセントカラー
  - `game-text`: テキストカラー
- 複雑なアニメーションやダイナミックスタイルにはインラインスタイルを使用可能
- レスポンシブデザインにはTailwindのユーティリティクラスを活用

## ゲームロジック設計原則

### 放置系ゲームの特性
- ゲームループは自動で進行（useGameLoop）
- プレイヤーの介入は最小限（アップグレード選択など）
- リソース獲得は時間ベース
- プログレッションは段階的かつ視覚的にわかりやすく

### 状態管理
- ゲーム状態は `/src/state/gameState.ts` で一元管理
- 複雑な状態ロジックには useReducer を検討
- グローバル状態が必要な場合は Context API を使用
- 永続化が必要なデータは AsyncStorage を活用

### パフォーマンス
- **requestAnimationFrame** を使用したゲームループ（setIntervalより効率的）
- **React.memo** でコンポーネントを最適化（不要な再レンダリングを防ぐ）
- 適切な比較関数を使って再レンダリング条件を制御
- メモリリーク対策（useEffectのクリーンアップ、タイマー管理）
- ゲームロジックを小さな関数に分割して可読性と保守性を向上
- 60 FPS を目標とする

## Claude への指示

### コード生成時の原則
- 常にTypeScriptの型安全性を保つ
- 新規コンポーネント作成時は既存のパターンに従う
- コメントは複雑なロジックにのみ追加（自明なコードには不要）
- エラーハンドリングを適切に実装（配列が空でないか確認など）
- **スタイリングは必ずNativeWind（className）を使用**
- StyleSheet.create() は絶対に使用しない
- **React.memoで最適化**：頻繁に再レンダリングされるコンポーネントは必ずメモ化
- **マジックナンバー禁止**：数値定数は `/src/constants/gameConfig.ts` に定義
- 複雑なロジックは小さな関数に分割（1関数1責任）

### ファイル操作
- 既存ファイルの編集を優先（新規作成は最小限に）
- ファイルパスは絶対パスで指定
- 変更前に必ずファイルを読み込んで現在の内容を確認

### ゲーム機能追加時
- ゲームバランスを考慮（インフレ、難易度調整）
- ユーザー体験を重視（わかりやすいUI、スムーズな操作）
- 既存のゲームデータ構造に整合性を保つ
- テストプレイ可能な状態で実装

## セキュリティとベストプラクティス

### データの扱い
- ユーザーデータは適切に検証
- センシティブなデータは暗号化
- アプリのバックグラウンド/フォアグラウンド遷移を適切に処理

### パフォーマンス
- 画像の最適化（圧縮、適切なサイズ）
- 不要な console.log は削除
- プロダクションビルドでのデバッグコード除去

### テスト
- 重要なゲームロジックにはユニットテストを追加
- コンポーネントのスナップショットテストを検討
- 実機テストで動作確認

## プロジェクト固有の要件

### ゲームバランス
- 敵の強さはプレイヤーのレベルに応じて調整
- アップグレードコストは指数関数的に増加
- リソース獲得量は段階的に増加

### UI/UX
- レスポンシブ対応（様々な画面サイズ）
- アニメーションは滑らかに（React Native Animated API）
- タッチフィードバックを適切に実装
- 読み込み状態を視覚的に表示

### 今後の拡張予定
- セーブ/ロード機能（AsyncStorage使用）
- 複数の敵タイプ（現在6種類、さらに追加可能）
- アイテムシステム
- アチーブメント
- サウンドエフェクト
- ユニットテスト追加（Jest）
- E2Eテスト（Detox）

### 最近実装した最適化
- ✅ 全コンポーネントをNativeWindに統一
- ✅ requestAnimationFrameベースのゲームループ
- ✅ React.memoによる再レンダリング最適化
- ✅ メモリリーク修正（タイマー管理）
- ✅ マジックナンバーの定数化
- ✅ ゲームロジックの分離と関数化
- ✅ 型定義の循環参照解消
- ✅ エラーハンドリング強化

## 開発コマンド
```bash
npm start          # Expo開発サーバー起動
npm run android    # Androidエミュレーターで起動
npm run ios        # iOSシミュレーターで起動
npm run web        # Web版で起動
```

## 注意事項
- このプロジェクトはExpoの管理下にあるため、Expo対応のライブラリのみ使用
- ネイティブモジュールの追加は慎重に（Expo Go互換性に注意）
- バージョン更新時はExpo SDKの互換性を確認

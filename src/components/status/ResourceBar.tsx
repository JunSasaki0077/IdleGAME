// ============================================================
//  components/status/ResourceBar.tsx
//  HPバー・XPバーなど汎用バーコンポーネント
// ============================================================

import React from 'react';
import { View, Text } from 'react-native';
import { clampRatio } from '../../utils/format';

// ─────────────────────────────────────────
//  Props
// ─────────────────────────────────────────

type Props = {
  icon: string;           // 先頭に表示するアイコン（例: "❤️"）
  current: number;        // 現在値
  max: number;            // 最大値
  color: string;          // バーの色（例: "#e74c3c"）
  showValue?: boolean;    // 右に数値を表示するか（デフォルト: true）
};

// ─────────────────────────────────────────
//  コンポーネント
// ─────────────────────────────────────────

export const ResourceBar: React.FC<Props> = React.memo(({
  icon,
  current,
  max,
  color,
  showValue = true,
}) => {
  const ratio = clampRatio(current, max);

  return (
    <View className="flex-row items-center gap-1.5 mb-1.5">
      {/* アイコン */}
      <Text className="text-xs w-[18px] text-center">{icon}</Text>

      {/* バー */}
      <View
        className="flex-1 h-2.5 rounded-[5px] overflow-hidden border"
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <View
          className="h-full rounded-[5px]"
          style={{ width: `${ratio * 100}%`, backgroundColor: color }}
        />
      </View>

      {/* 数値 */}
      {showValue && (
        <Text className="font-mono text-[9px] text-[#6666aa] w-[72px] text-right">
          {Math.floor(current)}/{Math.floor(max)}
        </Text>
      )}
    </View>
  );
}, (prev, next) => {
  return (
    prev.current === next.current &&
    prev.max === next.max &&
    prev.icon === next.icon &&
    prev.color === next.color &&
    prev.showValue === next.showValue
  );
});

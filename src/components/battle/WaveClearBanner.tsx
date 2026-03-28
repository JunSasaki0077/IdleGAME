// ============================================================
//  components/battle/WaveClearBanner.tsx
//  ウェーブクリア時のリッチな演出バナー
// ============================================================

import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GAME_CONFIG } from '../../constants/gameConfig';

type Props = {
  waveBreaking: boolean;
  waveNumber: number;     // クリアしたウェーブ番号
  waveBreakTimer: number; // 残り秒数
  isBossWave: boolean;
};

function triggerHaptic(heavy: boolean) {
  if (heavy) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

export const WaveClearBanner: React.FC<Props> = React.memo(({
  waveBreaking,
  waveNumber,
  waveBreakTimer,
  isBossWave,
}) => {
  const opacity  = useSharedValue(0);
  const scale    = useSharedValue(0.6);
  const translateY = useSharedValue(-30);

  useEffect(() => {
    if (waveBreaking) {
      // 入場：スプリングで弾む
      opacity.value    = withTiming(1, { duration: 200 });
      scale.value      = withSpring(1, { damping: 10, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 12, stiffness: 180 });

      // 退場：休憩終了0.5秒前にフェードアウト
      const exitDelay = Math.max(0, (GAME_CONFIG.WAVE_BREAK_DURATION - 0.5) * 1000);
      opacity.value    = withDelay(exitDelay, withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }));
      scale.value      = withDelay(exitDelay, withTiming(0.8, { duration: 400 }));

      // Haptics（JS側で実行）
      runOnJS(triggerHaptic)(isBossWave);
    } else {
      // 非表示リセット
      opacity.value    = 0;
      scale.value      = 0.6;
      translateY.value = -30;
    }
  }, [waveBreaking]); // eslint-disable-line react-hooks/exhaustive-deps

  const containerStyle = useAnimatedStyle(() => ({
    opacity:    opacity.value,
    transform:  [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  // バナーが非表示なら何もレンダリングしない
  if (!waveBreaking && opacity.value === 0) return null;

  const secsLeft = Math.ceil(waveBreakTimer);

  return (
    <Animated.View
      style={[containerStyle, {
        position:        'absolute',
        top:             '18%',
        alignSelf:       'center',
        alignItems:      'center',
        zIndex:          50,
        paddingHorizontal: 24,
        paddingVertical:   12,
        borderRadius:    16,
        borderWidth:     1.5,
        borderColor:     isBossWave ? '#ef4444' : '#a855f7',
        backgroundColor: isBossWave ? 'rgba(30,5,5,0.92)' : 'rgba(10,5,30,0.92)',
      }]}
    >
      {/* トップアイコン */}
      <Text style={{ fontSize: 28, marginBottom: 2 }}>
        {isBossWave ? '💀' : '⭐'}
      </Text>

      {/* メインテキスト */}
      <Text style={{
        fontFamily:    'monospace',
        fontWeight:    'bold',
        fontSize:      22,
        letterSpacing: 4,
        color:         isBossWave ? '#f87171' : '#f0c040',
      }}>
        WAVE {waveNumber}
      </Text>

      <Text style={{
        fontFamily:    'monospace',
        fontWeight:    'bold',
        fontSize:      13,
        letterSpacing: 3,
        color:         isBossWave ? '#fca5a5' : '#e9d5ff',
        marginTop:     2,
      }}>
        {isBossWave ? 'BOSS DEFEATED!' : 'CLEAR!'}
      </Text>

      {/* 区切り線 */}
      <View style={{
        width:           120,
        height:          1,
        backgroundColor: isBossWave ? '#7f1d1d' : '#3b0764',
        marginVertical:  8,
      }} />

      {/* カウントダウン */}
      <Text style={{
        fontFamily:    'monospace',
        fontSize:      11,
        letterSpacing: 2,
        color:         'rgba(200,180,255,0.6)',
      }}>
        Next Wave in {secsLeft}s
      </Text>
    </Animated.View>
  );
});

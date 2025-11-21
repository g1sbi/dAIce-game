import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface BettingTimerProps {
  seconds: number;
  onExpire?: () => void;
  isRushRound?: boolean;
}

export default function BettingTimer({ seconds, onExpire, isRushRound = false }: BettingTimerProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (seconds <= 3) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [seconds]);

  useEffect(() => {
    const speed = isRushRound ? 200 : 300 / (11 - seconds);
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: speed }),
        withTiming(1, { duration: speed })
      ),
      -1,
      true
    );
  }, [seconds, isRushRound]);

  const animatedStyle = useAnimatedStyle(() => {
    const colorInterpolation = interpolate(
      seconds,
      [0, 3, 10],
      [1, 1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      color: colorInterpolation > 0.5 ? '#FF4458' : '#FFFFFF',
    };
  });

  if (seconds <= 0 && onExpire) {
    onExpire();
  }

  return (
    <Animated.Text style={[styles.timer, animatedStyle, { fontSize: isRushRound ? 56 : 48 }]}>
      {seconds}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


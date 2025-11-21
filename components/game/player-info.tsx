import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

interface PlayerInfoProps {
  points: number;
  winStreak: number;
  round: number;
  totalRounds?: number;
  isOpponent?: boolean;
}

export default function PlayerInfo({
  points,
  winStreak,
  round,
  totalRounds = 20,
  isOpponent = false,
}: PlayerInfoProps) {
  const animatedPoints = useSharedValue(points);
  const scale = useSharedValue(1);

  useEffect(() => {
    animatedPoints.value = withTiming(points, { duration: 500 });
    scale.value = withSpring(1.1, { damping: 8 }, () => {
      scale.value = withSpring(1, { damping: 8 });
    });
  }, [points]);

  const pointsStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const displayPoints = Math.max(0, Math.floor(animatedPoints.value));

  return (
    <View style={[styles.container, isOpponent && styles.opponentContainer]}>
      <View style={styles.pointsContainer}>
        <Text style={styles.label}>{isOpponent ? 'Opponent' : 'Your'} Points</Text>
        <Animated.Text style={[styles.points, pointsStyle]}>
          {displayPoints}
        </Animated.Text>
      </View>

      <View style={styles.statsRow}>
        {winStreak > 0 && (
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{winStreak}</Text>
          </View>
        )}
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Round</Text>
          <Text style={styles.statValue}>
            {round}/{totalRounds}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    gap: 12,
  },
  opponentContainer: {
    backgroundColor: '#2A1A2A',
  },
  pointsContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  points: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});


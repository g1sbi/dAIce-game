import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameState } from '@/lib/game-state';
import { roomManager } from '@/lib/room-manager';
import Dice from '@/components/game/dice';
import BettingTimer from '@/components/game/betting-timer';
import BettingPanel from '@/components/game/betting-panel';
import PlayerInfo from '@/components/game/player-info';
import ResultsOverlay from '@/components/game/results-overlay';
import type { Prediction, RoundResults } from '@/lib/game-logic';

export default function GameScreen() {
  const router = useRouter();
  const {
    currentDice,
    round,
    myScore,
    opponentScore,
    myBet,
    opponentBet,
    betLocked,
    timeRemaining,
    gamePhase,
    winStreak,
    actions,
  } = useGameState();

  const {
    lastRoundResults,
  } = useGameState();
  
  const [showResults, setShowResults] = useState(false);
  const isRushRound = round % 5 === 0 && round > 0;

  useEffect(() => {
    if (gamePhase === 'GAME_OVER') {
      setTimeout(() => {
        router.push('/');
        actions.reset();
        roomManager.leaveRoom();
      }, 3000);
    }
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase === 'RESULTS' && lastRoundResults) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [gamePhase, lastRoundResults]);

  const handleBet = (amount: number, prediction: Prediction) => {
    if (betLocked || gamePhase !== 'BETTING') return;
    roomManager.lockBet(amount, prediction);
  };

  const handleTimerExpire = () => {
    if (gamePhase === 'BETTING' && !betLocked) {
      roomManager.lockBet(0, 'higher');
    }
  };

  const handleResultsDismiss = () => {
    setShowResults(false);
    actions.setLastRoundResults(null);
  };

  const getMyResult = () => {
    if (!lastRoundResults) return null;
    const playerId = useGameState.getState().playerId;
    return lastRoundResults.playerResults[playerId] || null;
  };

  const getOpponentResult = () => {
    if (!lastRoundResults) return null;
    const opponentId = useGameState.getState().opponentId;
    if (!opponentId) return null;
    return lastRoundResults.playerResults[opponentId] || null;
  };

  const myResult = getMyResult();
  const opponentResult = getOpponentResult();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.opponentArea}>
          <PlayerInfo
            points={opponentScore}
            winStreak={0}
            round={round}
            isOpponent
          />
          <View style={styles.betStatus}>
            {opponentBet ? (
              <View style={styles.lockedIndicator}>
                <Text style={styles.lockedText}>✓ Locked In</Text>
              </View>
            ) : (
              <Text style={styles.thinkingText}>Thinking...</Text>
            )}
          </View>
        </View>

        <View style={styles.diceSection}>
          <View style={styles.currentDice}>
            <Dice value={currentDice} size={120} animated={gamePhase === 'REVEALING'} />
          </View>
          <View style={styles.timerContainer}>
            {gamePhase === 'BETTING' ? (
              <BettingTimer
                seconds={timeRemaining}
                onExpire={handleTimerExpire}
                isRushRound={isRushRound}
              />
            ) : gamePhase === 'REVEALING' ? (
              <Text style={styles.rollingText}>Rolling...</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.bettingArea}>
          {gamePhase === 'BETTING' && (
            <BettingPanel
              maxAmount={myScore}
              onBet={handleBet}
              disabled={betLocked}
              locked={betLocked}
            />
          )}
          {betLocked && gamePhase === 'BETTING' && (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>Waiting for opponent...</Text>
            </View>
          )}
        </View>

        <View style={styles.myStats}>
          <PlayerInfo points={myScore} winStreak={winStreak} round={round} />
        </View>
      </View>

      {showResults && lastRoundResults && myResult && opponentResult && (
        <ResultsOverlay
          dice={lastRoundResults.dice}
          myResult={myResult.result}
          myPointsChange={myResult.pointsChange}
          myBonuses={myResult.bonuses}
          opponentResult={opponentResult.result}
          opponentPointsChange={opponentResult.pointsChange}
          opponentBonuses={opponentResult.bonuses}
          onDismiss={handleResultsDismiss}
        />
      )}

      {gamePhase === 'GAME_OVER' && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <Text style={styles.finalScore}>
            You: {myScore} | Opponent: {opponentScore}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  opponentArea: {
    gap: 6,
    flex: 0.2,
  },
  betStatus: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  lockedIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1A3A1A',
  },
  lockedText: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '600',
  },
  thinkingText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  diceSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 0.3,
  },
  currentDice: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollingText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bettingArea: {
    gap: 12,
    flex: 0.3,
    justifyContent: 'center',
  },
  waitingContainer: {
    padding: 12,
    alignItems: 'center',
  },
  waitingText: {
    color: '#888',
    fontSize: 14,
  },
  myStats: {
    flex: 0.2,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  gameOverText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  finalScore: {
    fontSize: 24,
    color: '#888',
  },
});


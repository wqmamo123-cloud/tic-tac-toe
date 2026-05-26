'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES, X_SKINS, O_SKINS, type Player } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { Home, RotateCcw, Undo2, Clock, ArrowRight, Map, Star } from 'lucide-react';

export default function GameBoardScreen() {
  const {
    board,
    currentPlayer,
    gameActive,
    winner,
    winningLine,
    moveHistory,
    scores,
    gridSize,
    winCondition,
    isAIThinking,
    theme,
    xSkin,
    oSkin,
    gameMode,
    aiDifficulty,
    timeLimit,
    playerSymbol,
    makeMove,
    undoMove,
    resetGame,
    setScreen,
    initGame,
    player1Name,
    player2Name,
    campaignLevels,
    currentCampaignLevel,
    setCurrentCampaignLevel,
    setGridSize,
    setWinCondition,
    setGameMode,
  } = useGameStore();

  const t = THEMES[theme];
  const xRender = X_SKINS.find((s) => s.id === xSkin)?.render || 'X';
  const oRender = O_SKINS.find((s) => s.id === oSkin)?.render || 'O';

  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Campaign helpers
  const currentLevel = campaignLevels.find((l) => l.id === currentCampaignLevel);
  const nextLevel = currentCampaignLevel > 0
    ? campaignLevels.find((l) => l.id === currentCampaignLevel + 1)
    : null;
  const isLastLevel = currentCampaignLevel > 0 && !nextLevel;

  // Get the stars earned for the current campaign level (after game ends)
  const completedLevel = winner && gameMode === 'campaign' && currentCampaignLevel > 0
    ? campaignLevels.find((l) => l.id === currentCampaignLevel)
    : null;
  const earnedStars = completedLevel?.stars ?? 0;

  // Determine if current turn belongs to the human player
  const isHumanTurn = gameMode === 'single' || gameMode === 'campaign'
    ? currentPlayer === playerSymbol
    : true; // In local/tournament, it's always a human turn

  // Determine if player won (for campaign)
  const playerWon = gameMode === 'campaign' && winner === playerSymbol;
  const playerDraw = gameMode === 'campaign' && winner === 'draw';

  // Time attack countdown
  useEffect(() => {
    if (!gameActive || timeLimit === 0 || winner) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Only countdown for human player
    if (!isHumanTurn) return;

    const start = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = timeLimit - elapsed;
      setCountdown(remaining);

      if (remaining <= 3 && remaining > 0) {
        soundManager.playCountdown();
      }

      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        soundManager.playTimeout();
        triggerHaptic([50, 50, 50]);
        // Skip turn
        const state = useGameStore.getState();
        if (state.gameActive) {
          const nextPlayer: Player = state.currentPlayer === 'X' ? 'O' : 'X';
          useGameStore.setState({
            currentPlayer: nextPlayer,
            turnStartTime: Date.now(),
          });
        }
      }
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentPlayer, gameActive, winner, timeLimit, gameMode, isHumanTurn]);

  // Play win/lose/draw sounds
  useEffect(() => {
    if (!winner) return;
    if (winner === 'draw') {
      soundManager.playDraw();
      triggerHaptic(30);
    } else if (gameMode === 'single' || gameMode === 'campaign') {
      // In single player, check if player won or AI won
      if (winner === playerSymbol) {
        soundManager.playWin();
      } else {
        soundManager.playLose();
      }
      triggerHaptic([50, 50, 100]);
    } else {
      soundManager.playWin();
      triggerHaptic([50, 50, 100]);
    }
  }, [winner, gameMode, playerSymbol]);

  const handleCellClick = useCallback(
    (index: number) => {
      if (!gameActive || board[index] !== null || isAIThinking) return;
      if (!isHumanTurn) return;

      // Play appropriate sound for the symbol being placed
      if (currentPlayer === 'X') {
        soundManager.playMoveX();
      } else {
        soundManager.playMoveO();
      }
      triggerHaptic(10);
      makeMove(index);
    },
    [gameActive, board, isAIThinking, currentPlayer, gameMode, makeMove, isHumanTurn]
  );

  const handleUndo = () => {
    soundManager.playClick();
    triggerHaptic(10);
    undoMove();
  };

  const handleReset = () => {
    soundManager.playClick();
    triggerHaptic(15);
    resetGame();
  };

  const handleHome = () => {
    soundManager.playClick();
    if (gameMode === 'campaign') {
      setScreen('campaign-map');
    } else {
      setScreen('welcome');
    }
  };

  const handleNextLevel = () => {
    if (!nextLevel) return;
    soundManager.playClick();
    triggerHaptic(20);
    setCurrentCampaignLevel(nextLevel.id);
    setGridSize(nextLevel.gridSize);
    setWinCondition(nextLevel.winCondition);
    setGameMode('campaign');
    useGameStore.setState({ aiDifficulty: nextLevel.difficulty });
    initGame();
  };

  const handleBackToMap = () => {
    soundManager.playClick();
    triggerHaptic(15);
    setScreen('campaign-map');
  };

  const maxBoardSize = Math.min(
    typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 500) : 400,
    500
  );

  const getPlayerName = (player: Player) => {
    if (gameMode === 'single' || gameMode === 'campaign') {
      return player === playerSymbol ? 'You' : 'AI';
    }
    if (player === 'X') return player1Name;
    return player2Name;
  };

  // Score labels based on game mode
  const scoreLabelX = gameMode === 'single' || gameMode === 'campaign'
    ? (playerSymbol === 'X' ? 'You' : 'AI')
    : 'P1';
  const scoreLabelO = gameMode === 'single' || gameMode === 'campaign'
    ? (playerSymbol === 'O' ? 'You' : 'AI')
    : 'P2';

  return (
    <div className="flex flex-col min-h-screen px-4 py-4">
      {/* Header: Home + Score */}
      <div className="flex items-center justify-between mb-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleHome}
          className={`${t.textSecondary} p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5`}
        >
          <Home size={22} />
        </motion.button>

        {/* Score Board */}
        <div className={`${t.card} rounded-xl px-3 py-2 flex items-center gap-4 text-sm`}>
          <div className="text-center">
            <div className={`${t.xColor} font-bold`}>{scores.X}</div>
            <div className={`${t.textSecondary} text-xs`}>{scoreLabelX}</div>
          </div>
          <div className="text-center">
            <div className={`${t.textSecondary} font-bold`}>{scores.draws}</div>
            <div className={`${t.textSecondary} text-xs`}>Draw</div>
          </div>
          <div className="text-center">
            <div className={`${t.oColor} font-bold`}>{scores.O}</div>
            <div className={`${t.textSecondary} text-xs`}>{scoreLabelO}</div>
          </div>
        </div>

        <div className="w-10" />
      </div>

      {/* Turn Indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPlayer + String(winner)}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="text-center mb-4"
        >
          {winner ? (
            <div>
              <div className={`${t.text} text-lg sm:text-xl font-bold`}>
                {winner === 'draw' ? (
                  "It's a Draw!"
                ) : (
                  <span className={winner === 'X' ? t.xColor : t.oColor}>
                    {getPlayerName(winner as Player)} Wins!
                  </span>
                )}
              </div>
              {/* Campaign stars display */}
              {gameMode === 'campaign' && currentCampaignLevel > 0 && (playerWon || playerDraw) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="flex items-center justify-center gap-1 mt-2"
                >
                  {[1, 2, 3].map((star) => (
                    <motion.div
                      key={star}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.4 + star * 0.15, type: 'spring', stiffness: 300 }}
                    >
                      <Star
                        size={24}
                        className={
                          star <= earnedStars
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-400 dark:text-gray-600'
                        }
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          ) : isAIThinking ? (
            <div className={`${t.textSecondary} text-base font-medium flex items-center justify-center gap-2`}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
              AI is thinking...
            </div>
          ) : (
            <div className={`${t.text} text-base font-medium flex items-center justify-center gap-2`}>
              <span className={currentPlayer === 'X' ? t.xColor : t.oColor}>
                {getPlayerName(currentPlayer)}&apos;s Turn
              </span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={currentPlayer === 'X' ? t.xColor : t.oColor}
              >
                {currentPlayer === 'X' ? xRender : oRender}
              </motion.span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Campaign Level Name */}
      {gameMode === 'campaign' && currentLevel && (
        <div className="text-center mb-1">
          <span className={`${t.accentText} text-xs font-bold uppercase tracking-wide`}>
            Level {currentLevel.id}: {currentLevel.name}
          </span>
        </div>
      )}

      {/* Time Attack Timer */}
      {timeLimit > 0 && gameActive && !winner && countdown !== null && isHumanTurn && (
        <div className="flex justify-center mb-3">
          <motion.div
            animate={countdown <= 3 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3, repeat: countdown <= 3 ? Infinity : 0 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              countdown <= 3
                ? 'bg-red-500/20 text-red-500'
                : countdown <= 5
                ? 'bg-amber-500/20 text-amber-500'
                : `${t.card} ${t.text}`
            }`}
          >
            <Clock size={16} />
            <span className="font-bold text-lg tabular-nums">{countdown}s</span>
          </motion.div>
        </div>
      )}

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className={`${t.board} ${t.boardBorder} border-2 rounded-2xl p-2 sm:p-3 shadow-xl`}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gap: gridSize <= 3 ? '6px' : gridSize <= 5 ? '4px' : '2px',
            width: maxBoardSize,
            maxWidth: '95vw',
          }}
        >
          {board.map((cell, index) => {
            const isWinCell = winningLine?.includes(index);

            return (
              <motion.button
                key={index}
                whileHover={cell === null && gameActive && !isAIThinking && isHumanTurn ? { scale: 1.05 } : {}}
                whileTap={cell === null && gameActive && !isAIThinking && isHumanTurn ? { scale: 0.95 } : {}}
                onClick={() => handleCellClick(index)}
                className={`
                  aspect-square rounded-lg sm:rounded-xl flex items-center justify-center
                  transition-colors duration-150 relative overflow-hidden
                  ${cell === null && gameActive && !isAIThinking && isHumanTurn ? `${t.cell} cursor-pointer` : t.cell}
                  ${isWinCell ? 'ring-2 ring-yellow-400 bg-yellow-400/10' : ''}
                `}
                style={{
                  fontSize: gridSize <= 3 ? '2rem' : gridSize <= 5 ? '1.5rem' : '0.9rem',
                  minHeight: gridSize <= 3 ? '80px' : gridSize <= 5 ? '55px' : '28px',
                }}
                disabled={cell !== null || !gameActive || isAIThinking || !isHumanTurn}
              >
                <AnimatePresence mode="wait">
                  {cell && (
                    <motion.span
                      key={cell + index}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      className={`font-black select-none ${
                        cell === 'X' ? t.xColor : t.oColor
                      } ${isWinCell ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : ''}`}
                    >
                      {cell === 'X' ? xRender : oRender}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Hover preview */}
                {cell === null && gameActive && !isAIThinking && !winner && isHumanTurn && (
                  <span
                    className={`absolute opacity-0 hover:opacity-20 transition-opacity duration-200 font-black ${
                      currentPlayer === 'X' ? t.xColor : t.oColor
                    }`}
                    style={{
                      fontSize: gridSize <= 3 ? '2rem' : gridSize <= 5 ? '1.5rem' : '0.9rem',
                    }}
                  >
                    {currentPlayer === 'X' ? xRender : oRender}
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* In-Game Controls */}
      <div className="flex items-center justify-center gap-3 mt-4 mb-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUndo}
          disabled={moveHistory.length === 0 || !gameActive || gameMode === 'online'}
          className={`${t.card} p-3 rounded-xl ${t.textSecondary} disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md transition-all`}
          title="Undo"
        >
          <Undo2 size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          disabled={gameMode === 'campaign' && !!winner}
          className={`${t.card} p-3 rounded-xl ${t.textSecondary} hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
          title="Restart"
        >
          <RotateCcw size={20} />
        </motion.button>

        {/* Campaign mode: show specific buttons after game ends */}
        {winner && gameMode === 'campaign' && currentCampaignLevel > 0 && (
          <>
            {playerWon && nextLevel && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextLevel}
                className={`${t.button} px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2`}
              >
                Next Level
                <ArrowRight size={18} />
              </motion.button>
            )}
            {playerWon && isLastLevel && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToMap}
                className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
              >
                All Clear!
                <Star size={18} className="fill-white" />
              </motion.button>
            )}
            {(!playerWon || isLastLevel) && !playerWon && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  soundManager.playClick();
                  triggerHaptic(15);
                  resetGame();
                }}
                className={`${t.button} px-5 py-3 rounded-xl font-bold shadow-lg`}
              >
                Try Again
              </motion.button>
            )}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToMap}
              className={`${t.card} px-4 py-3 rounded-xl font-medium ${t.text} flex items-center gap-2 hover:shadow-md transition-all`}
            >
              <Map size={16} />
              Map
            </motion.button>
          </>
        )}

        {/* Non-campaign: Play Again button */}
        {winner && gameMode !== 'campaign' && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              soundManager.playClick();
              triggerHaptic(15);
              resetGame();
            }}
            className={`${t.button} px-6 py-3 rounded-xl font-bold shadow-lg`}
          >
            Play Again
          </motion.button>
        )}
      </div>

      {/* Info badge */}
      {(gameMode === 'single' || gameMode === 'campaign') && (
        <div className="text-center mb-2">
          <span className={`${t.textSecondary} text-xs uppercase tracking-wide`}>
            {gameMode === 'campaign' && currentLevel
              ? `${currentLevel.difficulty} AI • ${currentLevel.gridSize}×${currentLevel.gridSize} • Level ${currentLevel.id}/30`
              : `${aiDifficulty} AI • ${gridSize}×${gridSize} • You play ${playerSymbol}`
            }
          </span>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES, TIME_ATTACK_OPTIONS, AIDifficulty } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { ArrowLeft, Clock, Play } from 'lucide-react';

const DIFFICULTIES: { id: AIDifficulty; name: string; emoji: string }[] = [
  { id: 'easy', name: 'Easy', emoji: '😊' },
  { id: 'medium', name: 'Medium', emoji: '🤔' },
  { id: 'hard', name: 'Hard', emoji: '😤' },
  { id: 'impossible', name: 'Impossible', emoji: '🤖' },
];

export default function TimeAttackSetupScreen() {
  const {
    setScreen,
    theme,
    aiDifficulty,
    setAIDifficulty,
    timeLimit,
    setTimeLimit,
    setGameMode,
    initGame,
    setGridSize,
    setWinCondition,
  } = useGameStore();
  const t = THEMES[theme];

  const handleStart = () => {
    soundManager.playClick();
    triggerHaptic(20);
    setGridSize(3);
    setWinCondition(3);
    initGame();
    setScreen('game');
  };

  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            soundManager.playClick();
            setScreen('mode-select');
          }}
          className={`${t.text} p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5`}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className={`text-2xl sm:text-3xl font-bold ${t.text}`}>Time Attack</h1>
      </div>

      <div className="max-w-lg mx-auto w-full flex-1 space-y-6">
        {/* Time Selection */}
        <div>
          <h3 className={`${t.text} font-bold mb-3 flex items-center gap-2`}>
            <Clock size={18} /> Time Per Move
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {TIME_ATTACK_OPTIONS.map((option) => (
              <motion.button
                key={option.seconds}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setTimeLimit(option.seconds);
                  soundManager.playClick();
                  triggerHaptic(10);
                }}
                className={`${t.card} rounded-xl p-4 text-center transition-all
                  ${timeLimit === option.seconds ? 'ring-2 ring-current' : ''}
                `}
              >
                <div className={`text-2xl font-black ${timeLimit === option.seconds ? t.accentText : t.text}`}>
                  {option.seconds}s
                </div>
                <div className={`text-xs ${t.textSecondary} mt-1`}>{option.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <h3 className={`${t.text} font-bold mb-3`}>AI Difficulty</h3>
          <div className="grid grid-cols-2 gap-3">
            {DIFFICULTIES.map((diff) => (
              <motion.button
                key={diff.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setAIDifficulty(diff.id);
                  soundManager.playClick();
                  triggerHaptic(10);
                }}
                className={`${t.card} rounded-xl p-3 flex items-center gap-3 transition-all
                  ${aiDifficulty === diff.id ? 'ring-2 ring-current' : ''}
                `}
              >
                <span className="text-2xl">{diff.emoji}</span>
                <span className={`font-bold text-sm ${t.text}`}>{diff.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className={`${t.card} rounded-xl p-4 border-dashed`}>
          <p className={`${t.textSecondary} text-sm text-center`}>
            ⏱ If time runs out, your turn is forfeited and play passes to the opponent!
          </p>
        </div>
      </div>

      {/* Start */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleStart}
        disabled={timeLimit === 0}
        className={`${t.button} w-full max-w-lg mx-auto py-4 rounded-2xl text-lg font-bold shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-40`}
      >
        <Play size={20} />
        Start Time Attack
      </motion.button>
    </div>
  );
}

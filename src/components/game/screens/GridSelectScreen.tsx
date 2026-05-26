'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES, GRID_CONFIGS } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { ArrowLeft, Play } from 'lucide-react';

export default function GridSelectScreen() {
  const { setScreen, gridSize, setGridSize, winCondition, setWinCondition, initGame, theme, gameMode, timeLimit } =
    useGameStore();
  const t = THEMES[theme];

  const handleSelect = (config: (typeof GRID_CONFIGS)[number]) => {
    soundManager.playClick();
    triggerHaptic(15);
    setGridSize(config.size);
    setWinCondition(config.winCondition);
  };

  const handleStart = () => {
    soundManager.playClick();
    triggerHaptic(20);
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
            if (gameMode === 'single') setScreen('difficulty-select');
            else setScreen('mode-select');
          }}
          className={`${t.text} p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className={`text-2xl sm:text-3xl font-bold ${t.text}`}>Choose Grid</h1>
      </div>

      <div className="flex flex-col gap-3 max-w-lg mx-auto w-full flex-1">
        {GRID_CONFIGS.map((config, index) => {
          const isSelected = gridSize === config.size && winCondition === config.winCondition;
          return (
            <motion.button
              key={`${config.size}-${config.winCondition}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(config)}
              className={`${t.card} rounded-2xl p-5 flex items-center gap-4 text-left transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-offset-2 ring-current' : ''
              }`}
            >
              {/* Mini grid preview */}
              <div
                className="shrink-0"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(config.size, 5)}, 1fr)`,
                  gap: '2px',
                  width: Math.min(config.size, 5) * 14,
                }}
              >
                {Array.from({ length: Math.min(config.size, 5) * Math.min(config.size, 5) }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${isSelected ? 'bg-current opacity-40' : 'bg-current opacity-15'}`}
                  />
                ))}
                {config.size > 5 && (
                  <div className="text-xs text-center col-span-5 mt-1 opacity-50">...</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${t.text}`}>{config.label}</h3>
                <p className={`text-sm ${t.textSecondary}`}>{config.description}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Start Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleStart}
        className={`${t.button} w-full max-w-lg mx-auto py-4 rounded-2xl text-lg font-bold shadow-lg mt-4 flex items-center justify-center gap-2`}
      >
        <Play size={20} />
        Start Game
      </motion.button>
    </div>
  );
}

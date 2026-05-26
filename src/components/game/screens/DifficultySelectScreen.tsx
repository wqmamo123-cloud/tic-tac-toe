'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES, AIDifficulty } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { ArrowLeft } from 'lucide-react';

const DIFFICULTIES: { id: AIDifficulty; name: string; description: string; emoji: string; stars: number }[] = [
  { id: 'easy', name: 'Easy', description: 'Random moves, beginner friendly', emoji: '😊', stars: 1 },
  { id: 'medium', name: 'Medium', description: 'Basic strategy, blocks your wins', emoji: '🤔', stars: 2 },
  { id: 'hard', name: 'Hard', description: 'Minimax algorithm, tough opponent', emoji: '😤', stars: 3 },
  { id: 'impossible', name: 'Impossible', description: 'Alpha-Beta pruning, never loses', emoji: '🤖', stars: 4 },
];

export default function DifficultySelectScreen() {
  const { setScreen, aiDifficulty, setAIDifficulty, theme, setGridSize, setWinCondition, initGame } = useGameStore();
  const t = THEMES[theme];

  const handleSelect = (diff: AIDifficulty) => {
    soundManager.playClick();
    triggerHaptic(15);
    setAIDifficulty(diff);
    setScreen('grid-select');
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
          className={`${t.text} p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className={`text-2xl sm:text-3xl font-bold ${t.text}`}>AI Difficulty</h1>
      </div>

      <div className="flex flex-col gap-3 max-w-lg mx-auto w-full">
        {DIFFICULTIES.map((diff, index) => (
          <motion.button
            key={diff.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(diff.id)}
            className={`${t.card} rounded-2xl p-5 flex items-center gap-4 text-left transition-all hover:shadow-lg ${
              aiDifficulty === diff.id ? 'ring-2 ring-offset-2 ring-current' : ''
            }`}
          >
            <div className="text-4xl">{diff.emoji}</div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${t.text}`}>{diff.name}</h3>
              <p className={`text-sm ${t.textSecondary}`}>{diff.description}</p>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < diff.stars ? 'text-yellow-500' : 'text-gray-300'}`}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

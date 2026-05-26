'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES, AIDifficulty, X_SKINS, O_SKINS, type Player } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { ArrowLeft } from 'lucide-react';

const DIFFICULTIES: { id: AIDifficulty; name: string; description: string; emoji: string; stars: number }[] = [
  { id: 'easy', name: 'Easy', description: 'Random moves, beginner friendly', emoji: '😊', stars: 1 },
  { id: 'medium', name: 'Medium', description: 'Basic strategy, blocks your wins', emoji: '🤔', stars: 2 },
  { id: 'hard', name: 'Hard', description: 'Minimax algorithm, tough opponent', emoji: '😤', stars: 3 },
  { id: 'impossible', name: 'Impossible', description: 'Alpha-Beta pruning, never loses', emoji: '🤖', stars: 4 },
];

export default function DifficultySelectScreen() {
  const { setScreen, aiDifficulty, setAIDifficulty, theme, playerSymbol, setPlayerSymbol, xSkin, oSkin } = useGameStore();
  const t = THEMES[theme];

  const xRender = X_SKINS.find((s) => s.id === xSkin)?.render || 'X';
  const oRender = O_SKINS.find((s) => s.id === oSkin)?.render || 'O';

  const handleSelect = (diff: AIDifficulty) => {
    soundManager.playClick();
    triggerHaptic(15);
    setAIDifficulty(diff);
    setScreen('grid-select');
  };

  const handleSymbolChange = (symbol: Player) => {
    soundManager.playClick();
    triggerHaptic(10);
    setPlayerSymbol(symbol);
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
        <h1 className={`text-2xl sm:text-3xl font-bold ${t.text}`}>Game Setup</h1>
      </div>

      <div className="flex flex-col gap-5 max-w-lg mx-auto w-full">
        {/* Symbol Selection */}
        <div>
          <h3 className={`${t.text} font-bold mb-3`}>Play As</h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSymbolChange('X')}
              className={`${t.card} rounded-2xl p-5 text-center transition-all ${
                playerSymbol === 'X' ? 'ring-2 ring-offset-2 ring-current' : ''
              }`}
            >
              <div className={`text-4xl font-black mb-2 ${t.xColor}`}>{xRender}</div>
              <div className={`text-sm font-bold ${t.text}`}>Play as X</div>
              <div className={`text-xs ${t.textSecondary} mt-1`}>You go first</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSymbolChange('O')}
              className={`${t.card} rounded-2xl p-5 text-center transition-all ${
                playerSymbol === 'O' ? 'ring-2 ring-offset-2 ring-current' : ''
              }`}
            >
              <div className={`text-4xl font-black mb-2 ${t.oColor}`}>{oRender}</div>
              <div className={`text-sm font-bold ${t.text}`}>Play as O</div>
              <div className={`text-xs ${t.textSecondary} mt-1`}>AI goes first</div>
            </motion.button>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <h3 className={`${t.text} font-bold mb-3`}>AI Difficulty</h3>
          <div className="flex flex-col gap-2">
            {DIFFICULTIES.map((diff, index) => (
              <motion.button
                key={diff.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelect(diff.id)}
                className={`${t.card} rounded-xl p-4 flex items-center gap-4 text-left transition-all hover:shadow-lg ${
                  aiDifficulty === diff.id ? 'ring-2 ring-offset-1 ring-current' : ''
                }`}
              >
                <div className="text-3xl">{diff.emoji}</div>
                <div className="flex-1">
                  <h3 className={`font-bold ${t.text}`}>{diff.name}</h3>
                  <p className={`text-xs ${t.textSecondary}`}>{diff.description}</p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span key={i} className={`text-xs ${i < diff.stars ? 'text-yellow-500' : 'text-gray-300'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {aiDifficulty === diff.id && (
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

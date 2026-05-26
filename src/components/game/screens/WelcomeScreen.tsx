'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { Settings, Trophy, BarChart3, Volume2, VolumeX } from 'lucide-react';

export default function WelcomeScreen() {
  const { setScreen, theme, soundEnabled, setSoundEnabled, setScreen: navigate } = useGameStore();
  const t = THEMES[theme];

  const handleStart = () => {
    soundManager.playClick();
    triggerHaptic(15);
    setScreen('mode-select');
  };

  const handleExit = () => {
    soundManager.playClick();
    triggerHaptic(10);
    // In a web environment, we can't actually close the tab, but we can try
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden">
      {/* Logo/Title */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="mb-6"
      >
        <div className="relative w-28 h-28 sm:w-36 sm:h-36">
          {/* Animated X */}
          <motion.div
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute top-0 left-0 text-5xl sm:text-7xl font-black ${t.xColor} select-none`}
          >
            X
          </motion.div>
          {/* Animated O */}
          <motion.div
            animate={{ rotate: [0, -5, 0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className={`absolute bottom-0 right-0 text-5xl sm:text-7xl font-black ${t.oColor} select-none`}
          >
            O
          </motion.div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`text-4xl sm:text-6xl font-black ${t.text} mb-2 tracking-tight text-center`}
      >
        Tic Tac Toe
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className={`${t.textSecondary} text-sm sm:text-base mb-10 text-center`}
      >
        The Ultimate X-O Experience
      </motion.p>

      {/* Start Button */}
      <motion.button
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
        className={`${t.button} w-64 sm:w-72 py-4 rounded-2xl text-lg sm:text-xl font-bold shadow-lg transition-all duration-200 mb-3`}
      >
        Start Game
      </motion.button>

      {/* Exit Button */}
      <motion.button
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleExit}
        className={`${t.textSecondary} border ${t.cellBorder} w-64 sm:w-72 py-3 rounded-2xl text-base font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200`}
      >
        Exit
      </motion.button>

      {/* Bottom Icons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 flex gap-6"
      >
        <button
          onClick={() => {
            soundManager.playClick();
            triggerHaptic(10);
            navigate('stats');
          }}
          className={`${t.textSecondary} hover:${t.accentText} transition-colors p-2`}
          title="Stats"
        >
          <BarChart3 size={22} />
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            triggerHaptic(10);
            navigate('achievements');
          }}
          className={`${t.textSecondary} hover:${t.accentText} transition-colors p-2`}
          title="Achievements"
        >
          <Trophy size={22} />
        </button>
        <button
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            soundManager.setEnabled(next);
            if (next) soundManager.playClick();
            triggerHaptic(10);
          }}
          className={`${t.textSecondary} hover:${t.accentText} transition-colors p-2`}
          title="Toggle Sound"
        >
          {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            triggerHaptic(10);
            navigate('settings');
          }}
          className={`${t.textSecondary} hover:${t.accentText} transition-colors p-2`}
          title="Settings"
        >
          <Settings size={22} />
        </button>
      </motion.div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { ArrowLeft, Bot, Users, Globe, Map, Trophy, Clock } from 'lucide-react';

const MODES = [
  {
    id: 'single' as const,
    icon: Bot,
    title: 'Single Player',
    subtitle: 'vs AI',
    description: 'Challenge the AI with 4 difficulty levels',
    color: 'from-emerald-500 to-teal-600',
    nextScreen: 'difficulty-select' as const,
  },
  {
    id: 'local' as const,
    icon: Users,
    title: 'Local Multiplayer',
    subtitle: 'Pass & Play',
    description: 'Two players, one screen',
    color: 'from-blue-500 to-indigo-600',
    nextScreen: 'grid-select' as const,
  },
  {
    id: 'online' as const,
    icon: Globe,
    title: 'Online Multiplayer',
    subtitle: 'Real-time',
    description: 'Play with friends online',
    color: 'from-purple-500 to-violet-600',
    nextScreen: 'online-lobby' as const,
  },
  {
    id: 'campaign' as const,
    icon: Map,
    title: 'Campaign',
    subtitle: '30+ Levels',
    description: 'Progressive challenges & puzzles',
    color: 'from-amber-500 to-orange-600',
    nextScreen: 'campaign-map' as const,
  },
  {
    id: 'tournament' as const,
    icon: Trophy,
    title: 'Tournament',
    subtitle: 'Bracket Mode',
    description: 'Local tournament for up to 8 players',
    color: 'from-rose-500 to-pink-600',
    nextScreen: 'tournament-setup' as const,
  },
];

export default function ModeSelectScreen() {
  const { setScreen, setGameMode, theme } = useGameStore();
  const t = THEMES[theme];

  const handleSelect = (mode: (typeof MODES)[number]) => {
    soundManager.playClick();
    triggerHaptic(15);
    setGameMode(mode.id);
    setScreen(mode.nextScreen);
  };

  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            soundManager.playClick();
            setScreen('welcome');
          }}
          className={`${t.text} p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className={`text-2xl sm:text-3xl font-bold ${t.text}`}>Choose Mode</h1>
      </div>

      {/* Mode Cards */}
      <div className="flex flex-col gap-3 max-w-lg mx-auto w-full">
        {MODES.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(mode)}
              className={`${t.card} rounded-2xl p-4 sm:p-5 flex items-center gap-4 text-left transition-all duration-200 hover:shadow-lg group`}
            >
              <div
                className={`bg-gradient-to-br ${mode.color} w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}
              >
                <Icon size={28} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className={`text-lg font-bold ${t.text}`}>{mode.title}</h3>
                  <span className={`text-xs font-medium ${t.textSecondary} uppercase tracking-wide`}>
                    {mode.subtitle}
                  </span>
                </div>
                <p className={`text-sm ${t.textSecondary} truncate`}>{mode.description}</p>
              </div>
            </motion.button>
          );
        })}

        {/* Time Attack - Special Card */}
        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: MODES.length * 0.08 }}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            soundManager.playClick();
            triggerHaptic(15);
            setGameMode('single');
            setScreen('time-attack-setup');
          }}
          className={`${t.card} rounded-2xl p-4 sm:p-5 flex items-center gap-4 text-left transition-all duration-200 hover:shadow-lg group border-dashed`}
        >
          <div className="bg-gradient-to-br from-red-500 to-rose-600 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform animate-pulse">
            <Clock size={28} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className={`text-lg font-bold ${t.text}`}>Time Attack</h3>
              <span className={`text-xs font-medium text-red-500 uppercase tracking-wide`}>Special</span>
            </div>
            <p className={`text-sm ${t.textSecondary}`}>Race against the clock - 3s, 5s, or 10s per move!</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

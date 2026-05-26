'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { ArrowLeft, Trophy, Lock, Unlock } from 'lucide-react';

export default function AchievementsScreen() {
  const { setScreen, theme, achievements, unlockAchievement } = useGameStore();
  const t = THEMES[theme];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            soundManager.playClick();
            setScreen('welcome');
          }}
          className={`${t.text} p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5`}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className={`text-2xl sm:text-3xl font-bold ${t.text}`}>Achievements</h1>
      </div>

      {/* Progress */}
      <div className={`${t.card} rounded-xl p-4 mb-4 max-w-lg mx-auto w-full`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`${t.text} font-bold`}>Progress</span>
          <span className={`${t.accentText} font-bold`}>
            {unlockedCount}/{totalCount}
          </span>
        </div>
        <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.5 }}
            className={`${t.accent} h-full rounded-full`}
          />
        </div>
      </div>

      {/* Achievement List */}
      <div className="max-w-lg mx-auto w-full space-y-2 overflow-y-auto flex-1 pb-4">
        {achievements.map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className={`${t.card} rounded-xl p-3 flex items-center gap-3
              ${achievement.unlocked ? '' : 'opacity-50'}
            `}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0
                ${achievement.unlocked ? 'bg-yellow-500/20' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              {achievement.unlocked ? achievement.icon : '🔒'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-sm ${t.text} flex items-center gap-1`}>
                {achievement.name}
                {achievement.unlocked && <Unlock size={12} className="text-green-500" />}
              </h3>
              <p className={`text-xs ${t.textSecondary}`}>{achievement.description}</p>
              {achievement.unlockedAt && (
                <p className={`text-xs ${t.textSecondary} mt-0.5`}>
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            {achievement.unlocked && (
              <div className="text-yellow-500">
                <Trophy size={18} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

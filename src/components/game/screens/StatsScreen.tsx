'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { ArrowLeft, BarChart3, Target, TrendingUp, Clock } from 'lucide-react';

export default function StatsScreen() {
  const { setScreen, theme, stats } = useGameStore();
  const t = THEMES[theme];

  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
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
        <h1 className={`text-2xl sm:text-3xl font-bold ${t.text}`}>Statistics</h1>
      </div>

      <div className="max-w-lg mx-auto w-full space-y-4">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${t.card} rounded-xl p-4 text-center`}
          >
            <BarChart3 size={24} className={`${t.accentText} mx-auto mb-2`} />
            <div className={`text-3xl font-black ${t.text}`}>{stats.totalGames}</div>
            <div className={`text-xs ${t.textSecondary}`}>Games Played</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`${t.card} rounded-xl p-4 text-center`}
          >
            <Target size={24} className="text-green-500 mx-auto mb-2" />
            <div className={`text-3xl font-black text-green-500`}>{winRate}%</div>
            <div className={`text-xs ${t.textSecondary}`}>Win Rate</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${t.card} rounded-xl p-4 text-center`}
          >
            <TrendingUp size={24} className="text-amber-500 mx-auto mb-2" />
            <div className={`text-3xl font-black text-amber-500`}>{stats.bestStreak}</div>
            <div className={`text-xs ${t.textSecondary}`}>Best Streak</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`${t.card} rounded-xl p-4 text-center`}
          >
            <TrendingUp size={24} className={`${t.accentText} mx-auto mb-2`} />
            <div className={`text-3xl font-black ${t.accentText}`}>{stats.currentStreak}</div>
            <div className={`text-xs ${t.textSecondary}`}>Current Streak</div>
          </motion.div>
        </div>

        {/* Win/Loss/Draw */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${t.card} rounded-xl p-4`}
        >
          <h3 className={`${t.text} font-bold mb-3`}>Record</h3>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">{stats.wins}</div>
              <div className={`text-xs ${t.textSecondary}`}>Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-500">{stats.losses}</div>
              <div className={`text-xs ${t.textSecondary}`}>Losses</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-black ${t.textSecondary}`}>{stats.draws}</div>
              <div className={`text-xs ${t.textSecondary}`}>Draws</div>
            </div>
          </div>
          {/* Visual bar */}
          {stats.totalGames > 0 && (
            <div className="mt-3 h-2 rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-700">
              <div className="bg-green-500 h-full" style={{ width: `${(stats.wins / stats.totalGames) * 100}%` }} />
              <div className="bg-red-500 h-full" style={{ width: `${(stats.losses / stats.totalGames) * 100}%` }} />
              <div className="bg-gray-400 h-full" style={{ width: `${(stats.draws / stats.totalGames) * 100}%` }} />
            </div>
          )}
        </motion.div>

        {/* By Grid Size */}
        {Object.keys(stats.gamesByGrid).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`${t.card} rounded-xl p-4`}
          >
            <h3 className={`${t.text} font-bold mb-3`}>By Grid Size</h3>
            <div className="space-y-2">
              {Object.entries(stats.gamesByGrid).map(([grid, record]) => (
                <div key={grid} className="flex items-center gap-3">
                  <span className={`${t.text} text-sm font-medium w-16`}>{grid}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-700">
                    <div className="bg-green-500 h-full" style={{ width: `${(record.wins / (record.wins + record.losses + record.draws)) * 100}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${(record.losses / (record.wins + record.losses + record.draws)) * 100}%` }} />
                    <div className="bg-gray-400 h-full" style={{ width: `${(record.draws / (record.wins + record.losses + record.draws)) * 100}%` }} />
                  </div>
                  <span className={`${t.textSecondary} text-xs w-20 text-right`}>
                    {record.wins}W {record.losses}L {record.draws}D
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* By Difficulty */}
        {Object.keys(stats.gamesByDifficulty).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${t.card} rounded-xl p-4`}
          >
            <h3 className={`${t.text} font-bold mb-3`}>By AI Difficulty</h3>
            <div className="space-y-2">
              {Object.entries(stats.gamesByDifficulty).map(([diff, record]) => (
                <div key={diff} className="flex items-center gap-3">
                  <span className={`${t.text} text-sm font-medium w-24 capitalize`}>{diff}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-700">
                    <div className="bg-green-500 h-full" style={{ width: `${(record.wins / (record.wins + record.losses + record.draws)) * 100}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${(record.losses / (record.wins + record.losses + record.draws)) * 100}%` }} />
                  </div>
                  <span className={`${t.textSecondary} text-xs w-20 text-right`}>
                    {record.wins}W {record.losses}L
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

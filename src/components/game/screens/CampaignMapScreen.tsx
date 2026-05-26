'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { ArrowLeft, Lock, Star, CheckCircle, Sparkles } from 'lucide-react';

export default function CampaignMapScreen() {
  const {
    setScreen,
    campaignLevels,
    currentCampaignLevel,
    setCurrentCampaignLevel,
    setGridSize,
    setWinCondition,
    setGameMode,
    initGame,
    theme,
  } = useGameStore();
  const t = THEMES[theme];

  const completedCount = campaignLevels.filter((l) => l.completed).length;
  const totalStars = campaignLevels.reduce((sum, l) => sum + l.stars, 0);
  const maxStars = campaignLevels.length * 3;

  const handleLevelSelect = (levelId: number) => {
    const level = campaignLevels.find((l) => l.id === levelId);
    if (!level) return;

    // Check if level is unlocked (first level always unlocked, or previous completed)
    if (levelId > 1) {
      const prevLevel = campaignLevels.find((l) => l.id === levelId - 1);
      if (prevLevel && !prevLevel.completed) return;
    }

    soundManager.playClick();
    triggerHaptic(15);
    setCurrentCampaignLevel(levelId);
    setGridSize(level.gridSize);
    setWinCondition(level.winCondition);
    setGameMode('campaign');

    // Set AI difficulty for campaign level
    useGameStore.setState({ aiDifficulty: level.difficulty });

    initGame();
    setScreen('game');
  };

  const chapters = [
    { name: 'Chapter 1: Basics', levels: campaignLevels.slice(0, 10) },
    { name: 'Chapter 2: Expanding', levels: campaignLevels.slice(10, 20) },
    { name: 'Chapter 3: Masters', levels: campaignLevels.slice(20, 30) },
  ];

  const isLevelUnlocked = (levelId: number) => {
    if (levelId === 1) return true;
    const prevLevel = campaignLevels.find((l) => l.id === levelId - 1);
    return prevLevel?.completed ?? false;
  };

  // Find the first uncompleted unlocked level (the "next" level to play)
  const nextLevelId = campaignLevels.find((l) => isLevelUnlocked(l.id) && !l.completed)?.id;

  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
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
        <h1 className={`text-2xl sm:text-3xl font-bold ${t.text}`}>Campaign</h1>
      </div>

      {/* Progress Summary */}
      <div className={`${t.card} rounded-xl p-3 mb-4 max-w-lg mx-auto w-full`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`${t.text} text-sm font-bold`}>Progress</span>
          <span className={`${t.textSecondary} text-xs`}>{completedCount}/{campaignLevels.length} Levels</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / campaignLevels.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full"
          />
        </div>
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span className={`${t.textSecondary} text-xs`}>{totalStars}/{maxStars} Stars</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full space-y-6 pb-4">
        {chapters.map((chapter, chapterIdx) => {
          const chapterCompleted = chapter.levels.filter((l) => l.completed).length;
          const chapterTotal = chapter.levels.length;

          return (
            <div key={chapterIdx}>
              <div className="flex items-center justify-between mb-3">
                <h2 className={`${t.accentText} text-sm font-bold uppercase tracking-wide`}>
                  {chapter.name}
                </h2>
                <span className={`${t.textSecondary} text-xs`}>
                  {chapterCompleted}/{chapterTotal}
                </span>
              </div>
              <div className="space-y-2">
                {chapter.levels.map((level, levelIdx) => {
                  const unlocked = isLevelUnlocked(level.id);
                  const isNext = level.id === nextLevelId;
                  return (
                    <motion.button
                      key={level.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: chapterIdx * 0.1 + levelIdx * 0.03 }}
                      whileHover={unlocked ? { scale: 1.01 } : {}}
                      whileTap={unlocked ? { scale: 0.99 } : {}}
                      onClick={() => handleLevelSelect(level.id)}
                      disabled={!unlocked}
                      className={`${t.card} w-full rounded-xl p-3 sm:p-4 flex items-center gap-3 text-left transition-all
                        ${!unlocked ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
                        ${isNext ? 'ring-2 ring-yellow-400/60' : ''}
                        ${currentCampaignLevel === level.id && !level.completed ? 'ring-2 ring-current' : ''}
                      `}
                    >
                      {/* Level number */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0
                          ${level.completed ? 'bg-green-500/20 text-green-500' : isNext ? 'bg-yellow-500/20 text-yellow-500' : unlocked ? t.accent + ' text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500'}`}
                      >
                        {level.completed ? <CheckCircle size={18} /> : isNext ? <Sparkles size={18} /> : unlocked ? level.id : <Lock size={16} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-sm ${t.text} truncate`}>{level.name}</h3>
                          {isNext && (
                            <span className="text-[10px] font-bold uppercase tracking-wide bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded-full">
                              Next
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${t.textSecondary} truncate`}>{level.description}</p>
                        <div className={`text-xs ${t.textSecondary} mt-0.5`}>
                          {level.gridSize}×{level.gridSize} • {level.difficulty}
                        </div>
                      </div>

                      {/* Stars */}
                      {level.completed && (
                        <div className="flex gap-0.5 shrink-0">
                          {[1, 2, 3].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= level.stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

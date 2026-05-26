'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES, ThemeName, X_SKINS, O_SKINS } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { ArrowLeft, Palette, Smile, Volume2, VolumeX, Vibrate, VibrateOff } from 'lucide-react';

const THEME_LIST: { id: ThemeName; name: string; preview: string }[] = [
  { id: 'light', name: 'Light', preview: '☀️' },
  { id: 'dark', name: 'Dark', preview: '🌙' },
  { id: 'neon', name: 'Neon Glow', preview: '💜' },
  { id: 'wooden', name: 'Wooden Retro', preview: '🪵' },
  { id: 'cyberpunk', name: 'Cyberpunk', preview: '⚡' },
  { id: 'minimalist', name: 'Minimalist', preview: '◻️' },
];

export default function SettingsScreen() {
  const {
    setScreen,
    theme,
    setTheme,
    xSkin,
    setXSkin,
    oSkin,
    setOSkin,
    soundEnabled,
    setSoundEnabled,
    hapticEnabled,
    setHapticEnabled,
    player1Name,
    setPlayer1Name,
    player2Name,
    setPlayer2Name,
  } = useGameStore();
  const t = THEMES[theme];

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
        <h1 className={`text-2xl sm:text-3xl font-bold ${t.text}`}>Settings</h1>
      </div>

      <div className="max-w-lg mx-auto w-full space-y-6 flex-1 overflow-y-auto pb-4">
        {/* Theme Selection */}
        <div>
          <h3 className={`${t.text} font-bold mb-3 flex items-center gap-2`}>
            <Palette size={18} /> Theme
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {THEME_LIST.map((th) => (
              <motion.button
                key={th.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setTheme(th.id);
                  soundManager.playClick();
                  triggerHaptic(10);
                }}
                className={`${THEMES[th.id].card} rounded-xl p-3 text-center transition-all
                  ${theme === th.id ? 'ring-2 ring-current' : ''}
                `}
              >
                <div className="text-2xl mb-1">{th.preview}</div>
                <div className={`text-xs font-medium ${THEMES[th.id].text}`}>{th.name}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* X Skin */}
        <div>
          <h3 className={`${t.text} font-bold mb-3 flex items-center gap-2`}>
            <Smile size={18} /> X Symbol
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {X_SKINS.map((skin) => (
              <motion.button
                key={skin.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setXSkin(skin.id);
                  soundManager.playClick();
                }}
                className={`${t.card} rounded-xl p-3 text-center transition-all
                  ${xSkin === skin.id ? 'ring-2 ring-current' : ''}
                `}
              >
                <div className={`text-2xl ${t.xColor}`}>{skin.render}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* O Skin */}
        <div>
          <h3 className={`${t.text} font-bold mb-3 flex items-center gap-2`}>
            <Smile size={18} /> O Symbol
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {O_SKINS.map((skin) => (
              <motion.button
                key={skin.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setOSkin(skin.id);
                  soundManager.playClick();
                }}
                className={`${t.card} rounded-xl p-3 text-center transition-all
                  ${oSkin === skin.id ? 'ring-2 ring-current' : ''}
                `}
              >
                <div className={`text-2xl ${t.oColor}`}>{skin.render}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Audio & Haptic */}
        <div>
          <h3 className={`${t.text} font-bold mb-3`}>Audio & Feedback</h3>
          <div className="space-y-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                soundManager.setEnabled(next);
                if (next) soundManager.playClick();
              }}
              className={`${t.card} w-full rounded-xl p-4 flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 size={18} className={t.accentText} /> : <VolumeX size={18} className={t.textSecondary} />}
                <span className={`${t.text} font-medium`}>Sound Effects</span>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setHapticEnabled(!hapticEnabled);
                triggerHaptic(10);
              }}
              className={`${t.card} w-full rounded-xl p-4 flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                {hapticEnabled ? <Vibrate size={18} className={t.accentText} /> : <VibrateOff size={18} className={t.textSecondary} />}
                <span className={`${t.text} font-medium`}>Haptic Feedback</span>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors ${hapticEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${hapticEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Player Names */}
        <div>
          <h3 className={`${t.text} font-bold mb-3`}>Player Names</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Player 1 name"
              className={`w-full px-4 py-3 rounded-xl ${t.board} ${t.text} border ${t.cellBorder} text-sm outline-none focus:ring-2 focus:ring-current`}
            />
            <input
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              placeholder="Player 2 name"
              className={`w-full px-4 py-3 rounded-xl ${t.board} ${t.text} border ${t.cellBorder} text-sm outline-none focus:ring-2 focus:ring-current`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

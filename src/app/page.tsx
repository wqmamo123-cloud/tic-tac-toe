'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { Volume2, VolumeX } from 'lucide-react';
import ParticleBackground from '@/components/game/ParticleBackground';

// Screens
import WelcomeScreen from '@/components/game/screens/WelcomeScreen';
import ModeSelectScreen from '@/components/game/screens/ModeSelectScreen';
import DifficultySelectScreen from '@/components/game/screens/DifficultySelectScreen';
import GridSelectScreen from '@/components/game/screens/GridSelectScreen';
import GameBoardScreen from '@/components/game/screens/GameBoardScreen';
import CampaignMapScreen from '@/components/game/screens/CampaignMapScreen';
import TournamentSetupScreen from '@/components/game/screens/TournamentSetupScreen';
import TournamentBracketScreen from '@/components/game/screens/TournamentBracketScreen';
import OnlineLobbyScreen from '@/components/game/screens/OnlineLobbyScreen';
import SettingsScreen from '@/components/game/screens/SettingsScreen';
import StatsScreen from '@/components/game/screens/StatsScreen';
import AchievementsScreen from '@/components/game/screens/AchievementsScreen';
import TimeAttackSetupScreen from '@/components/game/screens/TimeAttackSetupScreen';

const screenComponents: Record<string, React.ComponentType> = {
  welcome: WelcomeScreen,
  'mode-select': ModeSelectScreen,
  'difficulty-select': DifficultySelectScreen,
  'grid-select': GridSelectScreen,
  game: GameBoardScreen,
  'campaign-map': CampaignMapScreen,
  'tournament-setup': TournamentSetupScreen,
  'tournament-bracket': TournamentBracketScreen,
  'online-lobby': OnlineLobbyScreen,
  settings: SettingsScreen,
  stats: StatsScreen,
  achievements: AchievementsScreen,
  'time-attack-setup': TimeAttackSetupScreen,
};

export default function Home() {
  const { currentScreen, theme, soundEnabled, setSoundEnabled } = useGameStore();
  const t = THEMES[theme];

  // Sync sound manager with store on mount + when soundEnabled changes
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Start BGM on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (!soundManager.muted) {
        soundManager.startBGM();
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Prevent zoom on mobile
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  }, []);

  const handleMuteToggle = () => {
    triggerHaptic(10);
    const newMuted = soundManager.toggleMute();
    setSoundEnabled(!newMuted);
  };

  const ScreenComponent = screenComponents[currentScreen] || WelcomeScreen;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${t.bgGradient} transition-colors duration-500 relative overflow-hidden`}
    >
      {/* Particle Background */}
      <ParticleBackground />

      {/* Global Mute Button — top-right corner, always visible */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleMuteToggle}
        className={`fixed top-3 right-3 z-50 w-10 h-10 rounded-full flex items-center justify-center
          ${t.card} shadow-lg transition-all duration-200 hover:scale-110 active:scale-95`}
        title={soundEnabled ? 'Mute' : 'Unmute'}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={soundEnabled ? 'on' : 'off'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {soundEnabled ? (
              <Volume2 size={18} className={t.accentText} />
            ) : (
              <VolumeX size={18} className={t.textSecondary} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Screen Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <ScreenComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

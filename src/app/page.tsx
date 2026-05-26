'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES } from '@/lib/game/types';
import { soundManager } from '@/lib/game/sounds';
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
  const { currentScreen, theme, soundEnabled } = useGameStore();
  const t = THEMES[theme];

  // Sync sound manager
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

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

  const ScreenComponent = screenComponents[currentScreen] || WelcomeScreen;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${t.bgGradient} transition-colors duration-500 relative overflow-hidden`}
    >
      {/* Particle Background */}
      <ParticleBackground />

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
// trigger reload


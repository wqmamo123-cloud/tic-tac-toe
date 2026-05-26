'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { ArrowLeft, Globe, Users, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function OnlineLobbyScreen() {
  const { setScreen, theme, setGameMode } = useGameStore();
  const t = THEMES[theme];
  const [roomCode, setRoomCode] = useState('');
  const [lobbyMode, setLobbyMode] = useState<'quick' | 'create' | 'join'>('quick');

  // Since we don't have a real backend for online multiplayer,
  // we'll simulate the experience with local "pass & play" mode
  // and show the UI for what online would look like

  const handleQuickMatch = () => {
    soundManager.playClick();
    triggerHaptic(15);
    // Simulate: switch to local multiplayer for now
    setGameMode('local');
    setScreen('grid-select');
  };

  const handleCreateRoom = () => {
    soundManager.playClick();
    triggerHaptic(15);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setLobbyMode('create');
  };

  const handleJoinRoom = () => {
    if (roomCode.length < 4) return;
    soundManager.playClick();
    triggerHaptic(15);
    // Simulate joining - switch to local
    setGameMode('local');
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
          className={`${t.text} p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5`}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className={`text-2xl sm:text-3xl font-bold ${t.text}`}>Online Multiplayer</h1>
      </div>

      <div className="max-w-lg mx-auto w-full space-y-4 flex-1">
        {/* Quick Match */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleQuickMatch}
          className={`${t.card} w-full rounded-2xl p-6 text-left transition-all hover:shadow-lg`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 w-14 h-14 rounded-xl flex items-center justify-center shadow-md">
              <Globe size={28} className="text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${t.text}`}>Quick Match</h3>
              <p className={`text-sm ${t.textSecondary}`}>Find a random opponent instantly</p>
            </div>
          </div>
        </motion.button>

        {/* Create Room */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${t.card} rounded-2xl p-6`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-14 h-14 rounded-xl flex items-center justify-center shadow-md">
              <Users size={28} className="text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${t.text}`}>Create Private Room</h3>
              <p className={`text-sm ${t.textSecondary}`}>Play with a friend using a code</p>
            </div>
          </div>

          {lobbyMode === 'create' && roomCode ? (
            <div className={`${t.board} rounded-xl p-4 text-center`}>
              <p className={`${t.textSecondary} text-sm mb-2`}>Share this code with your friend:</p>
              <div className={`text-3xl font-mono font-black ${t.accentText} tracking-widest mb-3`}>
                {roomCode}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigator.clipboard?.writeText(roomCode);
                  soundManager.playClick();
                }}
                className={`${t.textSecondary} text-sm flex items-center gap-1 mx-auto hover:${t.text} transition-colors`}
              >
                <Copy size={14} /> Copy Code
              </motion.button>
              <p className={`${t.textSecondary} text-xs mt-3`}>
                Waiting for opponent... (Demo: plays as Local Multiplayer)
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setGameMode('local');
                  setScreen('grid-select');
                }}
                className={`${t.button} mt-3 px-6 py-2 rounded-lg text-sm font-bold`}
              >
                Start Game
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateRoom}
              className={`${t.button} w-full py-3 rounded-xl font-bold`}
            >
              Create Room
            </motion.button>
          )}
        </motion.div>

        {/* Join Room */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${t.card} rounded-2xl p-6`}
        >
          <h3 className={`text-lg font-bold ${t.text} mb-3`}>Join Room</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code..."
              className={`flex-1 px-4 py-3 rounded-xl ${t.board} ${t.text} border ${t.cellBorder} text-sm font-mono uppercase outline-none focus:ring-2 focus:ring-current`}
              maxLength={6}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinRoom}
              disabled={roomCode.length < 4}
              className={`${t.button} px-6 py-3 rounded-xl font-bold disabled:opacity-40`}
            >
              Join
            </motion.button>
          </div>
        </motion.div>

        {/* Info */}
        <div className={`${t.card} rounded-xl p-4 border-dashed`}>
          <p className={`${t.textSecondary} text-sm text-center`}>
            💡 Online multiplayer uses real-time WebSocket connections. In this demo, online mode plays as Local Pass & Play.
          </p>
        </div>
      </div>
    </div>
  );
}

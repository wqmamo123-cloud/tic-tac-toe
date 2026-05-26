'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES, type TournamentPlayer, type TournamentMatch } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { ArrowLeft, Plus, X, Trophy } from 'lucide-react';

export default function TournamentSetupScreen() {
  const {
    setScreen,
    theme,
    tournamentPlayers,
    setTournamentPlayers,
    setTournamentMatches,
    setCurrentTournamentRound,
    setCurrentTournamentMatch,
    setGameMode,
    initGame,
    setGridSize,
    setWinCondition,
  } = useGameStore();
  const t = THEMES[theme];

  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<TournamentPlayer[]>(tournamentPlayers);

  const addPlayer = () => {
    if (!playerName.trim() || players.length >= 8) return;
    const newPlayer: TournamentPlayer = {
      id: `p-${Date.now()}`,
      name: playerName.trim(),
      eliminated: false,
    };
    setPlayers([...players, newPlayer]);
    setPlayerName('');
    soundManager.playClick();
    triggerHaptic(10);
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
    soundManager.playClick();
  };

  const generateBracket = () => {
    if (players.length < 2) return;

    soundManager.playClick();
    triggerHaptic(20);

    const shuffled = [...players].sort(() => Math.random() - 0.5);
    // Pad to power of 2
    let bracketSize = 2;
    while (bracketSize < shuffled.length) bracketSize *= 2;

    while (shuffled.length < bracketSize) {
      shuffled.push({ id: `bye-${shuffled.length}`, name: 'BYE', eliminated: true });
    }

    const matches: TournamentMatch[] = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      matches.push({
        id: `m-${i / 2}`,
        round: 1,
        player1: shuffled[i],
        player2: shuffled[i + 1],
        winner: null,
        played: false,
      });
    }

    setTournamentPlayers(shuffled);
    setTournamentMatches(matches);
    setCurrentTournamentRound(1);
    setCurrentTournamentMatch(0);
    setGameMode('tournament');
    setGridSize(3);
    setWinCondition(3);

    setScreen('tournament-bracket');
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
        <h1 className={`text-2xl sm:text-3xl font-bold ${t.text}`}>Tournament</h1>
      </div>

      <div className="max-w-lg mx-auto w-full flex-1">
        {/* Player count info */}
        <div className={`${t.card} rounded-xl p-4 mb-4`}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={20} className={t.accentText} />
            <h3 className={`font-bold ${t.text}`}>Add Players (2-8)</h3>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              placeholder="Player name..."
              className={`flex-1 px-3 py-2 rounded-lg ${t.board} ${t.text} border ${t.cellBorder} text-sm outline-none focus:ring-2 focus:ring-current`}
              maxLength={20}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addPlayer}
              disabled={!playerName.trim() || players.length >= 8}
              className={`${t.button} px-3 py-2 rounded-lg disabled:opacity-40`}
            >
              <Plus size={18} />
            </motion.button>
          </div>

          {/* Player list */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {players.map((player, idx) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${t.board}`}
              >
                <span className={`${t.accentText} font-bold text-sm w-6`}>#{idx + 1}</span>
                <span className={`${t.text} flex-1 text-sm font-medium`}>{player.name}</span>
                <button
                  onClick={() => removePlayer(player.id)}
                  className={`${t.textSecondary} hover:text-red-500 transition-colors`}
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
            {players.length === 0 && (
              <p className={`${t.textSecondary} text-sm text-center py-4`}>No players added yet</p>
            )}
          </div>
        </div>

        {/* Quick add */}
        <div className="flex gap-2 mb-4">
          {['Player 1', 'Player 2', 'Player 3', 'Player 4'].map((name, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (players.length < 8) {
                  setPlayers([
                    ...players,
                    { id: `p-${Date.now()}-${i}`, name: `${name}`, eliminated: false },
                  ]);
                  soundManager.playClick();
                }
              }}
              className={`${t.card} px-3 py-1.5 rounded-lg text-xs ${t.textSecondary} hover:${t.text} transition-colors`}
            >
              + {name}
            </motion.button>
          ))}
        </div>

        {/* Start Tournament */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateBracket}
          disabled={players.length < 2}
          className={`${t.button} w-full py-4 rounded-2xl text-lg font-bold disabled:opacity-40 shadow-lg flex items-center justify-center gap-2`}
        >
          <Trophy size={20} />
          Start Tournament ({players.length} Players)
        </motion.button>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES, type TournamentPlayer } from '@/lib/game/types';
import { soundManager, triggerHaptic } from '@/lib/game/sounds';
import { ArrowLeft, Play, Trophy, CheckCircle } from 'lucide-react';

export default function TournamentBracketScreen() {
  const {
    setScreen,
    theme,
    tournamentPlayers,
    tournamentMatches,
    setTournamentMatches,
    currentTournamentRound,
    currentTournamentMatch,
    setCurrentTournamentMatch,
    setCurrentTournamentRound,
    initGame,
    setScreen: navigate,
    completeCampaignLevel,
    unlockAchievement,
  } = useGameStore();
  const t = THEMES[theme];

  const currentRoundMatches = tournamentMatches.filter((m) => m.round === currentTournamentRound);
  const allRoundPlayed = currentRoundMatches.every((m) => m.played);

  const handlePlayMatch = (matchIndex: number) => {
    soundManager.playClick();
    triggerHaptic(15);
    setCurrentTournamentMatch(matchIndex);
    // Set player names for the match
    const match = currentRoundMatches[matchIndex];
    if (match.player1) useGameStore.setState({ player1Name: match.player1.name });
    if (match.player2) useGameStore.setState({ player2Name: match.player2.name });
    initGame();
    navigate('game');
  };

  const handleAdvanceWinner = (matchId: string, winner: TournamentPlayer) => {
    const newMatches = tournamentMatches.map((m) =>
      m.id === matchId ? { ...m, winner, played: true } : m
    );

    // Check if round is complete
    const roundMatches = newMatches.filter((m) => m.round === currentTournamentRound);
    const allPlayed = roundMatches.every((m) => m.played);

    if (allPlayed) {
      // Create next round matches
      const winners = roundMatches.map((m) => m.winner!);
      if (winners.length >= 2) {
        const nextRound = currentTournamentRound + 1;
        for (let i = 0; i < winners.length; i += 2) {
          if (i + 1 < winners.length) {
            newMatches.push({
              id: `m-r${nextRound}-${i / 2}`,
              round: nextRound,
              player1: winners[i],
              player2: winners[i + 1],
              winner: null,
              played: false,
            });
          }
        }
        setTournamentMatches(newMatches);
        setCurrentTournamentRound(nextRound);
        setCurrentTournamentMatch(0);
      } else {
        // Tournament complete!
        setTournamentMatches(newMatches);
        unlockAchievement('tournament_win');
      }
    } else {
      setTournamentMatches(newMatches);
    }
  };

  const tournamentComplete =
    tournamentMatches.length > 0 &&
    tournamentMatches.some((m) => m.played) &&
    tournamentMatches.filter((m) => m.round === currentTournamentRound).every((m) => m.played) &&
    tournamentMatches.filter((m) => m.round === currentTournamentRound).length === 1 &&
    tournamentMatches.filter((m) => m.round === currentTournamentRound)[0]?.played;

  const champion = tournamentComplete
    ? tournamentMatches.filter((m) => m.round === currentTournamentRound)[0]?.winner
    : null;

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
        <h1 className={`text-2xl sm:text-3xl font-bold ${t.text}`}>Tournament Bracket</h1>
      </div>

      <div className="max-w-lg mx-auto w-full flex-1">
        {/* Round indicator */}
        <div className={`${t.card} rounded-xl p-3 mb-4 text-center`}>
          <span className={`${t.textSecondary} text-sm`}>Round {currentTournamentRound}</span>
          <span className={`${t.text} font-bold mx-2`}>•</span>
          <span className={`${t.textSecondary} text-sm`}>
            {tournamentPlayers.filter((p) => !p.eliminated).length} players remaining
          </span>
        </div>

        {/* Champion display */}
        {champion && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`${t.card} rounded-2xl p-6 mb-4 text-center border-2 border-yellow-400`}
          >
            <Trophy size={40} className="text-yellow-500 mx-auto mb-2" />
            <h2 className={`text-2xl font-black ${t.text}`}>🏆 Champion!</h2>
            <p className={`text-xl font-bold text-yellow-500 mt-1`}>{champion.name}</p>
          </motion.div>
        )}

        {/* Matches */}
        <div className="space-y-3">
          {currentRoundMatches.map((match, idx) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`${t.card} rounded-xl p-4`}
            >
              <div className="flex items-center gap-3">
                {/* Player 1 */}
                <div
                  className={`flex-1 text-center p-2 rounded-lg ${
                    match.winner?.id === match.player1?.id
                      ? 'bg-green-500/20 text-green-500'
                      : t.board
                  }`}
                >
                  <span className={`font-bold text-sm ${t.text}`}>
                    {match.player1?.name || 'TBD'}
                  </span>
                  {match.winner?.id === match.player1?.id && <CheckCircle size={14} className="mx-auto mt-1" />}
                </div>

                <span className={`${t.textSecondary} text-xs font-bold`}>VS</span>

                {/* Player 2 */}
                <div
                  className={`flex-1 text-center p-2 rounded-lg ${
                    match.winner?.id === match.player2?.id
                      ? 'bg-green-500/20 text-green-500'
                      : t.board
                  }`}
                >
                  <span className={`font-bold text-sm ${t.text}`}>
                    {match.player2?.name || 'BYE'}
                  </span>
                  {match.winner?.id === match.player2?.id && <CheckCircle size={14} className="mx-auto mt-1" />}
                </div>
              </div>

              {/* Play / Select Winner */}
              {!match.played && match.player2?.name !== 'BYE' && (
                <div className="flex gap-2 mt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlayMatch(idx)}
                    className={`${t.button} flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1`}
                  >
                    <Play size={14} /> Play Match
                  </motion.button>
                </div>
              )}

              {!match.played && match.player2?.name === 'BYE' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => match.player1 && handleAdvanceWinner(match.id, match.player1)}
                  className={`w-full mt-3 py-2 rounded-lg text-sm font-medium ${t.textSecondary} border ${t.cellBorder}`}
                >
                  {match.player1?.name} advances (BYE)
                </motion.button>
              )}

              {/* For played matches from game board - show winner selection */}
              {match.played && !match.winner && (
                <div className="flex gap-2 mt-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => match.player1 && handleAdvanceWinner(match.id, match.player1)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${t.cellBorder} ${t.text} hover:bg-green-500/10`}
                  >
                    {match.player1?.name} Won
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => match.player2 && handleAdvanceWinner(match.id, match.player2)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${t.cellBorder} ${t.text} hover:bg-green-500/10`}
                  >
                    {match.player2?.name} Won
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

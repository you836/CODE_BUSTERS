import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore.js';
import { Trophy, Sparkles, Coins } from 'lucide-react';

export default function LevelUpModal() {
  const { levelUpCelebration, dismissLevelUp } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && levelUpCelebration) {
        dismissLevelUp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [levelUpCelebration, dismissLevelUp]);

  if (!levelUpCelebration) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
      onClick={dismissLevelUp}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-rpg-panel border-4 border-rpg-gold w-full max-w-md rounded-lg shadow-glow-level p-6 text-center relative overflow-hidden"
      >
        {/* Background Aura Rays */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-purple-500/10 to-transparent pointer-events-none" />

        {/* Level Emblem */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-rpg-dark border-4 border-rpg-gold flex items-center justify-center shadow-glow-gold animate-bounce">
          <Trophy className="w-10 h-10 text-rpg-gold" />
        </div>

        {/* Title */}
        <h2 className="font-pixel text-lg text-rpg-gold mb-1 tracking-wider uppercase drop-shadow-md">
          Level Up!
        </h2>
        <p className="font-pixel text-xs text-purple-300 mb-5">
          You have ascended to Level {levelUpCelebration.newLevel}!
        </p>

        {/* Rewards Box */}
        <div className="bg-rpg-dark/90 border-2 border-rpg-border rounded p-4 mb-6 space-y-3">
          <div className="text-xs font-mono text-slate-300 font-semibold mb-1">
            Spoils of Ascendancy:
          </div>

          <div className="flex items-center justify-between text-xs font-mono py-1 border-b border-rpg-border/60">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              Level Mastery
            </span>
            <span className="text-white font-bold">New Level Unlocked</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono py-1 border-b border-rpg-border/60">
            <span className="flex items-center gap-1.5 text-yellow-400">
              <Coins className="w-4 h-4 text-rpg-gold" />
              Milestone Bounty
            </span>
            <span className="text-rpg-gold font-bold">+{levelUpCelebration.bonusGold} Gold</span>
          </div>

          {levelUpCelebration.statIncreased && (
            <div className="flex items-center justify-between text-xs font-mono py-1">
              <span className="flex items-center gap-1.5 text-purple-300 capitalize">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {levelUpCelebration.statIncreased} Boost
              </span>
              <span className="text-purple-300 font-bold">+{levelUpCelebration.statGain || 1} Pts</span>
            </div>
          )}
        </div>

        {/* Dismiss CTA */}
        <button
          onClick={dismissLevelUp}
          className="w-full py-3 rounded bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-pixel text-xs font-bold shadow-pixel tracking-wider uppercase border border-yellow-200 transition active:translate-y-0.5"
        >
          Claim Glory & Continue
        </button>
      </div>
    </div>
  );
}

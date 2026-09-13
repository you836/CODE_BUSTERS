import React from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { useGameStore } from '../store/useGameStore.js';
import { Flame, Shield, Sparkles, Trophy, CheckCircle, Clock, Zap } from 'lucide-react';

const STREAK_MILESTONES = [
  { days: 3, name: 'Consistent Adventurer', multiplier: '+10% XP', bounty: '50g', icon: '✨' },
  { days: 7, name: 'Flame Keeper', multiplier: '+25% XP', bounty: '150g', icon: '🔥' },
  { days: 14, name: 'Relentless Vanguard', multiplier: '+35% XP', bounty: '300g', icon: '⚔️' },
  { days: 30, name: 'Undying Flame', multiplier: '+50% XP', bounty: '1000g', icon: '🌟' },
];

export default function StreakDisplay({ onOpenShop }) {
  const { user } = useAuthStore();
  const { inventory } = useGameStore();

  const streak = user?.streakCount || 0;
  const lastActive = user?.lastActiveDate ? new Date(user.lastActiveDate) : null;

  // Check if today was already completed
  const now = new Date();
  const isTodayCompleted = lastActive &&
    lastActive.getFullYear() === now.getFullYear() &&
    lastActive.getMonth() === now.getMonth() &&
    lastActive.getDate() === now.getDate();

  // Check if user owns an Elixir of Time Freeze in inventory
  const hasStreakFreeze = (inventory || []).some(
    (inv) => (inv.itemId?._id === 'item_elixir_freeze' || inv.itemId?.name === 'Elixir of Time Freeze' || inv.itemId === 'item_elixir_freeze') && inv.quantity > 0
  );

  // Find current multiplier
  let currentMultiplier = 1.0;
  if (streak >= 30) currentMultiplier = 1.50;
  else if (streak >= 14) currentMultiplier = 1.35;
  else if (streak >= 7) currentMultiplier = 1.25;
  else if (streak >= 3) currentMultiplier = 1.10;

  // Find next milestone
  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > streak) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  const prevMilestoneDays = STREAK_MILESTONES.slice().reverse().find((m) => m.days <= streak)?.days || 0;
  const milestoneProgress = streak >= 30
    ? 100
    : Math.min(100, Math.max(0, ((streak - prevMilestoneDays) / (nextMilestone.days - prevMilestoneDays)) * 100));

  // Generate 7-day recent days preview
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const isToday = i === 6;
    const isPastActive = isToday ? isTodayCompleted : i >= (6 - Math.min(6, Math.max(0, streak - (isTodayCompleted ? 1 : 0))));
    return {
      dayName: daysOfWeek[d.getDay()],
      dateNumber: d.getDate(),
      isToday,
      isActive: isPastActive && streak > 0,
    };
  });

  return (
    <section aria-label="Adventurer Streak Engine" className="bg-rpg-panel border-2 border-orange-700/60 rounded p-5 shadow-pixel-sm mb-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Flame Banner & Streak Counter */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-rpg-dark border-2 border-orange-500/80 flex items-center justify-center relative shadow-pixel-sm shadow-orange-950">
            <Flame className={`w-9 h-9 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-600'}`} />
            {streak >= 7 && (
              <span className="absolute -top-2 -right-2 text-xs">🔥</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-pixel text-sm text-orange-400">
                {streak} Day Streak
              </h2>
              {currentMultiplier > 1.0 && (
                <span className="px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-600 text-[10px] font-mono font-bold">
                  {currentMultiplier}x XP Boost
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {isTodayCompleted
                ? '✅ Day conquered! Your flame burns bright for tomorrow.'
                : '⏳ Complete any quest today to extend your streak flame!'}
            </p>
          </div>
        </div>

        {/* Center: 7-Day Activity Strip */}
        <div className="bg-rpg-dark/90 border border-rpg-border rounded p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>7-Day Activity Flame</span>
            <span className={isTodayCompleted ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {isTodayCompleted ? 'Conquered Today' : 'Pending Today'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {past7Days.map((d, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center text-xs font-mono border transition ${
                    d.isActive
                      ? 'bg-orange-950 border-orange-500 text-orange-300 shadow-pixel-sm shadow-orange-950'
                      : d.isToday
                      ? 'bg-slate-800 border-dashed border-amber-500 text-amber-400 animate-pulse'
                      : 'bg-rpg-panel border-rpg-border text-slate-600'
                  }`}
                >
                  {d.isActive ? '🔥' : d.dateNumber}
                </div>
                <span className={`text-[9px] font-mono ${d.isToday ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                  {d.dayName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Streak Freeze Protection Status */}
        <div className="flex items-center gap-3 bg-rpg-dark/80 border border-rpg-border rounded p-3 min-w-[200px]">
          <Shield className={`w-7 h-7 ${hasStreakFreeze ? 'text-blue-400' : 'text-slate-600'}`} />
          <div className="text-xs font-mono">
            <div className="font-bold text-slate-200">Streak Protection</div>
            <div className={hasStreakFreeze ? 'text-blue-300 text-[11px]' : 'text-slate-500 text-[11px]'}>
              {hasStreakFreeze ? '🛡️ Elixir Armed' : 'Unprotected'}
            </div>
            {!hasStreakFreeze && onOpenShop && (
              <button
                onClick={onOpenShop}
                className="text-[10px] text-rpg-gold hover:underline mt-0.5 block font-bold"
              >
                Get Elixir in Shop →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Milestone Track */}
      <div className="mt-4 pt-3 border-t border-rpg-border/60">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-rpg-gold" />
            Next Milestone: <strong className="text-slate-200">{nextMilestone.name} ({nextMilestone.days}d)</strong>
          </span>
          <span className="text-rpg-gold font-bold">
            Bounty: {nextMilestone.bounty} + {nextMilestone.multiplier}
          </span>
        </div>
        <div className="h-2 bg-rpg-dark rounded-full overflow-hidden border border-rpg-border">
          <div
            className="h-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-500"
            style={{ width: `${milestoneProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
}

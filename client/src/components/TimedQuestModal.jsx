import React, { useEffect, useMemo, useState } from 'react';
import { X, Timer, ShieldCheck, Sparkles, RotateCcw, Clock } from 'lucide-react';
import { useGameStore } from '../store/useGameStore.js';

export default function TimedQuestModal({ quest: initialQuest, onClose }) {
  const { startTimedQuest, resetTimedQuest, completeQuest } = useGameStore();
  
  // Always derive live quest state from the store to prevent prop desync
  const quest = useGameStore(
    (state) => state.quests.find((q) => q._id === initialQuest?._id) || initialQuest
  );

  const [now, setNow] = useState(Date.now());
  const [isStarting, setIsStarting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // High-precision smooth ticking interval when started
  useEffect(() => {
    if (!quest?.startedAt) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [quest?.startedAt]);

  const requiredMs = Math.max(1, quest?.minDurationMinutes || 1) * 60 * 1000;
  const elapsedMs = quest?.startedAt ? Math.max(0, now - new Date(quest.startedAt).getTime()) : 0;
  const remainingMs = Math.max(0, requiredMs - elapsedMs);
  const ready = Boolean(quest?.startedAt) && remainingMs <= 0;
  const progress = quest?.startedAt ? Math.min(100, (elapsedMs / requiredMs) * 100) : 0;

  // Format milliseconds into HH:MM:SS or MM:SS
  const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const readableDuration = useMemo(() => {
    const mins = quest?.minDurationMinutes || 1;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h} hr ${m} min`;
    if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
    return `${m} mins`;
  }, [quest?.minDurationMinutes]);

  const timeLabel = useMemo(() => formatTime(remainingMs), [remainingMs]);

  if (!quest) return null;

  const handleStart = async () => {
    setIsStarting(true);
    setNow(Date.now());
    await startTimedQuest(quest._id);
    setIsStarting(false);
  };

  const handleReset = async () => {
    if (window.confirm('Reset this focus session? The timer will return to 0.')) {
      setIsResetting(true);
      await resetTimedQuest(quest._id);
      setIsResetting(false);
    }
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    const success = await completeQuest(quest._id);
    setIsClaiming(false);
    if (success) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="timed-quest-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-rpg-panel border-2 border-purple-500 rounded shadow-pixel overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-3 bg-rpg-dark border-b border-rpg-border">
          <div className="flex items-center gap-2 text-purple-300">
            <Timer className="w-5 h-5" />
            <span id="timed-quest-title" className="font-pixel text-xs">Focus Trial</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950/70 border border-purple-700/50 text-purple-300 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Target: {readableDuration}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Tier: {quest.difficulty}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">The server clock is the referee. Stay focused on your objective.</p>
          </div>

          {!quest.startedAt ? (
            <div className="text-center py-5">
              <div className="text-5xl font-mono font-bold text-purple-300 tracking-wider">
                {formatTime(requiredMs)}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-mono">Required uninterrupted focus session</p>
              <button
                onClick={handleStart}
                disabled={isStarting}
                className="mt-6 px-6 py-3 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-pixel text-xs border border-purple-300 shadow-pixel active:translate-y-0.5 transition focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                {isStarting ? 'Starting Clock...' : '⚔️ Begin Focus Trial'}
              </button>
            </div>
          ) : (
            <>
              <div className="text-center py-2">
                <div className={`text-5xl font-mono font-bold tracking-wider ${ready ? 'text-emerald-400 animate-pulse' : 'text-purple-300'}`}>
                  {ready ? 'TRIAL READY!' : timeLabel}
                </div>
                
                {/* Visual Progress Bar */}
                <div className="mt-4 h-3 bg-rpg-dark rounded-full overflow-hidden border border-rpg-border p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      ready ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-purple-600 to-amber-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-mono">
                  <span>Started: {new Date(quest.startedAt).toLocaleTimeString()}</span>
                  <span className="font-bold text-purple-300">{Math.round(progress)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-rpg-dark border border-rpg-border rounded text-xs text-slate-300 font-mono">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Authoritative server time. Rewards unlock when the full countdown completes.</span>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isResetting || isClaiming}
                  className="px-3.5 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs border border-slate-600 flex items-center gap-1.5 transition active:translate-y-0.5"
                  title="Reset timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>

                <button
                  onClick={handleClaim}
                  disabled={!ready || isClaiming}
                  className="flex-1 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-pixel text-xs border border-emerald-300 flex items-center justify-center gap-2 shadow-pixel active:translate-y-0.5 transition focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <Sparkles className="w-4 h-4" />
                  {isClaiming ? 'Claiming Victory...' : ready ? 'Claim Glory (+XP & Gold)' : 'Focus In Progress...'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { X, Timer, ShieldCheck, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/useGameStore.js';

export default function TimedQuestModal({ quest: initialQuest, onClose }) {
  const { startTimedQuest, completeQuest } = useGameStore();
  
  // Always derive live quest state from the store to prevent prop desync
  const quest = useGameStore(
    (state) => state.quests.find((q) => q._id === initialQuest?._id) || initialQuest
  );

  const [now, setNow] = useState(Date.now());
  const [isStarting, setIsStarting] = useState(false);
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

  const timeLabel = useMemo(() => {
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }, [remainingMs]);

  if (!quest) return null;

  const handleStart = async () => {
    setIsStarting(true);
    setNow(Date.now());
    await startTimedQuest(quest._id);
    setIsStarting(false);
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
            <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">The server clock is the referee. Keep this window open while you focus.</p>
          </div>

          {!quest.startedAt ? (
            <div className="text-center py-5">
              <div className="text-5xl font-mono font-bold text-purple-300">{quest.minDurationMinutes}:00</div>
              <p className="text-xs text-slate-500 mt-2 font-mono">Required focus time</p>
              <button
                onClick={handleStart}
                disabled={isStarting}
                className="mt-5 px-5 py-2.5 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-pixel text-xs border border-purple-300 shadow-pixel-sm active:translate-y-0.5 transition focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                {isStarting ? 'Starting...' : 'Begin Focus Trial'}
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className={`text-5xl font-mono font-bold ${ready ? 'text-emerald-300' : 'text-purple-300'}`}>
                  {ready ? 'READY' : timeLabel}
                </div>
                <div className="mt-4 h-2 bg-rpg-dark rounded overflow-hidden border border-rpg-border">
                  <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-mono">Server-verified progress • started {new Date(quest.startedAt).toLocaleTimeString()}</p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-rpg-dark border border-rpg-border rounded text-xs text-slate-300 font-mono">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>The browser timer is only a display. Completion is accepted only after the backend confirms the elapsed time.</span>
              </div>

              <button
                onClick={handleClaim}
                disabled={!ready || isClaiming}
                className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-pixel text-xs border border-emerald-300 flex items-center justify-center gap-2 shadow-pixel-sm active:translate-y-0.5 transition focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <Sparkles className="w-4 h-4" />
                {isClaiming ? 'Claiming...' : ready ? 'Claim Glory' : 'Keep Focusing'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

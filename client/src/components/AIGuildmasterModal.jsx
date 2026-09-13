import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore.js';
import { X, Bot, Sparkles, Coins, Check, ArrowRight, Wand2, Trash2, Clock, ShieldCheck, Zap } from 'lucide-react';

const SUGGESTIONS = [
  'Study for upcoming Algorithms & Data Structures Exam',
  'Get in shape for a 5k charity run',
  'Deep clean apartment and do laundry',
  'Build and deploy Life RPG Hackathon project',
];

export default function AIGuildmasterModal({ isOpen, onClose }) {
  const { generateAIQuests, acceptAIQuests, isGeneratingAI } = useGameStore();

  const [goal, setGoal] = useState('');
  const [questChain, setQuestChain] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!goal.trim() || isGeneratingAI) return;

    const generated = await generateAIQuests(goal.trim());
    if (generated) {
      setQuestChain(generated);
    }
  };

  const handleRemoveStage = (index) => {
    if (!questChain) return;
    setQuestChain(questChain.filter((_, i) => i !== index));
  };

  const handleAcceptAll = async () => {
    if (!questChain || questChain.length === 0 || isAccepting) return;
    setIsAccepting(true);
    const success = await acceptAIQuests(questChain);
    setIsAccepting(false);
    if (success) {
      setQuestChain(null);
      setGoal('');
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-guildmaster-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-rpg-panel border-2 border-fuchsia-500 w-full max-w-2xl rounded-lg shadow-pixel overflow-hidden"
      >
        {/* Header */}
        <div className="bg-rpg-dark px-5 py-3.5 border-b-2 border-rpg-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-fuchsia-950 border border-fuchsia-400 flex items-center justify-center text-lg">
              🧙‍♂️
            </div>
            <div>
              <h3 id="ai-guildmaster-title" className="font-pixel text-xs text-fuchsia-300">
                The Guildmaster's Arcane Chamber
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Decompose daunting real-world ambitions into heroic RPG quest lines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* NPC Dialogue Box */}
          <div className="bg-rpg-dark/90 border border-purple-900/60 rounded p-4 relative">
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              <span className="text-fuchsia-400 font-bold">Guildmaster:</span> "Greetings, traveler! Do not let towering mountains daunt your spirit. State whatever goal burdens your mind, and my arcane wisdom shall carve it into stepped trials and bounties."
            </p>
          </div>

          {/* Goal Input Form */}
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label htmlFor="ai-goal-input" className="block text-xs font-mono text-slate-300 mb-1 font-semibold">
                Your Real-World Ambition or Project:
              </label>
              <div className="flex gap-2">
                <input
                  id="ai-goal-input"
                  type="text"
                  required
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Master React and build full-stack project"
                  className="flex-1 bg-rpg-dark border border-rpg-border focus:border-fuchsia-400 focus-visible:ring-2 focus-visible:ring-fuchsia-400 rounded px-3 py-2 text-sm text-white placeholder-slate-500 outline-none font-sans"
                />
                <button
                  type="submit"
                  disabled={isGeneratingAI || !goal.trim()}
                  className="px-4 py-2 rounded bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-mono text-xs font-bold shadow-pixel-sm border border-fuchsia-400 disabled:opacity-50 flex items-center gap-1.5 transition active:translate-y-0.5"
                >
                  {isGeneratingAI ? (
                    <>
                      <Wand2 className="w-4 h-4 animate-spin text-fuchsia-200" />
                      Weaving...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Decompose
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Inspiration Chips */}
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                Quick Inspiration:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGoal(s)}
                    className="text-[11px] font-mono bg-rpg-dark text-slate-400 hover:text-slate-200 hover:border-slate-500 px-2.5 py-1 rounded border border-rpg-border transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Generated Quest Chain Preview */}
          {questChain && (
            <div className="mt-5 space-y-3 pt-4 border-t border-rpg-border">
              <div className="flex items-center justify-between">
                <h4 className="font-pixel text-xs text-fuchsia-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  Proposed Quest Chain ({questChain.length} Stages)
                </h4>
                <button
                  onClick={handleAcceptAll}
                  disabled={isAccepting || questChain.length === 0}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold shadow-pixel-sm border border-emerald-400 flex items-center gap-1.5 transition active:translate-y-0.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isAccepting ? 'Posting...' : 'Accept Quests'}
                </button>
              </div>

              <div className="space-y-2.5">
                {questChain.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-rpg-dark/90 border border-fuchsia-900/60 hover:border-fuchsia-600 rounded p-3 text-left transition group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-purple-900/80 text-purple-300 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-xs text-slate-100 truncate">
                          {q.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] flex-shrink-0">
                        <span className="text-purple-400 font-bold">+{q.xpReward} XP</span>
                        <span className="text-rpg-gold font-bold">+{q.goldReward}g</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStage(idx)}
                          aria-label={`Remove stage ${idx + 1}`}
                          className="text-slate-500 hover:text-red-400 p-1 opacity-60 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed pl-7 mb-2">
                      {q.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="pl-7 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {q.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold border ${
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                          : q.difficulty === 'Medium'
                          ? 'bg-blue-950/60 text-blue-400 border-blue-800'
                          : q.difficulty === 'Hard'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                          : 'bg-red-950/60 text-red-400 border-red-800'
                      }`}>
                        {q.difficulty}
                      </span>
                      {q.verificationType === 'Timed' && (
                        <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {q.minDurationMinutes}m Focus
                        </span>
                      )}
                      {q.verificationType === 'Verified' && (
                        <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Proof Required
                        </span>
                      )}
                      {q.statType && (
                        <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-900/60 capitalize flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          +{q.difficulty === 'Hard' ? '4' : q.difficulty === 'Medium' ? '2' : '1'} {q.statType}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


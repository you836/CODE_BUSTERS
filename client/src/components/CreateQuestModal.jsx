import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore.js';
import { X, Sparkles, Coins, Sword } from 'lucide-react';

const DIFFICULTIES = [
  { level: 'Easy', xp: 25, gold: 10, desc: 'Quick 10-15 min tasks (Water, quick tidy)' },
  { level: 'Medium', xp: 75, gold: 30, desc: '30-60 min focused efforts (Study, workout)' },
  { level: 'Hard', xp: 175, gold: 75, desc: '1-3 hour deep work (Lab assignment, long read)' },
  { level: 'Epic', xp: 450, gold: 200, desc: 'Major milestone / boss project' },
];

export default function CreateQuestModal({ isOpen, onClose }) {
  const { createQuest } = useGameStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Study');
  const [difficulty, setDifficulty] = useState('Easy');
  const [questType, setQuestType] = useState('Daily');
  const [statType, setStatType] = useState('intelligence');
  const [verificationType, setVerificationType] = useState('Casual');
  const [minDurationMinutes, setMinDurationMinutes] = useState(25);
  const [proofRequired, setProofRequired] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const currentDiff = DIFFICULTIES.find((d) => d.level === difficulty) || DIFFICULTIES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const success = await createQuest({
      title,
      description,
      category,
      difficulty,
      questType,
      statType,
      verificationType,
      minDurationMinutes: verificationType === 'Timed' ? minDurationMinutes : 0,
      proofRequired: verificationType === 'Verified' ? proofRequired : '',
    });
    setIsSubmitting(false);

    if (success) {
      setTitle('');
      setDescription('');
      setVerificationType('Casual');
      setMinDurationMinutes(25);
      setProofRequired('');
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-quest-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-rpg-panel border-2 border-rpg-gold w-full max-w-lg rounded shadow-pixel overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-rpg-dark px-5 py-3 border-b-2 border-rpg-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sword className="w-4 h-4 text-rpg-gold" />
            <h3 id="create-quest-title" className="font-pixel text-xs text-rpg-gold">Post New Bounty</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Title */}
          <div>
            <label htmlFor="quest-title-input" className="block font-mono text-xs text-slate-300 mb-1 font-semibold">
              Quest Title <span className="text-red-400">*</span>
            </label>
            <input
              id="quest-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master the Binary Tree algorithms"
              className="w-full bg-rpg-dark border border-rpg-border focus:border-rpg-gold focus-visible:ring-2 focus-visible:ring-rpg-gold rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="quest-desc-input" className="block font-mono text-xs text-slate-300 mb-1 font-semibold">
              Lore / Objectives (Optional)
            </label>
            <textarea
              id="quest-desc-input"
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background context or specific criteria for victory..."
              className="w-full bg-rpg-dark border border-rpg-border focus:border-rpg-gold focus-visible:ring-2 focus-visible:ring-rpg-gold rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none resize-none"
            />
          </div>

          {/* Category & Stat Growth */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="quest-category-select" className="block font-mono text-xs text-slate-300 mb-1 font-semibold">
                Category
              </label>
              <select
                id="quest-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-rpg-dark border border-rpg-border rounded px-3 py-2 text-xs text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-rpg-gold"
              >
                <option value="Study">Study (Knowledge)</option>
                <option value="Fitness">Fitness (Strength)</option>
                <option value="Work">Work (Discipline)</option>
                <option value="Chores">Chores (Maintenance)</option>
                <option value="Health">Health (Recovery)</option>
                <option value="Creative">Creative (Art/Music)</option>
              </select>
            </div>

            <div>
              <label htmlFor="quest-stat-select" className="block font-mono text-xs text-slate-300 mb-1 font-semibold">
                Stat Growth
              </label>
              <select
                id="quest-stat-select"
                value={statType}
                onChange={(e) => setStatType(e.target.value)}
                className="w-full bg-rpg-dark border border-rpg-border rounded px-3 py-2 text-xs text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-rpg-gold"
              >
                <option value="intelligence">🧠 Intelligence</option>
                <option value="strength">💪 Strength</option>
                <option value="endurance">🛡️ Endurance</option>
              </select>
            </div>
          </div>

          {/* Verification */}
          <div>
            <label className="block font-mono text-xs text-slate-300 mb-2 font-semibold">Verification Method</label>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Verification Method">
              {[['Casual', 'Self-report'], ['Timed', 'Focus timer'], ['Verified', 'Reflection']].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setVerificationType(value)}
                  className={`p-2 rounded border text-left transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${verificationType === value ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : 'bg-rpg-dark border-rpg-border text-slate-400 hover:border-slate-500'}`}
                >
                  <div className="text-xs font-mono font-bold">{value}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{label}</div>
                </button>
              ))}
            </div>
            {verificationType === 'Timed' && (
              <div className="mt-2">
                <label htmlFor="timed-minutes-input" className="block text-[11px] text-slate-400 mb-1 font-mono">Minimum focus time (minutes)</label>
                <input id="timed-minutes-input" type="number" min="1" max="240" value={minDurationMinutes} onChange={(e) => setMinDurationMinutes(Math.max(1, Number(e.target.value) || 1))} className="w-full bg-rpg-dark border border-rpg-border rounded px-3 py-2 text-xs text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400" />
              </div>
            )}
            {verificationType === 'Verified' && (
              <div className="mt-2">
                <label htmlFor="proof-required-input" className="block text-[11px] text-slate-400 mb-1 font-mono">What should the hero prove?</label>
                <input id="proof-required-input" type="text" value={proofRequired} onChange={(e) => setProofRequired(e.target.value)} placeholder="e.g. Write 2 key takeaways from the reading" className="w-full bg-rpg-dark border border-rpg-border rounded px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400" />
              </div>
            )}
          </div>

          {/* Difficulty Tiers with Live Bounty Preview */}
          <div>
            <label className="block font-mono text-xs text-slate-300 mb-2 font-semibold">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Difficulty Selection">
              {DIFFICULTIES.map((d) => (
                <button
                  type="button"
                  key={d.level}
                  onClick={() => setDifficulty(d.level)}
                  className={`p-2 rounded border text-left transition focus-visible:ring-2 focus-visible:ring-purple-400 ${
                    difficulty === d.level
                      ? 'bg-purple-950 border-purple-400 text-purple-200 shadow-glow-xp'
                      : 'bg-rpg-dark border-rpg-border text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">{d.level}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-purple-400" />+{d.xp} XP
                  </div>
                  <div className="text-[10px] text-yellow-400 flex items-center gap-1">
                    <Coins className="w-2.5 h-2.5 text-yellow-400" />+{d.gold}g
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1.5 italic">
              {currentDiff.desc}
            </p>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-pixel font-bold shadow-pixel-sm border border-amber-300 transition active:translate-y-0.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Inscribing...' : 'Pin to Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


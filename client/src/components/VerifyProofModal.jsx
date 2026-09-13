import React, { useState, useEffect } from 'react';
import { X, ScrollText, ShieldCheck } from 'lucide-react';
import { useGameStore } from '../store/useGameStore.js';

export default function VerifyProofModal({ quest, onClose }) {
  const { submitProof, completeQuest } = useGameStore();
  const [proof, setProof] = useState(quest?.proofSubmission || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  if (!quest) return null;
  const submitted = Boolean(quest.proofSubmission);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const updated = await submitProof(quest._id, proof);
    setIsSubmitting(false);
    if (updated) setProof(updated.proofSubmission || proof);
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
      aria-labelledby="verify-proof-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-rpg-panel border-2 border-rpg-gold rounded shadow-pixel overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-3 bg-rpg-dark border-b border-rpg-border">
          <div className="flex items-center gap-2 text-rpg-gold">
            <ScrollText className="w-5 h-5" />
            <span id="verify-proof-title" className="font-pixel text-xs">Verification Scroll</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">{quest.proofRequired || 'Describe what you accomplished and what you learned.'}</p>
          </div>
          <label htmlFor="proof-textarea" className="block text-xs font-mono text-slate-300 font-semibold">
            Your Reflection / Evidence:
          </label>
          <textarea
            id="proof-textarea"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            minLength={5}
            rows={5}
            placeholder="Write a short reflection or evidence of completion..."
            className="w-full bg-rpg-dark border border-rpg-border focus:border-rpg-gold focus-visible:ring-2 focus-visible:ring-rpg-gold rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none resize-none font-sans"
          />
          <button
            type="submit"
            disabled={isSubmitting || proof.trim().length < 5}
            className="w-full py-2 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-pixel text-xs border border-amber-300 shadow-pixel-sm active:translate-y-0.5 transition"
          >
            {isSubmitting ? 'Inscribing...' : submitted ? 'Update Evidence' : 'Submit Evidence'}
          </button>
          <div className="flex items-center gap-2 p-3 bg-rpg-dark border border-rpg-border rounded text-xs text-slate-300 font-mono">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>The server checks that evidence exists before allowing the reward claim.</span>
          </div>
          {submitted && (
            <button
              type="button"
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-pixel text-xs border border-emerald-300 shadow-pixel-sm active:translate-y-0.5 transition"
            >
              {isClaiming ? 'Claiming...' : 'Claim Glory'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}


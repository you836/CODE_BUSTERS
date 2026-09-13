import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore.js';
import QuestCard from './QuestCard.jsx';
import SkeletonCard from './SkeletonCard.jsx';
import { Scroll, Sparkles, Filter, Plus, Bot, RotateCcw } from 'lucide-react';

const CATEGORIES = ['All', 'Study', 'Fitness', 'Work', 'Chores', 'Health', 'Creative'];
const QUEST_TYPES = ['All', 'Daily', 'MainQuest', 'Habit'];

export default function QuestBoard({ onOpenCreate, onOpenAI }) {
  const { quests, isLoadingQuests } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showCompleted, setShowCompleted] = useState(false);

  // Filter quests
  const filteredQuests = quests.filter((q) => {
    const matchCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchType = selectedType === 'All' || q.questType === selectedType;
    const matchStatus = showCompleted ? true : q.status !== 'Completed';
    return matchCategory && matchType && matchStatus;
  });

  const activeCount = quests.filter((q) => q.status !== 'Completed').length;
  const completedCount = quests.filter((q) => q.status === 'Completed').length;
  const isFiltering = selectedCategory !== 'All' || selectedType !== 'All';

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedType('All');
    setShowCompleted(false);
  };

  return (
    <section aria-label="Guild Quest Board" className="space-y-6">
      {/* Board Header & Controls */}
      <div className="bg-rpg-panel border-2 border-rpg-border rounded p-4 shadow-pixel-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="font-pixel text-sm text-rpg-gold flex items-center gap-2">
              <Scroll className="w-4 h-4 text-rpg-gold" />
              Guild Quest Board
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Active Bounties: <span className="text-emerald-400 font-bold">{activeCount}</span> | Conquered: <span className="text-purple-400 font-bold">{completedCount}</span>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={onOpenAI}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-semibold shadow-pixel-sm border border-purple-400/40 transition active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <Bot className="w-4 h-4" />
              AI Quest Generator
            </button>
            <button
              onClick={onOpenCreate}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-pixel font-bold shadow-pixel-sm border border-amber-300 transition active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <Plus className="w-4 h-4" />
              Post Quest
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="mt-4 pt-4 border-t border-rpg-border/60 flex flex-wrap items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Quest Category Filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition focus-visible:ring-2 focus-visible:ring-purple-400 ${
                  selectedCategory === cat
                    ? 'bg-purple-900 text-purple-200 border border-purple-500 font-bold shadow-pixel-sm'
                    : 'bg-rpg-dark text-slate-400 hover:text-slate-200 border border-rpg-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Completed Toggle & Reset */}
          <div className="flex items-center gap-3">
            {isFiltering && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 underline transition"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 select-none">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded bg-rpg-dark border-rpg-border text-purple-600 focus:ring-0 focus-visible:ring-2 focus-visible:ring-purple-400"
              />
              Show Conquered ({completedCount})
            </label>
          </div>
        </div>
      </div>

      {/* Quest Grid */}
      {isLoadingQuests ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="text-center py-16 bg-rpg-panel/40 border-2 border-dashed border-rpg-border rounded p-8 animate-fadeIn">
          <div className="text-4xl mb-3">🛡️</div>
          <h3 className="font-pixel text-xs text-slate-300 mb-2">
            {isFiltering ? `No Quests Found in "${selectedCategory}"` : 'No Quests in this Realm'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 font-mono">
            {isFiltering
              ? 'No active quests match your current category filter. Reset filters or post a new bounty.'
              : 'The notice board is clear. Post a new bounty or summon the AI Guildmaster to turn your ambition into quests!'}
          </p>
          <div className="flex justify-center gap-2">
            {isFiltering ? (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-600 text-white text-xs font-mono font-bold shadow-pixel-sm border border-purple-500 inline-flex items-center gap-2 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            ) : (
              <button
                onClick={onOpenCreate}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-pixel font-bold shadow-pixel-sm border border-amber-300 inline-flex items-center gap-2 transition active:translate-y-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Your First Quest
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuests.map((quest, index) => (
            <QuestCard key={quest._id} quest={quest} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}


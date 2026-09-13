import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { sounds } from '../utils/soundEffects.js';
import { 
  Shield, 
  Coins, 
  Flame, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Scroll, 
  ShoppingBag, 
  Backpack, 
  Bot 
} from 'lucide-react';

export default function NavbarHUD({ activeTab, setActiveTab, onOpenAI, onOpenCreate }) {
  const { user, logout } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);

  if (!user) return null;

  const toggleAudio = () => {
    const newState = sounds.toggleSound();
    setSoundEnabled(newState);
    if (newState) sounds.playClick();
  };

  const xpPercent = Math.min(100, Math.round(((user.currentXP || 0) / (user.maxXP || 100)) * 100));

  return (
    <header className="bg-rpg-panel border-b-2 border-rpg-border sticky top-0 z-30 shadow-pixel">
      {/* Top Hero Status HUD */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Hero Identity */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded bg-rpg-dark border-2 border-rpg-gold flex items-center justify-center text-xl shadow-pixel-sm overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              '🛡️'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs text-rpg-gold tracking-wide">
                {user.username}
              </span>
              <span className="text-xs bg-purple-900/60 text-purple-200 border border-purple-600 px-2 py-0.5 rounded font-mono font-semibold">
                Lvl {user.level}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono italic">
              {user.title || 'Novice Adventurer'}
            </p>
            {/* Compact Mobile XP Bar */}
            <div className="sm:hidden mt-1.5 w-28">
              <div className="h-1.5 bg-rpg-dark rounded-full overflow-hidden border border-purple-900">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-amber-400"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic XP Progress Bar */}
        <div className="flex-1 max-w-md hidden sm:flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-purple-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              EXP PROGRESS
            </span>
            <span className="text-[11px] text-slate-300 font-mono">
              {user.currentXP || 0} / {user.maxXP || 100} XP ({xpPercent}%)
            </span>
          </div>
          <div className="h-4 bg-rpg-dark rounded-sm border border-purple-950 overflow-hidden relative shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-amber-400 transition-all duration-300 shadow-glow-xp"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Currency & Streak Tokens */}
        <div className="flex items-center gap-3">
          {/* Gold Pouch */}
          <div className="flex items-center gap-1.5 bg-rpg-dark px-3 py-1.5 rounded border border-yellow-700/60 shadow-pixel-sm">
            <Coins className="w-4 h-4 text-rpg-gold animate-pulse" />
            <span className="font-pixel text-xs text-rpg-gold font-bold">
              {user.gold}g
            </span>
          </div>

          {/* Streak Flame */}
          <div className="flex items-center gap-1.5 bg-rpg-dark px-3 py-1.5 rounded border border-orange-800/60 shadow-pixel-sm" title="Consecutive day quest streak">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="font-mono text-xs text-orange-400 font-bold">
              {user.streakCount || 0}d
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleAudio}
            aria-label={soundEnabled ? 'Mute 8-bit Audio' : 'Unmute 8-bit Audio'}
            className="p-2 rounded bg-rpg-dark border border-rpg-border hover:border-slate-400 text-slate-300 transition focus-visible:ring-2 focus-visible:ring-purple-400"
            title={soundEnabled ? 'Mute 8-bit Audio' : 'Unmute 8-bit Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Logout */}
          <button
            onClick={() => { sounds.playDecline(); logout(); }}
            aria-label="Leave the Realm (Logout)"
            className="p-2 rounded bg-rpg-dark border border-red-900/50 hover:bg-red-950/40 text-red-400 transition focus-visible:ring-2 focus-visible:ring-red-400"
            title="Leave the Realm (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <nav aria-label="Main navigation" className="bg-rpg-dark/95 border-t border-rpg-border px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto">
          {/* Realm Tabs */}
          <div className="flex items-center gap-2" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'quests'}
              onClick={() => { sounds.playClick(); setActiveTab('quests'); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-pixel tracking-wider uppercase transition focus-visible:ring-2 focus-visible:ring-purple-400 ${
                activeTab === 'quests'
                  ? 'bg-purple-900/80 text-purple-200 border-2 border-purple-500 shadow-pixel-sm'
                  : 'text-slate-400 hover:text-white hover:bg-rpg-panel'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              Quest Board
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'shop'}
              onClick={() => { sounds.playClick(); setActiveTab('shop'); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-pixel tracking-wider uppercase transition focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                activeTab === 'shop'
                  ? 'bg-yellow-900/80 text-yellow-200 border-2 border-yellow-500 shadow-pixel-sm'
                  : 'text-slate-400 hover:text-white hover:bg-rpg-panel'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Tavern Shop
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'inventory'}
              onClick={() => { sounds.playClick(); setActiveTab('inventory'); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-pixel tracking-wider uppercase transition focus-visible:ring-2 focus-visible:ring-blue-400 ${
                activeTab === 'inventory'
                  ? 'bg-blue-900/80 text-blue-200 border-2 border-blue-500 shadow-pixel-sm'
                  : 'text-slate-400 hover:text-white hover:bg-rpg-panel'
              }`}
            >
              <Backpack className="w-3.5 h-3.5" />
              Backpack
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { sounds.playClick(); onOpenAI(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-fuchsia-700 to-indigo-700 hover:from-fuchsia-600 hover:to-indigo-600 text-white text-xs font-semibold shadow-pixel-sm transition border border-fuchsia-400/40 active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-fuchsia-400"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Guildmaster</span>
              <span className="sm:hidden">AI</span>
            </button>

            <button
              onClick={() => { sounds.playClick(); onOpenCreate(); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black text-xs font-pixel font-bold shadow-pixel-sm transition border border-amber-300 active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              + New Quest
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

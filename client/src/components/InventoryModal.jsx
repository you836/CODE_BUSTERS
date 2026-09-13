import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import SkeletonCard from './SkeletonCard.jsx';
import { Backpack, Shield, Sword, Sparkles, Check, Package, Award, Zap, Brain, Heart, Trophy } from 'lucide-react';

export default function InventoryModal() {
  const { inventory, fetchInventory, equipItem, isLoadingInventory } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const badges = user?.badges || [];

  return (
    <section aria-label="Adventurer Backpack & Equipment" className="space-y-6">
      {/* Hero Attributes & Stats Card */}
      <div className="bg-rpg-panel border-2 border-rpg-border rounded p-5 shadow-pixel-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-rpg-dark border-2 border-rpg-mana flex items-center justify-center text-2xl shadow-pixel-sm">
              🎒
            </div>
            <div>
              <h2 className="font-pixel text-sm text-rpg-mana">
                Adventurer Backpack & Hall of Glory
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Manage your armaments, examine attributes, and review earned badges.
              </p>
            </div>
          </div>

          {/* Core Stat Ratings */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-rpg-dark border border-red-900/60 px-3 py-1.5 rounded text-center">
              <div className="text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-red-400" /> Strength
              </div>
              <div className="font-mono text-sm font-bold text-red-400">
                {user?.strength || 0}
              </div>
            </div>
            <div className="flex-1 md:flex-none bg-rpg-dark border border-blue-900/60 px-3 py-1.5 rounded text-center">
              <div className="text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1">
                <Brain className="w-3 h-3 text-blue-400" /> Intellect
              </div>
              <div className="font-mono text-sm font-bold text-blue-400">
                {user?.intelligence || 0}
              </div>
            </div>
            <div className="flex-1 md:flex-none bg-rpg-dark border border-emerald-900/60 px-3 py-1.5 rounded text-center">
              <div className="text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 text-emerald-400" /> Endurance
              </div>
              <div className="font-mono text-sm font-bold text-emerald-400">
                {user?.endurance || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Badges / Achievements Showcase */}
        {badges.length > 0 && (
          <div className="mt-5 pt-4 border-t border-rpg-border/60">
            <div className="flex items-center gap-2 mb-2.5">
              <Trophy className="w-4 h-4 text-rpg-gold" />
              <h3 className="font-pixel text-xs text-rpg-gold">
                Unlocked Achievement Badges ({badges.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.map((b, idx) => (
                <div
                  key={idx}
                  className="bg-rpg-dark border border-rpg-gold/40 hover:border-rpg-gold rounded px-2.5 py-1.5 flex items-center gap-2 transition"
                >
                  <span className="text-sm">🏆</span>
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-200 capitalize">
                      {b.badgeId ? b.badgeId.replace(/_/g, ' ') : 'Hero Achievement'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inventory Items Grid */}
      {isLoadingInventory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-16 bg-rpg-panel/40 border-2 border-dashed border-rpg-border rounded p-8 animate-fadeIn">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="font-pixel text-xs text-slate-300 mb-2">Backpack is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
            You currently possess no relics or gear. Visit the Tavern Merchant to spend your quest gold!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((inv) => {
            const item = inv.itemId || {};
            const isEquipped = inv.isEquipped;

            return (
              <div
                key={inv._id}
                className={`bg-rpg-panel border-2 rounded p-4 shadow-pixel-sm flex flex-col justify-between transition-all duration-200 ${
                  isEquipped ? 'border-emerald-500 bg-emerald-950/20' : 'border-rpg-border hover:border-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                        {item.name}
                        {isEquipped && (
                          <span className="text-[10px] font-mono bg-emerald-900 text-emerald-300 border border-emerald-500 px-1.5 py-0.5 rounded font-bold">
                            EQUIPPED
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        {item.itemType} {inv.quantity > 1 ? `(x${inv.quantity})` : ''}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                {/* Equip / Unequip Toggle */}
                {!item.isRealLifeReward && (
                  <button
                    onClick={() => equipItem(inv._id)}
                    className={`w-full py-1.5 rounded text-xs font-mono font-bold transition flex items-center justify-center gap-1 shadow-pixel-sm active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      isEquipped
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'
                        : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400'
                    }`}
                  >
                    {isEquipped ? 'Unequip' : 'Equip Gear'}
                  </button>
                )}
                {item.isRealLifeReward && (
                  <div className="text-center py-1 text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800 rounded">
                    Claimed Real-Life Reward
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}


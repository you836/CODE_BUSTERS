import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import SkeletonCard from './SkeletonCard.jsx';
import { 
  ShoppingBag, 
  Coins, 
  Shield, 
  Sword, 
  Sparkles, 
  Coffee, 
  Gamepad2, 
  Tv, 
  Plus, 
  Check, 
  Package,
  X,
  Zap,
  Heart
} from 'lucide-react';

const ICON_MAP = {
  sword: Sword,
  staff: Sparkles,
  shield: Shield,
  potion: Sparkles,
  gamepad: Gamepad2,
  coffee: Coffee,
  tv: Tv,
};

export default function ShopModal() {
  const { shopItems, fetchShop, buyItem, createCustomReward, isLoadingShop } = useGameStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState('gear'); // 'gear' | 'rewards'
  const [showCreateReward, setShowCreateReward] = useState(false);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('75');
  const [newRewardDesc, setNewRewardDesc] = useState('');

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showCreateReward) {
        setShowCreateReward(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCreateReward]);

  const gearItems = shopItems.filter((i) => !i.isRealLifeReward);
  const realLifeRewards = shopItems.filter((i) => i.isRealLifeReward);
  const currentItems = activeTab === 'gear' ? gearItems : realLifeRewards;

  const handleCreateReward = async (e) => {
    e.preventDefault();
    if (!newRewardName.trim() || !newRewardCost) return;

    const success = await createCustomReward({
      name: newRewardName,
      description: newRewardDesc,
      costGold: Number(newRewardCost),
      icon: 'coffee',
    });

    if (success) {
      setNewRewardName('');
      setNewRewardDesc('');
      setShowCreateReward(false);
    }
  };

  return (
    <section aria-label="Tavern Merchant Shop" className="space-y-6">
      {/* Merchant Header */}
      <div className="bg-rpg-panel border-2 border-rpg-border rounded p-5 shadow-pixel-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-rpg-dark border-2 border-rpg-gold flex items-center justify-center text-2xl shadow-pixel-sm">
              🧙‍♂️
            </div>
            <div>
              <h2 className="font-pixel text-sm text-rpg-gold">
                The Gilded Tankard Merchant
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Spend your hard-earned gold on legendary equipment or real-life guilty pleasures!
              </p>
            </div>
          </div>

          {/* Current Gold Pouch */}
          <div className="flex items-center gap-2 bg-rpg-dark border-2 border-rpg-gold px-4 py-2 rounded shadow-pixel-sm">
            <Coins className="w-5 h-5 text-rpg-gold animate-bounce" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Treasury</div>
              <div className="font-pixel text-sm text-rpg-gold">{user?.gold || 0}g</div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="mt-5 pt-4 border-t border-rpg-border/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2" role="tablist" aria-label="Shop categories">
            <button
              role="tab"
              aria-selected={activeTab === 'gear'}
              onClick={() => setActiveTab('gear')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition focus-visible:ring-2 focus-visible:ring-purple-400 ${
                activeTab === 'gear'
                  ? 'bg-purple-900 text-purple-200 border border-purple-500 shadow-pixel-sm'
                  : 'bg-rpg-dark text-slate-400 hover:text-white border border-rpg-border'
              }`}
            >
              <Sword className="w-3.5 h-3.5" />
              In-Game Gear ({gearItems.length})
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'rewards'}
              onClick={() => setActiveTab('rewards')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                activeTab === 'rewards'
                  ? 'bg-yellow-900 text-yellow-200 border border-yellow-500 shadow-pixel-sm'
                  : 'bg-rpg-dark text-slate-400 hover:text-white border border-rpg-border'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              Real-World Rewards ({realLifeRewards.length})
            </button>
          </div>

          {activeTab === 'rewards' && (
            <button
              onClick={() => setShowCreateReward(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-pixel-sm border border-emerald-400 transition active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Plus className="w-3.5 h-3.5" />
              Forge Custom Reward
            </button>
          )}
        </div>
      </div>

      {/* Forge Custom Real-Life Reward Modal */}
      {showCreateReward && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-reward-title"
          onClick={() => setShowCreateReward(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-rpg-panel border-2 border-rpg-gold w-full max-w-md rounded shadow-pixel p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 id="custom-reward-title" className="font-pixel text-xs text-rpg-gold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Forge Your Real-Life Reward
              </h3>
              <button
                onClick={() => setShowCreateReward(false)}
                aria-label="Close modal"
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mb-4 font-mono leading-relaxed">
              Connect in-game productivity to physical life! Set a goal you can guilt-free purchase with your quest gold.
            </p>

            <form onSubmit={handleCreateReward} className="space-y-3 font-mono">
              <div>
                <label htmlFor="reward-name-input" className="block text-xs text-slate-400 mb-1 font-semibold">
                  Reward Name
                </label>
                <input
                  id="reward-name-input"
                  type="text"
                  required
                  value={newRewardName}
                  onChange={(e) => setNewRewardName(e.target.value)}
                  placeholder="e.g. 1 Episode of Anime / Takeout Night"
                  className="w-full bg-rpg-dark border border-rpg-border rounded px-3 py-2 text-xs text-white outline-none focus:border-rpg-gold focus-visible:ring-2 focus-visible:ring-rpg-gold"
                />
              </div>

              <div>
                <label htmlFor="reward-cost-input" className="block text-xs text-slate-400 mb-1 font-semibold">
                  Gold Cost
                </label>
                <input
                  id="reward-cost-input"
                  type="number"
                  required
                  min="10"
                  value={newRewardCost}
                  onChange={(e) => setNewRewardCost(e.target.value)}
                  className="w-full bg-rpg-dark border border-rpg-border rounded px-3 py-2 text-xs text-white outline-none focus:border-rpg-gold focus-visible:ring-2 focus-visible:ring-rpg-gold"
                />
              </div>

              <div>
                <label htmlFor="reward-desc-input" className="block text-xs text-slate-400 mb-1 font-semibold">
                  Description (Optional)
                </label>
                <textarea
                  id="reward-desc-input"
                  rows="2"
                  value={newRewardDesc}
                  onChange={(e) => setNewRewardDesc(e.target.value)}
                  placeholder="Terms: Only redeemable after completing study quests!"
                  className="w-full bg-rpg-dark border border-rpg-border rounded px-3 py-2 text-xs text-white outline-none focus:border-rpg-gold focus-visible:ring-2 focus-visible:ring-rpg-gold resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateReward(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-pixel font-bold shadow-pixel-sm border border-amber-300 active:translate-y-0.5 transition"
                >
                  Save Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {isLoadingShop ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-16 bg-rpg-panel/40 border-2 border-dashed border-rpg-border rounded p-8 animate-fadeIn">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="font-pixel text-xs text-slate-300 mb-2">
            {activeTab === 'gear' ? 'No Equipment in Stock' : 'No Custom Rewards Yet'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 font-mono">
            {activeTab === 'gear'
              ? 'The merchant is crafting new weapons and relics. Check back soon!'
              : 'Create your first real-life dopamine reward to spend your quest bounty on!'}
          </p>
          {activeTab === 'rewards' && (
            <button
              onClick={() => setShowCreateReward(true)}
              className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-pixel font-bold shadow-pixel-sm border border-amber-300 inline-flex items-center gap-2 transition active:translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Forge Custom Reward
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentItems.map((item) => {
            const Icon = ICON_MAP[item.icon] || Package;
            const canAfford = (user?.gold || 0) >= item.costGold;

            return (
              <div
                key={item._id}
                className="bg-rpg-panel border-2 border-rpg-border hover:border-rpg-gold/60 rounded p-4 shadow-pixel-sm flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
              >
                <div>
                  {/* Item Top Row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded bg-rpg-dark border border-rpg-border flex items-center justify-center text-rpg-gold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-100">{item.name}</h4>
                        <span className="text-[10px] font-mono uppercase text-slate-400">
                          {item.rarity} {item.itemType}
                        </span>
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="flex items-center gap-1 font-mono font-bold text-xs text-rpg-gold bg-rpg-dark px-2.5 py-1 rounded border border-yellow-800/60">
                      <Coins className="w-3.5 h-3.5" />
                      {item.costGold}g
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed mb-3">
                    {item.description}
                  </p>

                  {/* Stat Bonus Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.statBonus?.xpMultiplier > 1 && (
                      <div className="text-[11px] font-mono text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded inline-block">
                        ✨ +{Math.round((item.statBonus.xpMultiplier - 1) * 100)}% XP
                      </div>
                    )}
                    {item.statBonus?.strengthBonus > 0 && (
                      <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded inline-block">
                        💪 +{item.statBonus.strengthBonus} Str
                      </div>
                    )}
                    {item.statBonus?.intelligenceBonus > 0 && (
                      <div className="text-[11px] font-mono text-blue-300 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded inline-block">
                        🧠 +{item.statBonus.intelligenceBonus} Int
                      </div>
                    )}
                    {item.statBonus?.enduranceBonus > 0 && (
                      <div className="text-[11px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded inline-block">
                        🏃 +{item.statBonus.enduranceBonus} End
                      </div>
                    )}
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => buyItem(item._id)}
                  disabled={!canAfford}
                  className={`w-full py-2 rounded text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-pixel-sm active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-rpg-gold ${
                    canAfford
                      ? item.isRealLifeReward
                        ? 'bg-amber-500 hover:bg-amber-400 text-black border border-amber-300'
                        : 'bg-purple-700 hover:bg-purple-600 text-white border border-purple-400'
                      : 'bg-rpg-dark text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {item.isRealLifeReward ? 'Claim Reward' : 'Purchase Gear'}
                    </>
                  ) : (
                    'Insufficient Gold'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

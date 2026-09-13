import { create } from 'zustand';
import api from '../api/axios.js';
import { sounds } from '../utils/soundEffects.js';
import { useAuthStore } from './useAuthStore.js';
import confetti from 'canvas-confetti';

let toastTimer = null;

export const useGameStore = create((set, get) => ({
  quests: [],
  shopItems: [],
  inventory: [],
  isLoadingQuests: false,
  isLoadingShop: false,
  isLoadingInventory: false,
  isGeneratingAI: false,
  completingIds: {}, // Debounce tracking for quest claims
  levelUpCelebration: null, // { newLevel, bonusGold, statIncreased }
  toast: null, // { message, type }

  showToast: (message, type = 'success') => {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    set({ toast: { message, type } });
    toastTimer = setTimeout(() => {
      set({ toast: null });
      toastTimer = null;
    }, 4000);
  },

  dismissLevelUp: () => {
    set({ levelUpCelebration: null });
  },

  // Fetch all quests
  fetchQuests: async () => {
    set({ isLoadingQuests: true });
    try {
      const { data } = await api.get('/quests');
      set({ quests: data, isLoadingQuests: false });
    } catch (error) {
      console.error('Error fetching quests:', error);
      set({ isLoadingQuests: false });
      get().showToast('Failed to retrieve guild quests from the realm.', 'error');
    }
  },

  // Create a new quest
  createQuest: async (questData) => {
    try {
      const { data } = await api.post('/quests', questData);
      sounds.playClick();
      set((state) => ({ quests: [data, ...state.quests] }));
      get().showToast(`⚔️ Quest "${data.title}" posted to the board!`);
      return true;
    } catch (error) {
      get().showToast(error.response?.data?.message || 'Failed to post quest', 'error');
      return false;
    }
  },

  // Start a timed quest. Optimistic instant start + server authoritative timestamp
  startTimedQuest: async (id) => {
    const optimisticStart = new Date().toISOString();
    // Optimistically update quest so UI transitions instantly (zero lag)
    set((state) => ({
      quests: state.quests.map((q) =>
        q._id === id ? { ...q, status: 'InProgress', startedAt: q.startedAt || optimisticStart } : q
      ),
    }));

    try {
      const { data } = await api.post(`/quests/${id}/start`);
      set((state) => ({
        quests: state.quests.map((q) => (q._id === id ? data.quest : q)),
      }));
      sounds.playClick();
      get().showToast(data.message || 'Focus session started!');
      return data.quest;
    } catch (error) {
      // Revert if request failed
      set((state) => ({
        quests: state.quests.map((q) =>
          q._id === id ? { ...q, status: 'Pending', startedAt: null } : q
        ),
      }));
      get().showToast(error.response?.data?.message || 'Failed to start focus session', 'error');
      return null;
    }
  },

  // Submit evidence/reflection for a verified quest.
  submitProof: async (id, proof) => {
    try {
      const { data } = await api.post(`/quests/${id}/verify`, { proof });
      set((state) => ({
        quests: state.quests.map((q) => (q._id === id ? data.quest : q)),
      }));
      sounds.playClick();
      get().showToast(data.message || 'Evidence submitted!');
      return data.quest;
    } catch (error) {
      get().showToast(error.response?.data?.message || 'Failed to submit evidence', 'error');
      return null;
    }
  },

  // Complete a quest (Core Game Loop)
  completeQuest: async (id) => {
    const currentCompleting = get().completingIds;
    if (currentCompleting[id]) return false; // Prevent concurrent double-clicks

    set((state) => ({ completingIds: { ...state.completingIds, [id]: true } }));

    try {
      const { data } = await api.patch(`/quests/${id}/complete`);

      // Update quests list
      set((state) => ({
        quests: state.quests.map((q) => (q._id === id ? data.quest : q)),
        completingIds: { ...state.completingIds, [id]: false },
      }));

      // Update user state in auth store (XP, gold, level, stats, badges)
      if (data.user) {
        useAuthStore.getState().updateUserStats(data.user);
      }

      if (data.streakFreezeUsed) {
        get().showToast('🛡️ Elixir of Time Freeze consumed! Your streak was preserved!', 'success');
      }

      if (data.newBadges && data.newBadges.length > 0) {
        data.newBadges.forEach((badge) => {
          get().showToast(`🏆 Badge Unlocked: ${badge.icon} ${badge.name}!`, 'success');
        });
      }

      if (data.progression?.leveledUp) {
        // Level up trigger!
        sounds.playLevelUp();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f1e05a', '#a371f7', '#58a6ff', '#3fb950'],
        });
        set({
          levelUpCelebration: {
            newLevel: data.progression.newLevel,
            bonusGold: data.rewards.bonusGold,
            statIncreased: data.rewards.statType,
            statGain: data.rewards.statGain,
          },
        });
      } else {
        // Standard victory
        sounds.playQuestComplete();
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });
        const statMsg = data.rewards?.statType ? ` (+${data.rewards.statGain} ${data.rewards.statType})` : '';
        get().showToast(`⚔️ Conquered! +${data.rewards.earnedXP} XP, +${data.rewards.earnedGold} Gold${statMsg}!`);
      }
      return true;
    } catch (error) {
      set((state) => ({ completingIds: { ...state.completingIds, [id]: false } }));
      get().showToast(error.response?.data?.message || 'Failed to complete quest', 'error');
      return false;
    }
  },

  // Delete a quest (Optimistic update with rollback)
  deleteQuest: async (id) => {
    const previousQuests = get().quests;
    set((state) => ({
      quests: state.quests.filter((q) => q._id !== id),
    }));
    sounds.playDecline();

    try {
      await api.delete(`/quests/${id}`);
      get().showToast('Quest removed from the board.');
    } catch (error) {
      // Rollback on failure
      set({ quests: previousQuests });
      get().showToast(error.response?.data?.message || 'Failed to delete quest', 'error');
    }
  },

  // Fetch shop items
  fetchShop: async () => {
    set({ isLoadingShop: true });
    try {
      const { data } = await api.get('/shop/items');
      set({ shopItems: data, isLoadingShop: false });
    } catch (error) {
      console.error('Error fetching shop:', error);
      set({ isLoadingShop: false });
      get().showToast('The Tavern merchant is currently restocking.', 'error');
    }
  },

  // Buy item
  buyItem: async (itemId) => {
    try {
      const { data } = await api.post(`/shop/buy/${itemId}`);
      sounds.playCoin();
      useAuthStore.getState().updateUserStats({ gold: data.remainingGold });
      get().showToast(data.message);
      get().fetchInventory();
      return true;
    } catch (error) {
      sounds.playDecline();
      get().showToast(error.response?.data?.message || 'Purchase failed', 'error');
      return false;
    }
  },

  // Fetch inventory
  fetchInventory: async () => {
    set({ isLoadingInventory: true });
    try {
      const { data } = await api.get('/shop/inventory');
      set({ inventory: data, isLoadingInventory: false });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      set({ isLoadingInventory: false });
      get().showToast('Could not reach into backpack.', 'error');
    }
  },

  // Equip / unequip item
  equipItem: async (inventoryId) => {
    try {
      await api.patch(`/shop/inventory/equip/${inventoryId}`);
      sounds.playClick();
      get().fetchInventory();
    } catch (error) {
      get().showToast('Failed to toggle equipment.', 'error');
    }
  },

  // Create custom real-life reward
  createCustomReward: async (rewardData) => {
    try {
      const { data } = await api.post('/shop/rewards/custom', rewardData);
      sounds.playClick();
      set((state) => ({ shopItems: [...state.shopItems, data] }));
      get().showToast(`🎁 Custom Reward "${data.name}" added to the shop!`);
      return true;
    } catch (error) {
      get().showToast(error.response?.data?.message || 'Failed to create reward', 'error');
      return false;
    }
  },

  // Generate AI quest chain
  generateAIQuests: async (goal) => {
    set({ isGeneratingAI: true });
    try {
      const { data } = await api.post('/ai/generate-quest', { goal });
      set({ isGeneratingAI: false });
      return data.questChain;
    } catch (error) {
      set({ isGeneratingAI: false });
      get().showToast(error.response?.data?.message || 'AI Guildmaster unavailable', 'error');
      return null;
    }
  },

  // Batch accept AI generated quests
  acceptAIQuests: async (quests) => {
    try {
      const { data } = await api.post('/ai/accept-quests', { quests });
      sounds.playQuestComplete();
      set((state) => ({ quests: [...data.quests, ...state.quests] }));
      get().showToast(data.message);
      return true;
    } catch (error) {
      get().showToast(error.response?.data?.message || 'Failed to accept quests', 'error');
      return false;
    }
  },
}));

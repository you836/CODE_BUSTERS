import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuthStore } from './store/useAuthStore.js';
import { useGameStore } from './store/useGameStore.js';
import NavbarHUD from './components/NavbarHUD.jsx';
import QuestBoard from './components/QuestBoard.jsx';
import StreakDisplay from './components/StreakDisplay.jsx';
import AuthModal from './components/AuthModal.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

const ShopModal = lazy(() => import('./components/ShopModal.jsx'));
const InventoryModal = lazy(() => import('./components/InventoryModal.jsx'));
const CreateQuestModal = lazy(() => import('./components/CreateQuestModal.jsx'));
const AIGuildmasterModal = lazy(() => import('./components/AIGuildmasterModal.jsx'));
const LevelUpModal = lazy(() => import('./components/LevelUpModal.jsx'));

export default function App() {
  const { user, logout } = useAuthStore();
  const { fetchQuests, toast } = useGameStore();

  const [activeTab, setActiveTab] = useState('quests'); // 'quests' | 'shop' | 'inventory'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuests();
    }
  }, [user, fetchQuests]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('life_rpg_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('life_rpg_unauthorized', handleUnauthorized);
  }, [logout]);

  // If unauthenticated, show Adventure Sign-in / 1-Click Demo
  if (!user) {
    return (
      <ErrorBoundary>
        <AuthModal />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-rpg-dark text-slate-100 flex flex-col selection:bg-rpg-gold selection:text-black">
        {/* Top Hero HUD and Tab Navigation */}
        <NavbarHUD
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAI={() => setShowAIModal(true)}
          onOpenCreate={() => setShowCreateModal(true)}
        />

        {/* Main Realm Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          {/* Persistent Streak HUD */}
          <StreakDisplay onOpenShop={() => setActiveTab('shop')} />

          <Suspense fallback={
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rpg-gold" />
              <p className="font-pixel text-xs text-slate-400 mt-3">Summoning realm chamber...</p>
            </div>
          }>
            <div key={activeTab} className="animate-slideUp">
              {activeTab === 'quests' && (
                <QuestBoard
                  onOpenCreate={() => setShowCreateModal(true)}
                  onOpenAI={() => setShowAIModal(true)}
                />
              )}
              {activeTab === 'shop' && <ShopModal />}
              {activeTab === 'inventory' && <InventoryModal />}
            </div>
          </Suspense>
        </main>

        {/* Interactive Overlays & Modals */}
        <Suspense fallback={null}>
          <CreateQuestModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
          />

          <AIGuildmasterModal
            isOpen={showAIModal}
            onClose={() => setShowAIModal(false)}
          />

          <LevelUpModal />
        </Suspense>

        {/* Toast Notification */}
        {toast && (
          <div
            role="alert"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 animate-slideUp"
          >
            <div
              className={`px-4 py-2.5 rounded shadow-pixel flex items-center gap-2 border font-mono text-xs ${
                toast.type === 'error'
                  ? 'bg-red-950 text-red-200 border-red-600'
                  : 'bg-rpg-panel text-slate-100 border-rpg-gold shadow-glow-gold'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}


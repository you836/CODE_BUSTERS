import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/useAuthStore.js';
import { sounds } from '../utils/soundEffects.js';
import { Sparkles, Sword, Zap, AlertCircle } from 'lucide-react';

export default function AuthModal() {
  const { login, register, demoLogin, googleLogin, isLoading, error } = useAuthStore();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isGoogleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleSubmit = async (e) => {
    e.preventDefault();
    sounds.playClick();
    if (isRegister) {
      await register(username, email, password);
    } else {
      await login(email, password);
    }
  };

  const handleDemo = async () => {
    sounds.playLevelUp();
    await demoLogin();
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      sounds.playLevelUp();
      await googleLogin(credentialResponse.credential);
    }
  };

  const handleGoogleError = () => {
    sounds.playClick();
    console.error('Google Sign-In failed.');
  };

  return (
    <div className="min-h-screen bg-rpg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background dungeon particles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-rpg-dark to-black pointer-events-none" />

      <div className="w-full max-w-md bg-rpg-panel border-4 border-rpg-gold rounded-lg shadow-glow-gold p-6 relative z-10">
        {/* Banner */}
        <div className="text-center mb-6">
          <div className="inline-block p-3 rounded-full bg-rpg-dark border-2 border-rpg-gold mb-3 shadow-pixel-sm">
            <Sword className="w-8 h-8 text-rpg-gold" />
          </div>
          <h1 className="font-pixel text-base text-rpg-gold tracking-wide uppercase drop-shadow">
            Life RPG
          </h1>
          <p className="font-mono text-xs text-purple-300 mt-1">
            Transform Real-Life Productivity into an Epic Adventure
          </p>
        </div>

        {/* 1-Click Instant Demo Button (For Judges & Instant Access) */}
        <div className="mb-4">
          <button
            onClick={handleDemo}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-pixel text-xs font-bold shadow-pixel border-2 border-yellow-200 transition active:translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-black fill-black" />
            1-Click Demo Adventurer
          </button>
          <p className="text-[11px] text-center text-slate-400 font-mono mt-1.5">
            Instant access with a Level 1 hero & starter productivity quests
          </p>
        </div>

        {/* Google OAuth Sign-In */}
        <div className="mb-5">
          {isGoogleConfigured ? (
            <div className="flex justify-center w-full">
              <div className="w-full flex justify-center bg-slate-900/70 p-1.5 rounded border border-slate-700 hover:border-rpg-gold transition shadow-pixel-sm">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="continue_with"
                  width="100%"
                />
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Google OAuth Ready
              </span>
              <span className="text-[10px] text-amber-300/90 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                Set VITE_GOOGLE_CLIENT_ID
              </span>
            </div>
          )}
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-rpg-border"></div>
          <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-slate-500">
            or sign into your adventurer account
          </span>
          <div className="flex-grow border-t border-rpg-border"></div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/80 border border-red-700 text-red-200 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono">
          {isRegister && (
            <div>
              <label htmlFor="auth-username-input" className="block text-xs text-slate-300 mb-1 font-semibold">Hero Call-Sign (Username)</label>
              <input
                id="auth-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Shadowblade"
                className="w-full bg-rpg-dark border border-rpg-border rounded px-3 py-2 text-xs text-white outline-none focus:border-rpg-gold focus-visible:ring-2 focus-visible:ring-rpg-gold"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email-input" className="block text-xs text-slate-300 mb-1 font-semibold">Scroll Address (Email)</label>
            <input
              id="auth-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hero@realm.com"
              className="w-full bg-rpg-dark border border-rpg-border rounded px-3 py-2 text-xs text-white outline-none focus:border-rpg-gold focus-visible:ring-2 focus-visible:ring-rpg-gold"
            />
          </div>

          <div>
            <label htmlFor="auth-password-input" className="block text-xs text-slate-300 mb-1 font-semibold">Passkey</label>
            <input
              id="auth-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-rpg-dark border border-rpg-border rounded px-3 py-2 text-xs text-white outline-none focus:border-rpg-gold focus-visible:ring-2 focus-visible:ring-rpg-gold"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded bg-purple-700 hover:bg-purple-600 text-white font-pixel text-xs font-bold shadow-pixel border border-purple-400 transition active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            {isLoading ? 'Consulting the Oracle...' : isRegister ? 'Forge Adventurer' : 'Enter Realm'}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="mt-5 text-center">
          <button
            onClick={() => { sounds.playClick(); setIsRegister(!isRegister); }}
            className="text-xs font-mono text-slate-400 hover:text-rpg-gold underline transition"
          >
            {isRegister
              ? 'Already registered with the Guild? Enter here.'
              : 'New adventurer? Forge your character profile.'}
          </button>
        </div>
      </div>
    </div>
  );
}


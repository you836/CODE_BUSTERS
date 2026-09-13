import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-rpg-panel border border-rpg-border rounded-lg p-4 animate-pulse space-y-3 shadow-pixel-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 bg-slate-800 rounded w-2/3"></div>
        <div className="h-4 bg-slate-800 rounded w-16"></div>
      </div>
      <div className="space-y-1.5 py-1">
        <div className="h-3 bg-slate-800/80 rounded w-full"></div>
        <div className="h-3 bg-slate-800/60 rounded w-4/5"></div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <div className="h-5 bg-slate-800 rounded w-20"></div>
        <div className="h-7 bg-slate-800 rounded w-24"></div>
      </div>
    </div>
  );
}

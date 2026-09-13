// Difficulty reward tiers (Server-Authoritative)
export const DIFFICULTY_REWARDS = {
  Easy: { xp: 25, gold: 10 },
  Medium: { xp: 75, gold: 30 },
  Hard: { xp: 175, gold: 75 },
  Epic: { xp: 450, gold: 200 },
};

// Stat points awarded per difficulty tier
export const STAT_REWARDS = {
  Easy: 1,
  Medium: 2,
  Hard: 4,
  Epic: 7,
};

// Quest category → character attribute mapping
export const CATEGORY_STAT_MAP = {
  Fitness: 'strength',
  Health: 'strength',
  Study: 'intelligence',
  Work: 'intelligence',
  Chores: 'endurance',
  Creative: 'endurance',
};

/**
 * Calculates XP required to reach the next level
 * Formula: 100 * (level ^ 1.4)
 */
export function getXPForNextLevel(level) {
  return Math.round(100 * Math.pow(level, 1.4));
}

/**
 * Checks and processes level-up triggers
 * Can handle multi-level jumps if massive XP is granted
 */
export function calculateLevelProgression(currentLevel, currentXP, maxXP, xpToAdd) {
  let level = currentLevel;
  let xp = currentXP + xpToAdd;
  let targetXP = maxXP || getXPForNextLevel(level);
  let leveledUp = false;
  let levelsGained = 0;
  let bonusGold = 0;

  while (xp >= targetXP) {
    xp -= targetXP;
    level += 1;
    levelsGained += 1;
    leveledUp = true;
    targetXP = getXPForNextLevel(level);
    // Grant level-up milestone bounty!
    bonusGold += level * 25;
  }

  return {
    newLevel: level,
    newXP: xp,
    newMaxXP: targetXP,
    leveledUp,
    levelsGained,
    bonusGold,
  };
}

/**
 * Computes updated streak based on last activity date
 * @param {Date} lastActiveDate - User's last activity timestamp
 * @param {number} currentStreak - Current streak count
 * @param {boolean} hasStreakFreeze - Whether user has an Elixir of Time Freeze
 * @returns {{ newStreak: number, freezeConsumed: boolean }}
 */
export function updateStreak(lastActiveDate, currentStreak, hasStreakFreeze = false) {
  if (!lastActiveDate) {
    return { newStreak: 1, freezeConsumed: false };
  }

  const now = new Date();
  const last = new Date(lastActiveDate);

  // Strip hours/minutes to compare calendar dates
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();

  const oneDayMs = 24 * 60 * 60 * 1000;
  const differenceDays = Math.round((todayDate - lastDate) / oneDayMs);

  if (differenceDays === 0) {
    // Already logged activity today; maintain current streak
    return { newStreak: Math.max(1, currentStreak), freezeConsumed: false };
  } else if (differenceDays === 1) {
    // Completed on the consecutive day! Streak increases
    return { newStreak: (currentStreak || 0) + 1, freezeConsumed: false };
  } else {
    // Missed a day; check for Elixir of Time Freeze
    if (hasStreakFreeze) {
      return { newStreak: Math.max(1, currentStreak), freezeConsumed: true };
    }
    // Reset streak to 1
    return { newStreak: 1, freezeConsumed: false };
  }
}

export const STREAK_TIERS = [
  { minStreak: 30, multiplier: 1.50, name: 'Undying Flame', icon: '🌟', bonusGold: 1000 },
  { minStreak: 14, multiplier: 1.35, name: 'Relentless Vanguard', icon: '⚔️', bonusGold: 300 },
  { minStreak: 7,  multiplier: 1.25, name: 'Flame Keeper', icon: '🔥', bonusGold: 150 },
  { minStreak: 3,  multiplier: 1.10, name: 'Consistent Adventurer', icon: '✨', bonusGold: 50 },
];

/**
 * Calculate streak bonus multipliers
 * e.g. +10% XP for 3+ day streak, +25% XP for 7+ day streak, +35% for 14d, +50% for 30d
 */
export function getStreakMultiplier(streakCount) {
  for (const tier of STREAK_TIERS) {
    if (streakCount >= tier.minStreak) return tier.multiplier;
  }
  return 1.0;
}

/**
 * Check if the user reached a new streak milestone on this update
 */
export function getStreakMilestoneReward(oldStreak, newStreak) {
  for (const tier of STREAK_TIERS) {
    if (newStreak >= tier.minStreak && (oldStreak || 0) < tier.minStreak) {
      return tier;
    }
  }
  return null;
}



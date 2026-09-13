/**
 * Badge / Achievement Service
 * Defines badge registry and evaluates badge conditions against user stats.
 */

// Badge Registry — All achievable badges in the realm
export const BADGE_REGISTRY = [
  // Quest Milestones
  {
    badgeId: 'first_quest',
    name: 'First Blood',
    description: 'Complete your very first quest.',
    icon: '⚔️',
    rarity: 'Common',
    category: 'quests',
    condition: { type: 'totalQuestsCompleted', threshold: 1 },
  },
  {
    badgeId: 'quest_slayer_10',
    name: 'Quest Slayer',
    description: 'Complete 10 quests.',
    icon: '🗡️',
    rarity: 'Rare',
    category: 'quests',
    condition: { type: 'totalQuestsCompleted', threshold: 10 },
  },
  {
    badgeId: 'quest_master_50',
    name: 'Quest Master',
    description: 'Complete 50 quests.',
    icon: '👑',
    rarity: 'Epic',
    category: 'quests',
    condition: { type: 'totalQuestsCompleted', threshold: 50 },
  },
  // Level Milestones
  {
    badgeId: 'level_5',
    name: 'Apprentice Hero',
    description: 'Reach Level 5.',
    icon: '🛡️',
    rarity: 'Common',
    category: 'levels',
    condition: { type: 'level', threshold: 5 },
  },
  {
    badgeId: 'level_10',
    name: 'Seasoned Warrior',
    description: 'Reach Level 10.',
    icon: '⚔️',
    rarity: 'Rare',
    category: 'levels',
    condition: { type: 'level', threshold: 10 },
  },
  {
    badgeId: 'level_25',
    name: 'Legendary Champion',
    description: 'Reach Level 25.',
    icon: '🏆',
    rarity: 'Epic',
    category: 'levels',
    condition: { type: 'level', threshold: 25 },
  },
  // Streak Milestones
  {
    badgeId: 'streak_3',
    name: 'Consistent Adventurer',
    description: 'Maintain a 3-day streak.',
    icon: '🔥',
    rarity: 'Common',
    category: 'streaks',
    condition: { type: 'streakCount', threshold: 3 },
  },
  {
    badgeId: 'streak_7',
    name: 'Flame Keeper',
    description: 'Maintain a 7-day streak.',
    icon: '🔥',
    rarity: 'Rare',
    category: 'streaks',
    condition: { type: 'streakCount', threshold: 7 },
  },
  {
    badgeId: 'streak_30',
    name: 'Undying Flame',
    description: 'Maintain a 30-day streak.',
    icon: '🌟',
    rarity: 'Epic',
    category: 'streaks',
    condition: { type: 'streakCount', threshold: 30 },
  },
  // Economy
  {
    badgeId: 'gold_hoarder',
    name: 'Gold Hoarder',
    description: 'Accumulate 500 gold.',
    icon: '💰',
    rarity: 'Rare',
    category: 'economy',
    condition: { type: 'gold', threshold: 500 },
  },
  {
    badgeId: 'big_spender',
    name: 'Big Spender',
    description: 'Spend 500 gold total in the shop.',
    icon: '🛒',
    rarity: 'Rare',
    category: 'economy',
    condition: { type: 'totalGoldSpent', threshold: 500 },
  },
  // Character Attributes
  {
    badgeId: 'strength_10',
    name: 'Iron Fist',
    description: 'Reach 10 Strength.',
    icon: '💪',
    rarity: 'Rare',
    category: 'attributes',
    condition: { type: 'strength', threshold: 10 },
  },
  {
    badgeId: 'intelligence_10',
    name: 'Arcane Scholar',
    description: 'Reach 10 Intelligence.',
    icon: '🧠',
    rarity: 'Rare',
    category: 'attributes',
    condition: { type: 'intelligence', threshold: 10 },
  },
  {
    badgeId: 'endurance_10',
    name: 'Tireless Sentinel',
    description: 'Reach 10 Endurance.',
    icon: '🏃',
    rarity: 'Rare',
    category: 'attributes',
    condition: { type: 'endurance', threshold: 10 },
  },
  // Verification Specialization
  {
    badgeId: 'deep_focus',
    name: 'Deep Focus Adept',
    description: 'Complete 5 Timed quests.',
    icon: '⏱️',
    rarity: 'Rare',
    category: 'quests',
    condition: { type: 'timedQuestsCompleted', threshold: 5 },
  },
  {
    badgeId: 'scholar',
    name: 'Verified Scholar',
    description: 'Complete 5 Verified quests.',
    icon: '📜',
    rarity: 'Rare',
    category: 'quests',
    condition: { type: 'verifiedQuestsCompleted', threshold: 5 },
  },
];

/**
 * Evaluates all badge conditions and returns newly earned badges.
 * @param {Object} userStats - The user's current stats after updates
 * @param {string[]} existingBadgeIds - Array of badge IDs already earned
 * @returns {Object[]} Array of newly awarded badge definitions
 */
export function checkAndAwardBadges(userStats, existingBadgeIds = []) {
  const newBadges = [];

  for (const badge of BADGE_REGISTRY) {
    // Skip already earned badges
    if (existingBadgeIds.includes(badge.badgeId)) continue;

    const { type, threshold } = badge.condition;
    const userValue = userStats[type];

    if (userValue !== undefined && userValue >= threshold) {
      newBadges.push(badge);
    }
  }

  return newBadges;
}

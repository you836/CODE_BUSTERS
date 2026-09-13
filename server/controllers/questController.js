import {
  findQuestsByUser,
  findQuestById,
  createQuest as dbCreateQuest,
  updateQuest as dbUpdateQuest,
  claimQuest,
  deleteQuest as dbDeleteQuest,
  findUserById,
  updateUser,
  getEquippedBonuses,
  findInventoryItemByItemId,
  consumeInventoryItem,
} from '../services/dbAdapter.js';

import {
  DIFFICULTY_REWARDS,
  STAT_REWARDS,
  CATEGORY_STAT_MAP,
  calculateLevelProgression,
  updateStreak,
  getStreakMultiplier,
  getStreakMilestoneReward,
} from '../services/xpService.js';

import { validateQuestCompletion } from '../services/verificationService.js';
import { checkAndAwardBadges } from '../services/badgeService.js';

/**
 * @desc    Get all quests for authenticated adventurer
 * @route   GET /api/quests
 * @access  Private
 */
export async function getQuests(req, res) {
  try {
    const quests = await findQuestsByUser(req.user._id);
    res.json(quests);
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({ message: 'Failed to retrieve guild quests.' });
  }
}

/**
 * @desc    Create a new quest
 *          Server-Authoritative: Rewards are derived strictly from difficulty tier.
 * @route   POST /api/quests
 * @access  Private
 */
export async function createQuest(req, res) {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      questType,
      verificationType,
      minDurationMinutes,
      proofRequired,
      dueDate,
      isAIGenerated,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Every quest needs a title, Adventurer!' });
    }

    const questDifficulty = difficulty && DIFFICULTY_REWARDS[difficulty] ? difficulty : 'Easy';
    const rewards = DIFFICULTY_REWARDS[questDifficulty];

    const vType = ['Casual', 'Timed', 'Verified'].includes(verificationType)
      ? verificationType
      : 'Casual';

    const duration = vType === 'Timed'
      ? Math.max(1, Number(minDurationMinutes) || 25)
      : 0;

    const questCategory = category || 'Study';
    const statType = CATEGORY_STAT_MAP[questCategory] || null;

    const newQuest = await dbCreateQuest({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: questCategory,
      difficulty: questDifficulty,
      questType: questType || 'Daily',
      verificationType: vType,
      minDurationMinutes: duration,
      startedAt: null,
      proofRequired: proofRequired ? proofRequired.trim() : '',
      proofSubmission: null,
      proofSubmittedAt: null,
      xpReward: rewards.xp,
      goldReward: rewards.gold,
      status: 'Pending',
      dueDate: dueDate ? new Date(dueDate) : null,
      isAIGenerated: Boolean(isAIGenerated),
      statType,
    });

    res.status(201).json(newQuest);
  } catch (error) {
    console.error('Error creating quest:', error);
    res.status(500).json({ message: 'Failed to post quest to the board.' });
  }
}

/**
 * @desc    Start a Timed Quest
 *          Records the server-side startedAt timestamp.
 * @route   POST /api/quests/:id/start
 * @access  Private
 */
export async function startTimedQuest(req, res) {
  try {
    const quest = await findQuestById(req.params.id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found.' });
    }

    // Ownership check
    if (quest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this quest.' });
    }

    if (quest.status === 'Completed') {
      return res.status(400).json({ message: 'This quest has already been completed!' });
    }

    if (quest.verificationType !== 'Timed') {
      return res.status(400).json({ message: 'Only Timed quests require a focus timer.' });
    }

    // If already in progress and startedAt exists, return current quest to resume timer
    if (quest.status === 'InProgress' && quest.startedAt) {
      return res.json({
        message: 'Focus session already in progress.',
        quest,
      });
    }

    const updated = await dbUpdateQuest(quest._id, {
      status: 'InProgress',
      startedAt: new Date(),
    });

    res.json({
      message: `Focus timer started for ${quest.minDurationMinutes} minutes. Stay focused!`,
      quest: updated,
    });
  } catch (error) {
    console.error('Error starting timed quest:', error);
    res.status(500).json({ message: 'Failed to start timed quest.' });
  }
}

/**
 * @desc    Reset a Timed Quest Focus Session
 * @route   POST /api/quests/:id/reset-timer
 * @access  Private
 */
export async function resetTimedQuest(req, res) {
  try {
    const quest = await findQuestById(req.params.id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found.' });
    }

    // Ownership check
    if (quest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this quest.' });
    }

    if (quest.status === 'Completed') {
      return res.status(400).json({ message: 'Completed quests cannot be reset.' });
    }

    const updated = await dbUpdateQuest(quest._id, {
      status: 'Pending',
      startedAt: null,
    });

    res.json({
      message: 'Focus timer reset successfully.',
      quest: updated,
    });
  } catch (error) {
    console.error('Error resetting timed quest:', error);
    res.status(500).json({ message: 'Failed to reset focus timer.' });
  }
}

/**
 * @desc    Submit Proof / Reflection for a Verified Quest
 * @route   POST /api/quests/:id/verify
 * @access  Private
 */
export async function submitProof(req, res) {
  try {
    const { proof } = req.body;

    if (!proof || proof.trim().length < 5) {
      return res.status(400).json({
        message: 'Please provide meaningful proof or reflection (at least 5 characters).',
      });
    }

    const quest = await findQuestById(req.params.id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found.' });
    }

    // Ownership check
    if (quest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this quest.' });
    }

    if (quest.status === 'Completed') {
      return res.status(400).json({ message: 'This quest has already been completed.' });
    }

    if (quest.verificationType !== 'Verified') {
      return res.status(400).json({ message: 'This quest does not require proof submission.' });
    }

    const updated = await dbUpdateQuest(quest._id, {
      proofSubmission: proof.trim(),
      proofSubmittedAt: new Date(),
      status: 'InProgress',
    });

    res.json({
      message: 'Evidence submitted! You may now claim your reward.',
      quest: updated,
    });
  } catch (error) {
    console.error('Error submitting proof:', error);
    res.status(500).json({ message: 'Failed to record proof submission.' });
  }
}

/**
 * @desc    Update a quest (Only safe editable fields)
 * @route   PUT /api/quests/:id
 * @access  Private
 */
export async function updateQuest(req, res) {
  try {
    const quest = await findQuestById(req.params.id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found.' });
    }

    // Ownership check
    if (quest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You cannot edit another hero’s quest.' });
    }

    if (quest.status === 'Completed') {
      return res.status(400).json({ message: 'Completed quests cannot be modified.' });
    }

    // Whitelist only safe user-editable fields
    const updates = {};
    if (req.body.title && req.body.title.trim()) updates.title = req.body.title.trim();
    if (req.body.description !== undefined) updates.description = req.body.description.trim();
    if (req.body.category) updates.category = req.body.category;
    if (req.body.dueDate !== undefined) updates.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    
    // If difficulty is updated, server recalculates authoritative rewards
    if (req.body.difficulty && DIFFICULTY_REWARDS[req.body.difficulty]) {
      if (quest.status === 'InProgress') {
        return res.status(400).json({ message: 'An active quest cannot change difficulty mid-run.' });
      }
      updates.difficulty = req.body.difficulty;
      updates.xpReward = DIFFICULTY_REWARDS[req.body.difficulty].xp;
      updates.goldReward = DIFFICULTY_REWARDS[req.body.difficulty].gold;
    }

    const updated = await dbUpdateQuest(req.params.id, updates);
    res.json(updated);
  } catch (error) {
    console.error('Error updating quest:', error);
    res.status(500).json({ message: 'Failed to update quest.' });
  }
}

/**
 * @desc    Delete/Abandon a quest
 * @route   DELETE /api/quests/:id
 * @access  Private
 */
export async function deleteQuest(req, res) {
  try {
    const quest = await findQuestById(req.params.id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found.' });
    }

    // Ownership check
    if (quest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You cannot abandon another hero’s quest.' });
    }

    await dbDeleteQuest(req.params.id);
    res.json({ message: 'Quest removed from the guild board.' });
  } catch (error) {
    console.error('Error deleting quest:', error);
    res.status(500).json({ message: 'Failed to delete quest.' });
  }
}

/**
 * @desc    CORE GAME LOOP: Complete a quest & claim XP / Gold / Level-Up
 *          Strict Server-Authoritative Anti-Cheat:
 *          - Enforces user ownership
 *          - Prevents duplicate completion / double payouts
 *          - Validates verification tier (Casual, Timed, Verified) using server timestamps
 *          - Calculates XP/Gold strictly from backend tables
 * @route   PATCH /api/quests/:id/complete
 * @access  Private
 */
export async function completeQuest(req, res) {
  try {
    const quest = await findQuestById(req.params.id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found.' });
    }

    if (quest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this quest.' });
    }

    const verification = validateQuestCompletion(quest);
    if (!verification.isValid) {
      return res.status(400).json({ message: verification.message });
    }

    const user = await findUserById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Adventurer profile not found.' });
    }

    // Claim the quest with an atomic state transition. This is the key
    // double-payout protection: concurrent requests cannot both claim it.
    const completedQuest = await claimQuest(quest._id);
    if (!completedQuest) {
      return res.status(409).json({ message: 'This quest has already been conquered and rewards claimed!' });
    }

    // Check for Elixir of Time Freeze in inventory
    const ELIXIR_ITEM_ID = 'item_elixir_freeze';
    const hasElixir = await findInventoryItemByItemId(user._id, ELIXIR_ITEM_ID);
    const { newStreak, freezeConsumed } = updateStreak(
      user.lastActiveDate,
      user.streakCount,
      Boolean(hasElixir)
    );

    // Consume the elixir if it was used to save the streak
    if (freezeConsumed) {
      await consumeInventoryItem(user._id, ELIXIR_ITEM_ID);
    }

    // Get equipped item bonuses for XP multiplier
    const equippedBonuses = await getEquippedBonuses(user._id);

    const streakMultiplier = getStreakMultiplier(newStreak);
    const baseRewards = DIFFICULTY_REWARDS[quest.difficulty] || DIFFICULTY_REWARDS.Easy;
    const earnedXP = Math.round(baseRewards.xp * streakMultiplier * equippedBonuses.xpMultiplier);
    const earnedGold = baseRewards.gold;

    const progression = calculateLevelProgression(
      user.level || 1,
      user.currentXP || 0,
      user.maxXP || 100,
      earnedXP
    );

    // Character Attribute progression
    const statType = quest.statType || CATEGORY_STAT_MAP[quest.category] || null;
    const statGain = statType ? (STAT_REWARDS[quest.difficulty] || 1) : 0;

    // Quest completion tracking counters
    const totalQuestsCompleted = (user.totalQuestsCompleted || 0) + 1;
    const timedQuestsCompleted = (user.timedQuestsCompleted || 0) +
      (quest.verificationType === 'Timed' ? 1 : 0);
    const verifiedQuestsCompleted = (user.verifiedQuestsCompleted || 0) +
      (quest.verificationType === 'Verified' ? 1 : 0);

    // Evaluate streak milestone bounty
    const streakMilestone = getStreakMilestoneReward(user.streakCount, newStreak);
    const streakBonusGold = streakMilestone ? streakMilestone.bonusGold : 0;

    const finalGold = (user.gold || 0) + earnedGold + progression.bonusGold + streakBonusGold;

    // Build user updates
    const userUpdates = {
      level: progression.newLevel,
      currentXP: progression.newXP,
      maxXP: progression.newMaxXP,
      gold: finalGold,
      streakCount: newStreak,
      lastActiveDate: new Date(),
      totalQuestsCompleted,
      timedQuestsCompleted,
      verifiedQuestsCompleted,
    };

    // Apply stat gain
    if (statType && statGain > 0) {
      userUpdates[statType] = (user[statType] || 0) + statGain;
    }

    const updatedUser = await updateUser(user._id, userUpdates);

    if (!updatedUser) {
      return res.status(500).json({ message: 'Quest was claimed, but adventurer rewards could not be saved.' });
    }

    // Evaluate badge achievements
    const existingBadgeIds = (updatedUser.badges || []).map((b) => b.badgeId);
    const badgeContext = {
      totalQuestsCompleted: updatedUser.totalQuestsCompleted || 0,
      level: updatedUser.level || 1,
      streakCount: updatedUser.streakCount || 0,
      gold: updatedUser.gold || 0,
      totalGoldSpent: updatedUser.totalGoldSpent || 0,
      strength: updatedUser.strength || 0,
      intelligence: updatedUser.intelligence || 0,
      endurance: updatedUser.endurance || 0,
      timedQuestsCompleted: updatedUser.timedQuestsCompleted || 0,
      verifiedQuestsCompleted: updatedUser.verifiedQuestsCompleted || 0,
    };
    const newBadges = checkAndAwardBadges(badgeContext, existingBadgeIds);

    // Persist newly awarded badges
    if (newBadges.length > 0) {
      const badgeEntries = newBadges.map((b) => ({ badgeId: b.badgeId, awardedAt: new Date() }));
      await updateUser(user._id, {
        badges: [...(updatedUser.badges || []), ...badgeEntries],
      });
    }

    res.json({
      success: true,
      message: progression.leveledUp ? '🎉 LEVEL UP! Victory is yours!' : '⚔️ Quest completed!',
      quest: completedQuest,
      rewards: {
        earnedXP,
        earnedGold,
        bonusGold: progression.bonusGold,
        streakMultiplier,
        streakBonusGold,
        equippedXpMultiplier: equippedBonuses.xpMultiplier,
        statType,
        statGain,
      },
      streakMilestone: streakMilestone ? {
        name: streakMilestone.name,
        minStreak: streakMilestone.minStreak,
        icon: streakMilestone.icon,
        bonusGold: streakMilestone.bonusGold,
      } : null,
      progression: {
        leveledUp: progression.leveledUp,
        oldLevel: user.level,
        newLevel: progression.newLevel,
        levelsGained: progression.levelsGained,
        currentXP: progression.newXP,
        maxXP: progression.newMaxXP,
      },
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        level: updatedUser.level,
        currentXP: updatedUser.currentXP,
        maxXP: updatedUser.maxXP,
        gold: updatedUser.gold,
        streakCount: updatedUser.streakCount,
        lastActiveDate: updatedUser.lastActiveDate,
        strength: updatedUser.strength || 0,
        intelligence: updatedUser.intelligence || 0,
        endurance: updatedUser.endurance || 0,
      },
      streakFreezeUsed: freezeConsumed,
      newBadges: newBadges.map((b) => ({
        badgeId: b.badgeId,
        name: b.name,
        description: b.description,
        icon: b.icon,
        rarity: b.rarity,
      })),
    });
  } catch (error) {
    console.error('Error completing quest:', error);
    res.status(500).json({ message: 'Failed to finalize quest victory.' });
  }
}


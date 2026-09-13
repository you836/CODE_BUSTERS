import { generateQuestChain } from '../services/aiService.js';
import { createQuest as dbCreateQuest } from '../services/dbAdapter.js';
import { DIFFICULTY_REWARDS, CATEGORY_STAT_MAP } from '../services/xpService.js';

/**
 * @desc    Generate RPG Quest Chain using AI Guildmaster
 * @route   POST /api/ai/generate-quest
 * @access  Private
 */
export async function handleGenerateQuests(req, res) {
  try {
    const { goal } = req.body;

    if (!goal || !goal.trim()) {
      return res.status(400).json({ message: 'State your ambition to the Guildmaster, Adventurer!' });
    }

    const questChain = await generateQuestChain(goal.trim());
    res.json({
      success: true,
      goal,
      questChain,
    });
  } catch (error) {
    console.error('AI Quest Generation Error:', error);
    res.status(500).json({ message: 'The Guildmaster was temporarily lost in the arcane mists.' });
  }
}

/**
 * @desc    Batch accept quests from the AI Guildmaster into the user's quest board
 * @route   POST /api/ai/accept-quests
 * @access  Private
 */
export async function handleAcceptQuests(req, res) {
  try {
    const { quests } = req.body;

    if (!Array.isArray(quests) || quests.length === 0) {
      return res.status(400).json({ message: 'No quests to accept.' });
    }

    const createdQuests = [];
    for (const q of quests) {
      const difficulty = DIFFICULTY_REWARDS[q.difficulty] ? q.difficulty : 'Medium';
      const rewards = DIFFICULTY_REWARDS[difficulty];
      const verificationType = ['Casual', 'Timed', 'Verified'].includes(q.verificationType)
        ? q.verificationType
        : 'Casual';
      const category = q.category || 'Study';
      const statType = q.statType || CATEGORY_STAT_MAP[category] || 'intelligence';

      const created = await dbCreateQuest({
        userId: req.user._id,
        title: typeof q.title === 'string' ? q.title.trim() : 'Guildmaster Quest',
        description: typeof q.description === 'string' ? q.description.trim() : '',
        category,
        difficulty,
        statType,
        questType: q.questType || 'MainQuest',
        verificationType,
        minDurationMinutes: verificationType === 'Timed' ? Math.max(1, Number(q.minDurationMinutes) || 25) : 0,
        proofRequired: verificationType === 'Verified' && typeof q.proofRequired === 'string' ? q.proofRequired.trim() : '',
        xpReward: rewards.xp,
        goldReward: rewards.gold,
        status: 'Pending',
        isAIGenerated: true,
      });
      createdQuests.push(created);
    }

    res.status(201).json({
      success: true,
      message: `⚔️ ${createdQuests.length} quests posted to your guild board!`,
      quests: createdQuests,
    });
  } catch (error) {
    console.error('Error accepting AI quests:', error);
    res.status(500).json({ message: 'Failed to accept quest chain.' });
  }
}

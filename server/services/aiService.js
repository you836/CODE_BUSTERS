/**
 * AI Guildmaster Service
 * Decomposes high-level real-world goals into multi-stage RPG quest chains.
 * Uses Google Gemini API if GEMINI_API_KEY is configured,
 * with a high-quality procedural RPG generator fallback for offline / demo mode.
 */

import { DIFFICULTY_REWARDS, CATEGORY_STAT_MAP } from './xpService.js';

export async function generateQuestChain(userGoal) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 5 && !apiKey.includes('your_gemini')) {
    try {
      const quests = await callGeminiForQuests(userGoal, apiKey.trim());
      if (Array.isArray(quests) && quests.length > 0) {
        return quests;
      }
    } catch (err) {
      console.warn('Gemini API call failed, using Guildmaster procedural generator:', err.message);
    }
  }

  // Fallback: Smart Procedural RPG Quest Chain Generator
  return generateProceduralQuestChain(userGoal);
}

/**
 * Calls Google Gemini API using native fetch with robust JSON sanitization
 */
async function callGeminiForQuests(userGoal, apiKey) {
  const systemPrompt = `You are the legendary Guildmaster of a fantasy RPG productivity realm called "Life RPG". 
A hero has approached your guild hall with a real-life ambition: "${userGoal}".
Break this goal down into an epic, highly actionable 3 to 4 stage RPG Quest Chain with escalating difficulty.

Return ONLY a valid JSON array of objects with these exact keys:
[
  {
    "title": "Short, punchy fantasy-themed quest title",
    "description": "Engaging RPG narrative lore connecting their real task to a heroic adventure",
    "category": "Study" | "Fitness" | "Work" | "Chores" | "Health" | "Creative",
    "difficulty": "Easy" | "Medium" | "Hard" | "Epic",
    "verificationType": "Casual" | "Timed" | "Verified",
    "minDurationMinutes": 0, // set to 15-45 if verificationType is "Timed", else 0
    "proofRequired": "Brief instruction of what evidence to write if verificationType is Verified, else empty string",
    "questType": "MainQuest"
  }
]`;

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  let textOutput = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOutput) break;
      }
    } catch (modelErr) {
      console.warn(`Model ${model} attempt failed:`, modelErr.message);
    }
  }

  if (!textOutput) throw new Error('No response received from Gemini models');

  // Sanitize potential markdown backticks
  let cleanJson = textOutput.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsedQuests = JSON.parse(cleanJson);
  if (!Array.isArray(parsedQuests)) throw new Error('Parsed Gemini output is not an array');

  // Normalize and attach authoritative rewards & stats
  return parsedQuests.map((q, idx) => {
    const validDifficulty = ['Easy', 'Medium', 'Hard', 'Epic'].includes(q.difficulty)
      ? q.difficulty
      : idx === 0 ? 'Easy' : idx === 1 ? 'Medium' : 'Hard';

    const validCategory = ['Study', 'Fitness', 'Work', 'Chores', 'Health', 'Creative'].includes(q.category)
      ? q.category
      : 'Study';

    const vType = ['Casual', 'Timed', 'Verified'].includes(q.verificationType)
      ? q.verificationType
      : idx === 1 ? 'Timed' : idx === 2 ? 'Verified' : 'Casual';

    const rewards = DIFFICULTY_REWARDS[validDifficulty] || DIFFICULTY_REWARDS.Medium;
    const statType = CATEGORY_STAT_MAP[validCategory] || 'intelligence';

    return {
      title: q.title || `Stage ${idx + 1}: ${userGoal.slice(0, 25)}`,
      description: q.description || `Advance toward your goal of "${userGoal}".`,
      category: validCategory,
      difficulty: validDifficulty,
      statType,
      questType: 'MainQuest',
      verificationType: vType,
      minDurationMinutes: vType === 'Timed' ? Math.max(1, Number(q.minDurationMinutes) || 25) : 0,
      proofRequired: vType === 'Verified' ? (q.proofRequired || 'Document key insights or evidence of completion.') : '',
      xpReward: rewards.xp,
      goldReward: rewards.gold,
      isAIGenerated: true,
    };
  });
}

/**
 * High-immersion procedural RPG quest chain generator
 */
function generateProceduralQuestChain(userGoal) {
  const goalClean = (userGoal || '').trim();
  const goalLower = goalClean.toLowerCase();

  let category = 'Study';
  let statType = 'intelligence';

  if (goalLower.includes('workout') || goalLower.includes('gym') || goalLower.includes('run') || goalLower.includes('exercise') || goalLower.includes('pushup') || goalLower.includes('cardio')) {
    category = 'Fitness';
    statType = 'strength';
  } else if (goalLower.includes('clean') || goalLower.includes('room') || goalLower.includes('laundry') || goalLower.includes('dish') || goalLower.includes('organize') || goalLower.includes('trash')) {
    category = 'Chores';
    statType = 'endurance';
  } else if (goalLower.includes('code') || goalLower.includes('project') || goalLower.includes('build') || goalLower.includes('hackathon') || goalLower.includes('bug') || goalLower.includes('deploy') || goalLower.includes('app')) {
    category = 'Work';
    statType = 'intelligence';
  } else if (goalLower.includes('draw') || goalLower.includes('write') || goalLower.includes('music') || goalLower.includes('paint') || goalLower.includes('design') || goalLower.includes('video')) {
    category = 'Creative';
    statType = 'endurance';
  } else if (goalLower.includes('meditat') || goalLower.includes('sleep') || goalLower.includes('water') || goalLower.includes('walk') || goalLower.includes('diet')) {
    category = 'Health';
    statType = 'strength';
  }

  const shortGoal = goalClean.length > 35 ? goalClean.slice(0, 32) + '...' : goalClean;

  return [
    {
      title: `Phase I: Scout & Prepare — ${shortGoal}`,
      description: `Survey the terrain, gather your instruments, and eliminate distractions. Clear the launchpad for "${shortGoal}".`,
      category,
      difficulty: 'Easy',
      statType,
      questType: 'MainQuest',
      verificationType: 'Casual',
      minDurationMinutes: 0,
      proofRequired: '',
      xpReward: DIFFICULTY_REWARDS.Easy.xp,
      goldReward: DIFFICULTY_REWARDS.Easy.gold,
      isAIGenerated: true,
    },
    {
      title: `Phase II: The Crucible of Deep Focus`,
      description: `Channel your willpower into an unbroken 25-minute focus session directly executing "${shortGoal}". Keep the flame burning!`,
      category,
      difficulty: 'Medium',
      statType,
      questType: 'MainQuest',
      verificationType: 'Timed',
      minDurationMinutes: 25,
      proofRequired: '',
      xpReward: DIFFICULTY_REWARDS.Medium.xp,
      goldReward: DIFFICULTY_REWARDS.Medium.gold,
      isAIGenerated: true,
    },
    {
      title: `Phase III: Slaying the Boss & Final Reflection`,
      description: `Deliver the final outcome of "${shortGoal}". Record your triumph and key takeaways in the guild victory archives.`,
      category,
      difficulty: 'Hard',
      statType,
      questType: 'MainQuest',
      verificationType: 'Verified',
      minDurationMinutes: 0,
      proofRequired: 'Write a brief summary of what you achieved and what you learned.',
      xpReward: DIFFICULTY_REWARDS.Hard.xp,
      goldReward: DIFFICULTY_REWARDS.Hard.gold,
      isAIGenerated: true,
    },
  ];
}


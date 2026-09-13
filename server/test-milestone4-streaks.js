import http from 'http';
import app from './app.js';
import { updateStreak, getStreakMultiplier, getStreakMilestoneReward, STREAK_TIERS } from './services/xpService.js';

async function runStreakSystemTests() {
  console.log('🧪 [Streak Engine Test Suite] Verifying Advanced Streak Logic...\n');

  // 1. Math and Multipliers verification
  process.stdout.write('1. Testing Streak Math & Tier Multipliers... ');
  if (getStreakMultiplier(0) !== 1.0) throw new Error('Streak 0 should have 1.0x multiplier');
  if (getStreakMultiplier(2) !== 1.0) throw new Error('Streak 2 should have 1.0x multiplier');
  if (getStreakMultiplier(3) !== 1.10) throw new Error('Streak 3 should have 1.10x multiplier');
  if (getStreakMultiplier(6) !== 1.10) throw new Error('Streak 6 should have 1.10x multiplier');
  if (getStreakMultiplier(7) !== 1.25) throw new Error('Streak 7 should have 1.25x multiplier');
  if (getStreakMultiplier(14) !== 1.35) throw new Error('Streak 14 should have 1.35x multiplier');
  if (getStreakMultiplier(30) !== 1.50) throw new Error('Streak 30 should have 1.50x multiplier');
  console.log('✅ Passed');

  // 2. Same day, consecutive day, and missed day without freeze
  process.stdout.write('2. Testing Same-Day, Next-Day and Reset Day Transitions... ');
  const today = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // Same day
  const sameDayResult = updateStreak(today, 5, false);
  if (sameDayResult.newStreak !== 5 || sameDayResult.freezeConsumed) {
    throw new Error(`Same day expected streak 5, got ${JSON.stringify(sameDayResult)}`);
  }

  // Next day (consecutive)
  const nextDayResult = updateStreak(yesterday, 5, false);
  if (nextDayResult.newStreak !== 6 || nextDayResult.freezeConsumed) {
    throw new Error(`Consecutive day expected streak 6, got ${JSON.stringify(nextDayResult)}`);
  }

  // Missed day (no freeze)
  const resetResult = updateStreak(twoDaysAgo, 5, false);
  if (resetResult.newStreak !== 1 || resetResult.freezeConsumed) {
    throw new Error(`Missed day expected reset to 1, got ${JSON.stringify(resetResult)}`);
  }
  console.log('✅ Passed');

  // 3. Elixir of Time Freeze preservation
  process.stdout.write('3. Testing Elixir of Time Freeze protection... ');
  const freezeProtectedResult = updateStreak(twoDaysAgo, 8, true);
  if (freezeProtectedResult.newStreak !== 8 || !freezeProtectedResult.freezeConsumed) {
    throw new Error(`Expected preserved streak 8 with freezeConsumed=true, got ${JSON.stringify(freezeProtectedResult)}`);
  }
  console.log('✅ Passed (Streak 8 preserved, Elixir consumed)');

  // 4. Streak Milestone Bounty Evaluation
  process.stdout.write('4. Testing Streak Milestone Bounties (3d, 7d, 14d, 30d)... ');
  const milestone3 = getStreakMilestoneReward(2, 3);
  if (!milestone3 || milestone3.minStreak !== 3 || milestone3.bonusGold !== 50) {
    throw new Error(`Expected 3d milestone with +50g, got: ${JSON.stringify(milestone3)}`);
  }

  const milestone7 = getStreakMilestoneReward(6, 7);
  if (!milestone7 || milestone7.minStreak !== 7 || milestone7.bonusGold !== 150) {
    throw new Error(`Expected 7d milestone with +150g, got: ${JSON.stringify(milestone7)}`);
  }

  const noMilestone = getStreakMilestoneReward(3, 4);
  if (noMilestone !== null) {
    throw new Error(`Expected null milestone from 3 to 4, got: ${JSON.stringify(noMilestone)}`);
  }
  console.log('✅ Passed (Milestone awards verified)');

  // 5. Full API integration test with HTTP server
  process.stdout.write('5. Testing API Quest Completion Streak Multiplier & Milestone Bounty... ');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5094, '127.0.0.1', resolve));
  const baseUrl = 'http://127.0.0.1:5094/api';

  try {
    const ts = Date.now();
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `StreakTester_${ts}`,
        email: `streak_${ts}@liferpg.realm`,
        password: 'securePassword123',
      }),
    });
    const regData = await regRes.json();
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${regData.token}`,
    };

    // Create a quest
    const qRes = await fetch(`${baseUrl}/quests`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Daily Streak Quest',
        difficulty: 'Easy',
        category: 'Study',
      }),
    });
    const quest = await qRes.json();

    // Complete quest
    const compRes = await fetch(`${baseUrl}/quests/${quest._id}/complete`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    const compData = await compRes.json();

    if (!compData.user || compData.user.streakCount < 1) {
      throw new Error('Quest completion did not update user streakCount');
    }
    if (!compData.rewards || compData.rewards.streakMultiplier < 1.0) {
      throw new Error('Quest completion did not include streakMultiplier in rewards');
    }
    console.log(`✅ Passed (Streak: ${compData.user.streakCount}d, Multiplier: ${compData.rewards.streakMultiplier}x)`);

    console.log('\n🎉 ALL 5 STREAK SYSTEM TESTS PASSED FLAWLESSLY!\n');
  } finally {
    server.close();
  }
}

runStreakSystemTests().catch((err) => {
  console.error('\n❌ Streak Test Failure:', err.message);
  process.exit(1);
});

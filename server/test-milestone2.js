/**
 * Life RPG — Milestone 2 Security & Verification Test Suite
 *
 * Covers the actual game-loop trust boundary:
 * - verification tiers
 * - server-authoritative rewards
 * - quest ownership
 * - duplicate completion protection
 * - timed server timestamps
 * - verified proof requirement
 * - AI reward tampering protection
 */
import http from 'http';
import app from './app.js';
import { createQuest, updateQuest, findQuestById } from './services/dbAdapter.js';
import { DIFFICULTY_REWARDS } from './services/xpService.js';

async function run() {
  console.log('🧪 [Milestone 2 Test Suite] Starting Verification...\n');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5092, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:5092/api';

  const json = (body) => JSON.stringify(body);
  const headers = (token) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  try {
    const suffix = Date.now();
    const register = async (name) => {
      const res = await fetch(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json({ username: `${name}${suffix}`, email: `${name}${suffix}@liferpg.realm`, password: 'securePassword123' }),
      });
      if (res.status !== 201) throw new Error(`Registration failed: ${res.status}`);
      return res.json();
    };

    const hero = await register('MilestoneTwoHero');
    const other = await register('OtherHero');

    // 1. Server-authoritative reward calculation
    process.stdout.write('1. Server ignores client reward values... ');
    const createRes = await fetch(`${base}/quests`, {
      method: 'POST', headers: headers(hero.token),
      body: json({ title: 'Tamper Test', difficulty: 'Hard', xpReward: 999999, goldReward: 999999, verificationType: 'Casual' }),
    });
    if (createRes.status !== 201) throw new Error(`Quest create failed: ${createRes.status}`);
    const tamperQuest = await createRes.json();
    if (tamperQuest.xpReward !== DIFFICULTY_REWARDS.Hard.xp || tamperQuest.goldReward !== DIFFICULTY_REWARDS.Hard.gold) {
      throw new Error('Client reward values were accepted');
    }
    console.log('✅ Passed');

    // 2. Ownership protection
    process.stdout.write('2. Quest ownership protection... ');
    const forbidden = await fetch(`${base}/quests/${tamperQuest._id}/complete`, { method: 'PATCH', headers: headers(other.token) });
    if (forbidden.status !== 403) throw new Error(`Expected 403, got ${forbidden.status}`);
    console.log('✅ Passed');

    // 3. Verified proof requirement
    process.stdout.write('3. Verified quest requires proof... ');
    const verified = await createQuest({
      userId: hero._id, title: 'Proof Quest', description: '', category: 'Study', difficulty: 'Easy',
      questType: 'Daily', verificationType: 'Verified', minDurationMinutes: 0, proofRequired: 'Write a takeaway',
      proofSubmission: null, proofSubmittedAt: null, xpReward: 25, goldReward: 10, status: 'Pending',
      isAIGenerated: false,
    });
    const noProof = await fetch(`${base}/quests/${verified._id}/complete`, { method: 'PATCH', headers: headers(hero.token) });
    if (noProof.status !== 400) throw new Error(`Expected 400, got ${noProof.status}`);
    console.log('✅ Passed');

    // 4. Timed quest uses server-side startedAt
    process.stdout.write('4. Timed quest uses server timestamp... ');
    const timed = await createQuest({
      userId: hero._id, title: 'Timed Quest', description: '', category: 'Work', difficulty: 'Easy',
      questType: 'Daily', verificationType: 'Timed', minDurationMinutes: 1, startedAt: null,
      proofRequired: '', proofSubmission: null, proofSubmittedAt: null, xpReward: 25, goldReward: 10,
      status: 'Pending', isAIGenerated: false,
    });
    const beforeStart = await fetch(`${base}/quests/${timed._id}/complete`, { method: 'PATCH', headers: headers(hero.token) });
    if (beforeStart.status !== 400) throw new Error(`Expected 400 before start, got ${beforeStart.status}`);
    await updateQuest(timed._id, { status: 'InProgress', startedAt: new Date(Date.now() - 61_000) });
    const timedComplete = await fetch(`${base}/quests/${timed._id}/complete`, { method: 'PATCH', headers: headers(hero.token) });
    if (timedComplete.status !== 200) throw new Error(`Timed completion failed: ${timedComplete.status}`);
    console.log('✅ Passed');

    // 5. Proof submission then completion
    process.stdout.write('5. Proof submission unlocks verified completion... ');
    const proofRes = await fetch(`${base}/quests/${verified._id}/verify`, {
      method: 'POST', headers: headers(hero.token), body: json({ proof: 'I read the chapter and recorded two key takeaways.' }),
    });
    if (proofRes.status !== 200) throw new Error(`Proof submission failed: ${proofRes.status}`);
    const proofComplete = await fetch(`${base}/quests/${verified._id}/complete`, { method: 'PATCH', headers: headers(hero.token) });
    if (proofComplete.status !== 200) throw new Error(`Verified completion failed: ${proofComplete.status}`);
    console.log('✅ Passed');

    // 6. Duplicate completion is rejected after the atomic claim
    process.stdout.write('6. Duplicate completion protection... ');
    const duplicate = await fetch(`${base}/quests/${tamperQuest._id}/complete`, { method: 'PATCH', headers: headers(hero.token) });
    if (duplicate.status !== 200) throw new Error(`First completion failed: ${duplicate.status}`);
    const duplicateAgain = await fetch(`${base}/quests/${tamperQuest._id}/complete`, { method: 'PATCH', headers: headers(hero.token) });
    if (![400, 409].includes(duplicateAgain.status)) throw new Error(`Expected duplicate rejection, got ${duplicateAgain.status}`);
    const persisted = await findQuestById(tamperQuest._id);
    if (persisted.status !== 'Completed') throw new Error('Completed quest did not persist');
    console.log('✅ Passed');

    // 7. AI accept path cannot inject arbitrary rewards
    process.stdout.write('7. AI quests receive server-calculated rewards... ');
    const aiRes = await fetch(`${base}/ai/accept-quests`, {
      method: 'POST', headers: headers(hero.token),
      body: json({ quests: [{ title: 'AI Reward Tamper', difficulty: 'Epic', xpReward: 1, goldReward: 1 }] }),
    });
    if (aiRes.status !== 201) throw new Error(`AI accept failed: ${aiRes.status}`);
    const aiData = await aiRes.json();
    if (aiData.quests[0].xpReward !== DIFFICULTY_REWARDS.Epic.xp || aiData.quests[0].goldReward !== DIFFICULTY_REWARDS.Epic.gold) {
      throw new Error('AI payload injected non-authoritative rewards');
    }
    console.log('✅ Passed');

    console.log('\n🎉 ALL 7 MILESTONE 2 SECURITY TESTS PASSED!\n');
    server.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Milestone 2 Test Failure:', error.message);
    server.close();
    process.exit(1);
  }
}

run();

import http from 'http';
import app from './app.js';

async function runTests() {
  console.log('🧪 [Test Suite] Starting Life RPG API Verification...');

  // Start temporary test server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099/api';

  try {
    // 1. Health Check
    console.log('1. Testing /health...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    if (healthData.status !== 'online') throw new Error('Health check failed');
    console.log('   ✅ Health check online:', healthData.realm);

    // 2. Demo Login
    console.log('2. Testing /auth/demo...');
    const demoRes = await fetch(`${baseUrl}/auth/demo`, { method: 'POST' });
    const demoUser = await demoRes.json();
    if (!demoUser.token) throw new Error('Demo login failed to return token');
    console.log(`   ✅ Demo login success: ${demoUser.username} (Lvl ${demoUser.level}, ${demoUser.gold}g)`);
    const token = demoUser.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 3. Create Quest
    console.log('3. Testing POST /quests (Create Quest)...');
    const questRes = await fetch(`${baseUrl}/quests`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Master Graph Algorithms',
        description: 'Solve 3 BFS and DFS traversal problems',
        category: 'Study',
        difficulty: 'Medium',
        questType: 'MainQuest',
      }),
    });
    const createdQuest = await questRes.json();
    if (!createdQuest._id) throw new Error('Failed to create quest');
    console.log(`   ✅ Quest Created: "${createdQuest.title}" (+${createdQuest.xpReward} XP, +${createdQuest.goldReward}g)`);

    // 4. Complete Quest (Core Game Loop)
    console.log('4. Testing PATCH /quests/:id/complete (Core Game Loop)...');
    const completeRes = await fetch(`${baseUrl}/quests/${createdQuest._id}/complete`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    const victoryData = await completeRes.json();
    if (!victoryData.success) throw new Error('Quest completion failed');
    console.log(`   ✅ Victory Claimed! Earned +${victoryData.rewards.earnedXP} XP, +${victoryData.rewards.earnedGold}g. User Level: ${victoryData.user.level}, Gold: ${victoryData.user.gold}g`);

    // 5. Shop Items
    console.log('5. Testing GET /shop/items...');
    const shopRes = await fetch(`${baseUrl}/shop/items`, { headers: authHeaders });
    const items = await shopRes.json();
    if (!Array.isArray(items) || items.length === 0) throw new Error('Shop returned no items');
    console.log(`   ✅ Shop active with ${items.length} items available.`);

    // 6. Buy an item
    const affordableItem = items.find((i) => i.costGold <= victoryData.user.gold) || items[0];
    console.log(`6. Testing POST /shop/buy/${affordableItem._id} ("${affordableItem.name}", cost: ${affordableItem.costGold}g)...`);
    const buyRes = await fetch(`${baseUrl}/shop/buy/${affordableItem._id}`, {
      method: 'POST',
      headers: authHeaders,
    });
    const buyData = await buyRes.json();
    if (!buyData.success) throw new Error(`Failed to purchase item: ${buyData.message}`);
    console.log(`   ✅ Purchase Success: "${buyData.item.name}". Remaining Gold: ${buyData.remainingGold}g`);

    // 7. AI Guildmaster
    console.log('7. Testing POST /ai/generate-quest (AI Guildmaster)...');
    const aiRes = await fetch(`${baseUrl}/ai/generate-quest`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ goal: 'Study for Data Structures Final Exam' }),
    });
    const aiData = await aiRes.json();
    if (!aiData.success || !Array.isArray(aiData.questChain)) throw new Error('AI quest generation failed');
    console.log(`   ✅ AI Guildmaster created ${aiData.questChain.length} quest stages:`);
    aiData.questChain.forEach((q, i) => {
      console.log(`      Stage ${i + 1} [${q.difficulty}]: ${q.title}`);
    });

    console.log('\n🎉 ALL 7 TEST SUITES PASSED FLAWLESSLY!\n');
    server.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    server.close();
    process.exit(1);
  }
}

runTests();

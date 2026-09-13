import http from 'http';
import app from './app.js';
import { BADGE_REGISTRY } from './services/badgeService.js';

async function runMilestone3Tests() {
  console.log('🧪 [Milestone 3 Test Suite] Verifying Advanced RPG Engine Features...\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5093, '127.0.0.1', resolve));
  const baseUrl = 'http://127.0.0.1:5093/api';

  try {
    // Register unique test adventurer
    const ts = Date.now();
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `HeroRPG_${ts}`,
        email: `herorpg_${ts}@liferpg.realm`,
        password: 'securePassword123',
      }),
    });
    const regData = await regRes.json();
    const token = regData.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 1. Create a Fitness Quest (maps to strength)
    process.stdout.write('1. Testing Category-to-Attribute mapping (Fitness -> Strength)... ');
    const questRes = await fetch(`${baseUrl}/quests`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Morning Pushups',
        category: 'Fitness',
        difficulty: 'Medium',
        verificationType: 'Casual',
      }),
    });
    const quest = await questRes.json();
    if (quest.statType !== 'strength') {
      throw new Error(`Expected statType to be 'strength', got '${quest.statType}'`);
    }
    console.log('✅ Passed');

    // 2. Complete quest and verify stat gain + first_quest badge
    process.stdout.write('2. Testing Quest Completion Stat Gain & First Blood Badge... ');
    const compRes = await fetch(`${baseUrl}/quests/${quest._id}/complete`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    const compData = await compRes.json();
    if (!compData.rewards || compData.rewards.statType !== 'strength' || compData.rewards.statGain !== 2) {
      throw new Error(`Expected strength +2 gain, got: ${JSON.stringify(compData.rewards)}`);
    }
    if (compData.user.strength !== 2) {
      throw new Error(`Expected user strength to be 2, got: ${compData.user.strength}`);
    }
    const hasFirstBlood = compData.newBadges.some((b) => b.badgeId === 'first_quest');
    if (!hasFirstBlood) {
      throw new Error('Expected first_quest badge to be awarded on first quest completion');
    }
    console.log('✅ Passed (Strength: +2, Badge: First Blood)');

    // 3. Purchase an item with equipment bonus and equip it
    process.stdout.write('3. Testing Equipment Purchase, Equip & XP Multiplier... ');
    // Buy Iron Broadsword (item_sword_iron, 50g)
    const shopRes = await fetch(`${baseUrl}/shop/items`, { headers: authHeaders });
    const shopItems = await shopRes.json();
    const sword = shopItems.find((i) => i.name === 'Iron Broadsword') || shopItems[0];
    
    const buyRes = await fetch(`${baseUrl}/shop/buy/${sword._id}`, {
      method: 'POST',
      headers: authHeaders,
    });
    const buyData = await buyRes.json();
    if (!buyData.success) throw new Error(`Failed to buy item: ${buyData.message}`);

    // Equip the sword
    const equipRes = await fetch(`${baseUrl}/shop/inventory/equip/${buyData.inventoryItem._id}`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    const equipData = await equipRes.json();
    if (!equipData.inventory || !equipData.inventory.isEquipped) {
      throw new Error('Failed to equip sword');
    }

    // Create and complete another quest to verify equipment XP multiplier
    const quest2Res = await fetch(`${baseUrl}/quests`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Study Codebase',
        category: 'Study',
        difficulty: 'Easy', // base 25 XP
        verificationType: 'Casual',
      }),
    });
    const quest2 = await quest2Res.json();
    const comp2Res = await fetch(`${baseUrl}/quests/${quest2._id}/complete`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    const comp2Data = await comp2Res.json();
    if (comp2Data.rewards.equippedXpMultiplier <= 1.0) {
      throw new Error(`Expected equipped multiplier > 1.0, got: ${comp2Data.rewards.equippedXpMultiplier}`);
    }
    console.log(`✅ Passed (Equipped Multiplier: ${comp2Data.rewards.equippedXpMultiplier}x applied)`);

    // 4. Verify profile /api/auth/me returns attributes and badges
    process.stdout.write('4. Testing /api/auth/me Profile Badges & Stats... ');
    const meRes = await fetch(`${baseUrl}/auth/me`, { headers: authHeaders });
    const meData = await meRes.json();
    if (meData.strength === undefined || meData.intelligence === undefined || !Array.isArray(meData.badges)) {
      throw new Error(`Profile missing attributes or badges: ${JSON.stringify(meData)}`);
    }
    if (!meData.badges.some((b) => b.badgeId === 'first_quest')) {
      throw new Error('Profile missing first_quest badge persistence');
    }
    console.log(`✅ Passed (Badges count: ${meData.badges.length}, Str: ${meData.strength}, Int: ${meData.intelligence})`);

    console.log('\n🎉 ALL 4 ADVANCED RPG ENGINE MILESTONE 3 TESTS PASSED FLAWLESSLY!\n');
  } catch (error) {
    console.error('\n❌ Milestone 3 Test Failure:', error.message);
    process.exit(1);
  } finally {
    server.close();
  }
}

runMilestone3Tests();

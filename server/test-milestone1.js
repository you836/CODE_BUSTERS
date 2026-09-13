/**
 * Life RPG — Milestone 1 Automated Test Suite
 * 
 * Verifies:
 * 1. Health check (/api/health)
 * 2. User registration with default Level 1, 0 XP, 50 Gold
 * 3. Duplicate email rejection (400)
 * 4. Invalid password rejection (401)
 * 5. Valid login returning signed JWT
 * 6. Auth middleware guard on unauthenticated /api/auth/me (401)
 * 7. Auth middleware acceptance on valid Bearer token for /api/auth/me (200)
 * 8. 1-Click Judge Demo starting at Level 1 with valid token and standard seeded quests
 */

import http from 'http';
import app from './app.js';

async function runMilestone1Tests() {
  console.log('🧪 [Milestone 1 Test Suite] Starting Verification...\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5091, '127.0.0.1', resolve));
  const baseUrl = 'http://127.0.0.1:5091/api';

  try {
    // 1. Health check
    process.stdout.write('1. Testing Realm Health (/api/health)... ');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    if (healthData.status !== 'online') throw new Error('Health check returned non-online status');
    console.log('✅ Passed');

    // 2. User Registration
    process.stdout.write('2. Testing User Registration (/api/auth/register)... ');
    const testTimestamp = Date.now();
    const testEmail = `hero_${testTimestamp}@liferpg.realm`;
    const testUsername = `ValiantTester_${testTimestamp}`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        email: testEmail,
        password: 'securePassword123',
      }),
    });
    if (regRes.status !== 201) {
      const err = await regRes.json();
      throw new Error(`Registration failed with status ${regRes.status}: ${JSON.stringify(err)}`);
    }
    const regUser = await regRes.json();
    if (!regUser.token) throw new Error('Registration did not return JWT token');
    if (regUser.level !== 1) throw new Error(`Expected level 1, got ${regUser.level}`);
    if (regUser.currentXP !== 0) throw new Error(`Expected currentXP 0, got ${regUser.currentXP}`);
    if (regUser.gold !== 50) throw new Error(`Expected gold 50, got ${regUser.gold}`);
    if (regUser.password) throw new Error('Security flaw: hashed password leaked in response');
    console.log(`✅ Passed (User: ${regUser.username}, Level: ${regUser.level}, Gold: ${regUser.gold}g)`);

    // 3. Duplicate Email Rejection
    process.stdout.write('3. Testing Duplicate Email Rejection... ');
    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'DuplicateHero',
        email: testEmail,
        password: 'otherPassword456',
      }),
    });
    if (dupRes.status !== 400) throw new Error(`Expected 400 Bad Request for duplicate, got ${dupRes.status}`);
    console.log('✅ Passed (Duplicate correctly blocked with 400)');

    // 4. Invalid Login Password
    process.stdout.write('4. Testing Invalid Password Login... ');
    const invalidLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongPassword999',
      }),
    });
    if (invalidLoginRes.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${invalidLoginRes.status}`);
    console.log('✅ Passed (Invalid login correctly blocked with 401)');

    // 5. Valid Login
    process.stdout.write('5. Testing Valid User Login (/api/auth/login)... ');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securePassword123',
      }),
    });
    if (loginRes.status !== 200) throw new Error(`Expected 200 OK, got ${loginRes.status}`);
    const loginData = await loginRes.json();
    if (!loginData.token) throw new Error('Login response missing JWT token');
    const userToken = loginData.token;
    console.log(`✅ Passed (JWT token issued for ${loginData.username})`);

    // 6. Token Guard on Protected Route (Without Token)
    process.stdout.write('6. Testing Token Guard Without Authorization Header... ');
    const unauthRes = await fetch(`${baseUrl}/auth/me`);
    if (unauthRes.status !== 401) throw new Error(`Expected 401, got ${unauthRes.status}`);
    console.log('✅ Passed (Protected route blocked with 401)');

    // 7. Token Guard on Protected Route (With Token)
    process.stdout.write('7. Testing Protected Profile Fetch (/api/auth/me)... ');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (meRes.status !== 200) throw new Error(`Expected 200, got ${meRes.status}`);
    const meData = await meRes.json();
    if (meData.email !== testEmail) throw new Error('Profile email mismatch');
    console.log(`✅ Passed (Profile authenticated as: ${meData.username})`);

    // 8. 1-Click Judge Demo Validation
    process.stdout.write('8. Testing 1-Click Judge Demo (/api/auth/demo)... ');
    const demoRes = await fetch(`${baseUrl}/auth/demo`, { method: 'POST' });
    if (demoRes.status !== 200) throw new Error(`Demo login failed with ${demoRes.status}`);
    const demoUser = await demoRes.json();
    if (!demoUser.token) throw new Error('Demo login did not issue token');
    if (demoUser.level !== 1) throw new Error(`Expected demo user level 1, got ${demoUser.level}`);
    if (demoUser.gold !== 50) throw new Error(`Expected demo user gold 50, got ${demoUser.gold}`);

    // Verify demo user's quests exist via standard authenticated GET /api/quests
    const demoQuestsRes = await fetch(`${baseUrl}/quests`, {
      headers: { Authorization: `Bearer ${demoUser.token}` },
    });
    const demoQuests = await demoQuestsRes.json();
    if (!Array.isArray(demoQuests) || demoQuests.length === 0) {
      throw new Error('Demo user has no seeded standard quests');
    }
    // Verify each seeded quest is owned by the demo user
    for (const q of demoQuests) {
      if (q.userId.toString() !== demoUser._id.toString()) {
        throw new Error(`Security breach: seeded quest ${q._id} not owned by demo user ${demoUser._id}`);
      }
    }
    console.log(`✅ Passed (Demo user at Level ${demoUser.level}, ${demoUser.gold}g, with ${demoQuests.length} legitimate seeded quests)`);

    console.log('\n🎉 ALL 8 MILESTONE 1 TESTS PASSED FLAWLESSLY!\n');
    server.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Milestone 1 Test Failure:', error.message);
    server.close();
    process.exit(1);
  }
}

runMilestone1Tests();

# ⚔️ Life RPG — Level Up Your Reality

> **We're not putting a to-do list inside a game. We're turning real life into the game.**

Life RPG transforms real-world productivity into an RPG progression system.
Complete quests, earn XP and Gold, level up, maintain streaks, unlock rewards, and use the AI Guildmaster to turn large goals into actionable quests.

---

## 🎮 Core Features

### ⚔️ Quest Board
Create and complete quests across:
- Study
- Fitness
- Work
- Chores
- Health
- Creative

### 🏆 RPG Progression

| Difficulty | XP | Gold |
|---|---:|---:|
| Easy | 25 | 10 |
| Medium | 75 | 30 |
| Hard | 175 | 75 |
| Epic | 450 | 200 |

Completing quests increases XP and Gold. XP contributes to level progression, while streaks provide additional XP multipliers.

### 🛡️ Adaptive Quest Verification

Life RPG supports three verification modes:

- **Casual** — immediate self-report completion.
- **Timed** — requires a server-tracked focus session.
- **Verified** — requires evidence/reflection before claiming rewards.

The backend is the authoritative referee: reward values are calculated server-side rather than trusted from the frontend.

### 🪙 Tavern Shop & Backpack

Spend Gold on RPG-style rewards and manage your collected items through the Tavern Shop and Backpack.

### 🤖 AI Guildmaster

The AI Guildmaster can transform a large goal into smaller, actionable quests.

### ✨ Game Feel

The interface uses a retro RPG aesthetic with:
- XP and level-up celebrations
- Streak indicators
- Toast notifications
- Modal interactions
- Progress bars
- Micro-interactions
- RPG-themed terminology

---

## 🔐 Anti-Cheat & Backend Security

Life RPG does not trust the client with progression calculations.

The backend:

- Calculates XP and Gold from quest difficulty.
- Validates quest ownership.
- Validates quest status.
- Validates verification requirements.
- Uses server timestamps for timed quests.
- Requires proof for verified quests.
- Prevents duplicate quest completion.
- Prevents reward manipulation through client-supplied values.
- Handles AI-generated quest rewards server-side.

### Verification Flow

```text
Quest
  ↓
Verification Requirement
  ↓
Server Validation
  ↓
Quest Completion
  ↓
XP + Gold
  ↓
Level / Streak Progression
  ↓
History & Persistence

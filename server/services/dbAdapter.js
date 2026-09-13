import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { isConnectedToMongo } from '../config/db.js';
import User from '../models/User.js';
import Quest from '../models/Quest.js';
import Item from '../models/Item.js';
import Inventory from '../models/Inventory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, '..', 'data', 'db.json');

// Default initial game items
export const STARTER_ITEMS = [
  {
    _id: 'item_sword_iron',
    name: 'Iron Broadsword',
    description: 'Forged in the Royal Citadel. Grants +5 Strength in physical workouts.',
    itemType: 'Weapon',
    costGold: 50,
    icon: 'sword',
    rarity: 'Common',
    statBonus: { strengthBonus: 5, intelligenceBonus: 0, enduranceBonus: 0, xpMultiplier: 1.05 },
    isRealLifeReward: false,
    userId: null,
  },
  {
    _id: 'item_staff_wisdom',
    name: 'Staff of the Arcane Scholar',
    description: 'Channel your focus. Grants +10% XP boost for study & coding sessions.',
    itemType: 'Weapon',
    costGold: 120,
    icon: 'staff',
    rarity: 'Rare',
    statBonus: { strengthBonus: 0, intelligenceBonus: 10, enduranceBonus: 0, xpMultiplier: 1.10 },
    isRealLifeReward: false,
    userId: null,
  },
  {
    _id: 'item_cloak_shadow',
    name: 'Rogue Shadow Cowl',
    description: 'Slip past distractions unnoticed. +5 Endurance.',
    itemType: 'Helmet',
    costGold: 80,
    icon: 'shield',
    rarity: 'Common',
    statBonus: { strengthBonus: 0, intelligenceBonus: 0, enduranceBonus: 5, xpMultiplier: 1.0 },
    isRealLifeReward: false,
    userId: null,
  },
  {
    _id: 'item_elixir_freeze',
    name: 'Elixir of Time Freeze',
    description: 'Protects your streak if you miss a day of quests.',
    itemType: 'Potion',
    costGold: 45,
    icon: 'potion',
    rarity: 'Rare',
    statBonus: { strengthBonus: 0, intelligenceBonus: 0, enduranceBonus: 0, xpMultiplier: 1.0 },
    isRealLifeReward: false,
    userId: null,
  },
  // Real-Life Rewards (The Dopamine Loop!)
  {
    _id: 'reward_gaming_hour',
    name: '1 Hour Guilt-Free Gaming',
    description: 'Redeem for 60 minutes of uninterrupted video game time.',
    itemType: 'RealLifeReward',
    costGold: 60,
    icon: 'gamepad',
    rarity: 'Common',
    statBonus: { strengthBonus: 0, intelligenceBonus: 0, enduranceBonus: 0, xpMultiplier: 1.0 },
    isRealLifeReward: true,
    userId: null,
  },
  {
    _id: 'reward_boba_coffee',
    name: 'Artisan Coffee or Boba Tea',
    description: 'A delicious caffeinated potion in the physical realm.',
    itemType: 'RealLifeReward',
    costGold: 90,
    icon: 'coffee',
    rarity: 'Rare',
    statBonus: { strengthBonus: 0, intelligenceBonus: 0, enduranceBonus: 0, xpMultiplier: 1.0 },
    isRealLifeReward: true,
    userId: null,
  },
  {
    _id: 'reward_netflix_movie',
    name: 'Movie Night & Snacks',
    description: 'Sit back and watch a full movie with popcorn.',
    itemType: 'RealLifeReward',
    costGold: 150,
    icon: 'tv',
    rarity: 'Epic',
    statBonus: { strengthBonus: 0, intelligenceBonus: 0, enduranceBonus: 0, xpMultiplier: 1.0 },
    isRealLifeReward: true,
    userId: null,
  }
];

function readLocalDB() {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(dbFilePath)) {
    const initialData = {
      users: [],
      quests: [],
      items: [...STARTER_ITEMS],
      inventory: [],
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const data = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    if (!data.items || data.items.length === 0) {
      data.items = [...STARTER_ITEMS];
      fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
    }
    return data;
  } catch {
    return { users: [], quests: [], items: [...STARTER_ITEMS], inventory: [] };
  }
}

function writeLocalDB(data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
}

// ---------------- USER ADAPTERS ----------------
export async function findUserByEmail(email) {
  if (isConnectedToMongo) {
    return await User.findOne({ email: email.toLowerCase() });
  }
  const db = readLocalDB();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserByGoogleId(googleId) {
  if (isConnectedToMongo) {
    return await User.findOne({ googleId });
  }
  const db = readLocalDB();
  return db.users.find((u) => u.googleId === googleId) || null;
}

export async function findUserByUsername(username) {
  if (isConnectedToMongo) {
    return await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
  }
  const db = readLocalDB();
  return db.users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function findUserById(id) {
  if (isConnectedToMongo) {
    return await User.findById(id).select('-password');
  }
  const db = readLocalDB();
  const user = db.users.find((u) => u._id.toString() === id.toString());
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function createUser({ username, email, password, googleId, avatar }) {
  let passwordHash = null;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash(password, salt);
  }

  if (isConnectedToMongo) {
    return await User.create({
      username,
      email: email.toLowerCase(),
      password,
      googleId: googleId || undefined,
      avatar: avatar || '',
    });
  }

  const db = readLocalDB();
  const newUser = {
    _id: crypto.randomBytes(12).toString('hex'),
    username,
    email: email.toLowerCase(),
    password: passwordHash,
    googleId: googleId || null,
    avatar: avatar || '',
    title: 'Novice Adventurer',
    level: 1,
    currentXP: 0,
    maxXP: 100,
    gold: 50,
    streakCount: 0,
    lastActiveDate: null,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeLocalDB(db);
  return newUser;
}

export async function updateUser(id, updates) {
  if (isConnectedToMongo) {
    return await User.findByIdAndUpdate(id, updates, { new: true });
  }
  const db = readLocalDB();
  const index = db.users.findIndex((u) => u._id.toString() === id.toString());
  if (index === -1) return null;
  db.users[index] = { ...db.users[index], ...updates };
  writeLocalDB(db);
  return db.users[index];
}

// ---------------- QUEST ADAPTERS ----------------
export async function findQuestsByUser(userId) {
  if (isConnectedToMongo) {
    return await Quest.find({ userId }).sort({ createdAt: -1 });
  }
  const db = readLocalDB();
  return db.quests
    .filter((q) => q.userId.toString() === userId.toString())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function findQuestById(id) {
  if (isConnectedToMongo) {
    return await Quest.findById(id);
  }
  const db = readLocalDB();
  return db.quests.find((q) => q._id.toString() === id.toString()) || null;
}

export async function createQuest(data) {
  if (isConnectedToMongo) {
    return await Quest.create(data);
  }
  const db = readLocalDB();
  const newQuest = {
    _id: crypto.randomBytes(12).toString('hex'),
    ...data,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  db.quests.push(newQuest);
  writeLocalDB(db);
  return newQuest;
}

export async function claimQuest(id) {
  if (isConnectedToMongo) {
    // Atomic state transition: only one request can move a quest to Completed.
    return await Quest.findOneAndUpdate(
      { _id: id, status: { $ne: 'Completed' } },
      { $set: { status: 'Completed', completedAt: new Date() } },
      { new: true }
    );
  }

  const db = readLocalDB();
  const index = db.quests.findIndex((q) => q._id.toString() === id.toString());
  if (index === -1 || db.quests[index].status === 'Completed') return null;

  db.quests[index] = {
    ...db.quests[index],
    status: 'Completed',
    completedAt: new Date().toISOString(),
  };
  writeLocalDB(db);
  return db.quests[index];
}

export async function updateQuest(id, updates) {
  if (isConnectedToMongo) {
    return await Quest.findByIdAndUpdate(id, updates, { new: true });
  }
  const db = readLocalDB();
  const index = db.quests.findIndex((q) => q._id.toString() === id.toString());
  if (index === -1) return null;
  db.quests[index] = { ...db.quests[index], ...updates };
  writeLocalDB(db);
  return db.quests[index];
}

export async function deleteQuest(id) {
  if (isConnectedToMongo) {
    return await Quest.findByIdAndDelete(id);
  }
  const db = readLocalDB();
  const index = db.quests.findIndex((q) => q._id.toString() === id.toString());
  if (index === -1) return null;
  const deleted = db.quests.splice(index, 1);
  writeLocalDB(db);
  return deleted[0];
}

// ---------------- ITEM & SHOP ADAPTERS ----------------
export async function findShopItems(userId) {
  if (isConnectedToMongo) {
    let items = await Item.find({
      $or: [{ userId: null }, { userId }],
    });
    if (items.length === 0) {
      // Auto-seed starter items to MongoDB on first launch
      const formattedStarters = STARTER_ITEMS.map(({ _id, ...rest }) => rest);
      await Item.insertMany(formattedStarters);
      items = await Item.find({
        $or: [{ userId: null }, { userId }],
      });
    }
    return items;
  }
  const db = readLocalDB();
  return db.items.filter((item) => !item.userId || item.userId.toString() === userId.toString());
}

export async function findItemById(id) {
  if (isConnectedToMongo) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return await Item.findById(id);
    }
    return await Item.findOne({ name: id });
  }
  const db = readLocalDB();
  return db.items.find((i) => i._id.toString() === id.toString()) || null;
}

export async function createCustomRewardItem(data) {
  if (isConnectedToMongo) {
    return await Item.create(data);
  }
  const db = readLocalDB();
  const newItem = {
    _id: crypto.randomBytes(12).toString('hex'),
    ...data,
    createdAt: new Date().toISOString(),
  };
  db.items.push(newItem);
  writeLocalDB(db);
  return newItem;
}

// ---------------- INVENTORY ADAPTERS ----------------
export async function findInventoryByUser(userId) {
  if (isConnectedToMongo) {
    return await Inventory.find({ userId }).populate('itemId');
  }
  const db = readLocalDB();
  const userInv = db.inventory.filter((inv) => inv.userId.toString() === userId.toString());
  // Populate itemId details
  return userInv.map((inv) => {
    const itemDetails = db.items.find((i) => i._id.toString() === inv.itemId.toString());
    return {
      ...inv,
      itemId: itemDetails || { name: 'Unknown Relic', icon: 'shield' },
    };
  });
}

export async function addInventoryItem(userId, itemId) {
  if (isConnectedToMongo) {
    const existing = await Inventory.findOne({ userId, itemId });
    if (existing) {
      existing.quantity += 1;
      return await existing.save();
    }
    return await Inventory.create({ userId, itemId, quantity: 1, isEquipped: false });
  }

  const db = readLocalDB();
  const existing = db.inventory.find(
    (inv) => inv.userId.toString() === userId.toString() && inv.itemId.toString() === itemId.toString()
  );
  if (existing) {
    existing.quantity += 1;
    writeLocalDB(db);
    return existing;
  }
  const newInv = {
    _id: crypto.randomBytes(12).toString('hex'),
    userId,
    itemId,
    quantity: 1,
    isEquipped: false,
    purchasedAt: new Date().toISOString(),
  };
  db.inventory.push(newInv);
  writeLocalDB(db);
  return newInv;
}

export async function toggleEquipItem(userId, inventoryId) {
  if (isConnectedToMongo) {
    const inv = await Inventory.findOne({ _id: inventoryId, userId });
    if (!inv) return null;
    inv.isEquipped = !inv.isEquipped;
    return await inv.save();
  }
  const db = readLocalDB();
  const inv = db.inventory.find(
    (i) => i._id.toString() === inventoryId.toString() && i.userId.toString() === userId.toString()
  );
  if (!inv) return null;
  inv.isEquipped = !inv.isEquipped;
  writeLocalDB(db);
  return inv;
}

/**
 * Aggregates stat bonuses from all equipped items for a user.
 * @returns {{ xpMultiplier: number, strengthBonus: number, intelligenceBonus: number, enduranceBonus: number }}
 */
export async function getEquippedBonuses(userId) {
  const defaults = { xpMultiplier: 1.0, strengthBonus: 0, intelligenceBonus: 0, enduranceBonus: 0 };

  if (isConnectedToMongo) {
    const equipped = await Inventory.find({ userId, isEquipped: true }).populate('itemId');
    if (!equipped || equipped.length === 0) return defaults;

    let xpMultiplier = 1.0;
    let strengthBonus = 0;
    let intelligenceBonus = 0;
    let enduranceBonus = 0;

    for (const inv of equipped) {
      if (inv.itemId && inv.itemId.statBonus) {
        xpMultiplier *= (inv.itemId.statBonus.xpMultiplier || 1.0);
        strengthBonus += (inv.itemId.statBonus.strengthBonus || 0);
        intelligenceBonus += (inv.itemId.statBonus.intelligenceBonus || 0);
        enduranceBonus += (inv.itemId.statBonus.enduranceBonus || 0);
      }
    }

    return { xpMultiplier, strengthBonus, intelligenceBonus, enduranceBonus };
  }

  const db = readLocalDB();
  const equipped = db.inventory.filter(
    (inv) => inv.userId.toString() === userId.toString() && inv.isEquipped === true
  );

  if (equipped.length === 0) return defaults;

  let xpMultiplier = 1.0;
  let strengthBonus = 0;
  let intelligenceBonus = 0;
  let enduranceBonus = 0;

  for (const inv of equipped) {
    const item = db.items.find((i) => i._id.toString() === inv.itemId.toString());
    if (item && item.statBonus) {
      xpMultiplier *= (item.statBonus.xpMultiplier || 1.0);
      strengthBonus += (item.statBonus.strengthBonus || 0);
      intelligenceBonus += (item.statBonus.intelligenceBonus || 0);
      enduranceBonus += (item.statBonus.enduranceBonus || 0);
    }
  }

  return { xpMultiplier, strengthBonus, intelligenceBonus, enduranceBonus };
}

/**
 * Consumes one unit of an inventory item (decrements quantity).
 * Removes the inventory entry entirely if quantity reaches 0.
 * @returns {boolean} true if consumed successfully
 */
export async function consumeInventoryItem(userId, itemId) {
  if (isConnectedToMongo) {
    let inv = null;
    if (mongoose.Types.ObjectId.isValid(itemId)) {
      inv = await Inventory.findOne({ userId, itemId });
    } else {
      const item = await Item.findOne({ $or: [{ name: 'Elixir of Time Freeze' }, { _id: mongoose.Types.ObjectId.isValid(itemId) ? itemId : null }] });
      if (item) {
        inv = await Inventory.findOne({ userId, itemId: item._id });
      }
    }
    if (!inv || inv.quantity <= 0) return false;
    inv.quantity -= 1;
    if (inv.quantity <= 0) {
      await Inventory.deleteOne({ _id: inv._id });
    } else {
      await inv.save();
    }
    return true;
  }

  const db = readLocalDB();
  const index = db.inventory.findIndex(
    (inv) => inv.userId.toString() === userId.toString() &&
             (inv.itemId.toString() === itemId.toString() || inv.itemId === itemId)
  );
  if (index === -1 || db.inventory[index].quantity <= 0) return false;
  db.inventory[index].quantity -= 1;
  if (db.inventory[index].quantity <= 0) {
    db.inventory.splice(index, 1);
  }
  writeLocalDB(db);
  return true;
}

/**
 * Finds a user's inventory entry for a specific item.
 * Used to check if user owns a particular item (e.g. Elixir of Time Freeze).
 */
export async function findInventoryItemByItemId(userId, itemId) {
  if (isConnectedToMongo) {
    if (mongoose.Types.ObjectId.isValid(itemId)) {
      return await Inventory.findOne({ userId, itemId, quantity: { $gte: 1 } });
    }
    const item = await Item.findOne({ name: 'Elixir of Time Freeze' });
    if (!item) return null;
    return await Inventory.findOne({ userId, itemId: item._id, quantity: { $gte: 1 } });
  }
  const db = readLocalDB();
  return db.inventory.find(
    (inv) => inv.userId.toString() === userId.toString() &&
             (inv.itemId.toString() === itemId.toString() || inv.itemId === itemId) &&
             inv.quantity >= 1
  ) || null;
}

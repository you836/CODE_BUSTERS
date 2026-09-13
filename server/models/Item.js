import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    itemType: {
      type: String,
      enum: ['Weapon', 'Armor', 'Helmet', 'Potion', 'RealLifeReward', 'Cosmetic'],
      default: 'Weapon',
    },
    costGold: {
      type: Number,
      required: true,
      min: 0,
    },
    icon: {
      type: String,
      default: 'sword', // sword, shield, helmet, potion, coffee, gamepad, pizza
    },
    rarity: {
      type: String,
      enum: ['Common', 'Rare', 'Epic', 'Legendary'],
      default: 'Common',
    },
    statBonus: {
      strengthBonus: { type: Number, default: 0 },
      intelligenceBonus: { type: Number, default: 0 },
      enduranceBonus: { type: Number, default: 0 },
      xpMultiplier: { type: Number, default: 1.0 }, // e.g. 1.05 = +5% XP
    },
    isRealLifeReward: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means global shop item; non-null means user's custom reward
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model('Item', itemSchema);
export default Item;

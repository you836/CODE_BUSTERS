import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide an adventurer name'],
      unique: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: [true, 'Please provide a guild communications scroll (email)'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: 'Novice Adventurer',
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    currentXP: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxXP: {
      type: Number,
      default: 100,
      min: 10,
    },
    gold: {
      type: Number,
      default: 50, // Starting pouch of gold
      min: 0,
    },
    streakCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    // Character Attributes — increased by completing quests in related categories
    strength: {
      type: Number,
      default: 0,
      min: 0,
    },
    intelligence: {
      type: Number,
      default: 0,
      min: 0,
    },
    endurance: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Achievement Badges
    badges: [{
      badgeId: { type: String, required: true },
      awardedAt: { type: Date, default: Date.now },
    }],
    // Tracking Counters for Badge Evaluation
    totalQuestsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalGoldSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    timedQuestsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    verifiedQuestsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing before saving
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;

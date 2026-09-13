import mongoose from 'mongoose';

const questSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Every quest needs a title, Adventurer!'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Study', 'Fitness', 'Work', 'Chores', 'Health', 'Creative'],
      default: 'Study',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Epic'],
      default: 'Easy',
    },
    questType: {
      type: String,
      enum: ['Daily', 'MainQuest', 'Habit'],
      default: 'Daily',
    },
    // Verification Tier Architecture
    verificationType: {
      type: String,
      enum: ['Casual', 'Timed', 'Verified'],
      default: 'Casual',
    },
    // Timed Quests
    minDurationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    // Verified Quests
    proofRequired: {
      type: String,
      default: '',
    },
    proofSubmission: {
      type: String,
      default: null,
    },
    proofSubmittedAt: {
      type: Date,
      default: null,
    },
    xpReward: {
      type: Number,
      default: 25,
    },
    goldReward: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ['Pending', 'InProgress', 'Completed', 'Failed'],
      default: 'Pending',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    statType: {
      type: String,
      enum: ['strength', 'intelligence', 'endurance', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Quest = mongoose.model('Quest', questSchema);
export default Quest;

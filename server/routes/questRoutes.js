import express from 'express';
import {
  getQuests,
  createQuest,
  updateQuest,
  deleteQuest,
  completeQuest,
  startTimedQuest,
  submitProof,
} from '../controllers/questController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All quest routes require valid JWT auth

router.route('/')
  .get(getQuests)
  .post(createQuest);

router.route('/:id')
  .put(updateQuest)
  .delete(deleteQuest);

// The Core Game Loop Endpoint
router.patch('/:id/complete', completeQuest);

// New endpoints for timed quest start and proof submission
router.post('/:id/start', startTimedQuest);
router.post('/:id/verify', submitProof);

export default router;

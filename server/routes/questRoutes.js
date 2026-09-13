import express from 'express';
import {
  getQuests,
  createQuest,
  updateQuest,
  deleteQuest,
  completeQuest,
  startTimedQuest,
  resetTimedQuest,
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

// Endpoints for timed quest start, reset, and proof submission
router.post('/:id/start', startTimedQuest);
router.post('/:id/reset-timer', resetTimedQuest);
router.post('/:id/verify', submitProof);

export default router;

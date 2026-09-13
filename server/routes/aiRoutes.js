import express from 'express';
import { handleGenerateQuests, handleAcceptQuests } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate-quest', handleGenerateQuests);
router.post('/accept-quests', handleAcceptQuests);

export default router;

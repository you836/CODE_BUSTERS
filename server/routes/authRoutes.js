import express from 'express';
import { registerUser, loginUser, getMe, demoLogin, googleAuth } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/demo', demoLogin); // 1-click Demo Knight for judges
router.get('/me', protect, getMe);

export default router;

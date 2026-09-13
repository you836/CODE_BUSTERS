import express from 'express';
import {
  getShopItems,
  buyItem,
  getInventory,
  equipItem,
  createCustomReward,
} from '../controllers/shopController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/items', getShopItems);
router.post('/buy/:itemId', buyItem);
router.get('/inventory', getInventory);
router.patch('/inventory/equip/:id', equipItem);
router.post('/rewards/custom', createCustomReward);

export default router;

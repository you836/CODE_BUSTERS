import {
  findShopItems,
  findItemById,
  findInventoryByUser,
  addInventoryItem,
  toggleEquipItem,
  createCustomRewardItem,
  findUserById,
  updateUser,
} from '../services/dbAdapter.js';

/**
 * @desc    Get all items in the Tavern Merchant Shop
 * @route   GET /api/shop/items
 * @access  Private
 */
export async function getShopItems(req, res) {
  try {
    const items = await findShopItems(req.user._id);
    res.json(items);
  } catch (error) {
    console.error('Error fetching shop items:', error);
    res.status(500).json({ message: 'The merchant has stepped away from the counter.' });
  }
}

/**
 * @desc    Purchase an item or real-life reward with Gold
 * @route   POST /api/shop/buy/:itemId
 * @access  Private
 */
export async function buyItem(req, res) {
  try {
    const { itemId } = req.params;
    const user = await findUserById(req.user._id);
    const item = await findItemById(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found in the shop.' });
    }

    if (user.gold < item.costGold) {
      return res.status(400).json({
        message: `Not enough gold! You have ${user.gold}g, but need ${item.costGold}g. Complete more quests!`,
      });
    }

    // Deduct gold and track spending
    const remainingGold = user.gold - item.costGold;
    const updatedUser = await updateUser(user._id, {
      gold: remainingGold,
      totalGoldSpent: (user.totalGoldSpent || 0) + item.costGold,
    });

    // Add to inventory
    const invItem = await addInventoryItem(user._id, item._id);

    res.json({
      success: true,
      message: item.isRealLifeReward
        ? `🎉 Reward Claimed: "${item.name}"! Go enjoy your well-earned break!`
        : `⚔️ Purchased "${item.name}"! Added to your inventory.`,
      remainingGold: updatedUser.gold,
      inventoryItem: invItem,
      item,
    });
  } catch (error) {
    console.error('Error purchasing item:', error);
    res.status(500).json({ message: 'Merchant transaction failed.' });
  }
}

/**
 * @desc    Get current user's backpack / inventory
 * @route   GET /api/inventory
 * @access  Private
 */
export async function getInventory(req, res) {
  try {
    const inventory = await findInventoryByUser(req.user._id);
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Unable to open backpack.' });
  }
}

/**
 * @desc    Equip or unequip an item
 * @route   PATCH /api/inventory/equip/:id
 * @access  Private
 */
export async function equipItem(req, res) {
  try {
    const { id } = req.params;
    const updated = await toggleEquipItem(req.user._id, id);
    if (!updated) {
      return res.status(404).json({ message: 'Item not found in inventory.' });
    }
    res.json({ success: true, inventory: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to equip item.' });
  }
}

/**
 * @desc    Create a custom real-world reward
 * @route   POST /api/rewards/custom
 * @access  Private
 */
export async function createCustomReward(req, res) {
  try {
    const { name, description, costGold, icon } = req.body;

    if (!name || !costGold) {
      return res.status(400).json({ message: 'Please provide reward name and gold cost.' });
    }

    const newReward = await createCustomRewardItem({
      name: name.trim(),
      description: description || '',
      itemType: 'RealLifeReward',
      costGold: Number(costGold),
      icon: icon || 'coffee',
      rarity: 'Common',
      statBonus: { strengthBonus: 0, intelligenceBonus: 0, enduranceBonus: 0, xpMultiplier: 1.0 },
      isRealLifeReward: true,
      userId: req.user._id,
    });

    res.status(201).json(newReward);
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ message: 'Failed to create real-world reward.' });
  }
}

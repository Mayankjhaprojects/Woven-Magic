import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Favorite from '../models/Favorite.js';
import Product from '../models/Product.js';

const router = express.Router();

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).populate('product');
    res.json(favorites.map((f) => f.product));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/favorites
// @desc    Add product to favorites or merge guest favorites
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productIds } = req.body; // array of product IDs from guest favorites

    if (Array.isArray(productIds)) {
      // Merge guest favorites
      for (const productId of productIds) {
        try {
          await Favorite.findOneAndUpdate(
            { user: req.user._id, product: productId },
            { user: req.user._id, product: productId },
            { upsert: true, new: true }
          );
        } catch (error) {
          // Ignore duplicate key errors
        }
      }
    } else {
      // Single product add
      const { productId } = req.body;
      const favorite = await Favorite.findOneAndUpdate(
        { user: req.user._id, product: productId },
        { user: req.user._id, product: productId },
        { upsert: true, new: true }
      );
    }

    const favorites = await Favorite.find({ user: req.user._id }).populate('product');
    res.json(favorites.map((f) => f.product));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/favorites/:productId
// @desc    Remove product from favorites
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({
      user: req.user._id,
      product: req.params.productId,
    });
    const favorites = await Favorite.find({ user: req.user._id }).populate('product');
    res.json(favorites.map((f) => f.product));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;


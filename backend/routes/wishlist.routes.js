const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require('../controllers/wishlist.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', protect, getWishlist);

router
  .route('/:productId')
  .post(protect, addToWishlist)
  .delete(protect, removeFromWishlist);

router.patch('/:productId/toggle', protect, toggleWishlist);
router.post('/:productId/toggle', protect, toggleWishlist);

module.exports = router;

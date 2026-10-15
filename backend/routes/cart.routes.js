const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .get(protect, getCart);

router.route('/:productId')
  .post(protect, addToCart)
  .patch(protect, updateCartQuantity)
  .delete(protect, removeFromCart);

module.exports = router;

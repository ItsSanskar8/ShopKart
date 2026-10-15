const express = require('express');
const router = express.Router();
const {
  getPaymentConfig,
  updatePaymentConfig,
  createPaymentOrder,
  verifyPayment,
  recordPaymentFailure,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/payment-config', getPaymentConfig);
router.post('/payment-config', protect, updatePaymentConfig);

router.post('/create-payment-order', protect, createPaymentOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/record-failure', protect, recordPaymentFailure);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, updateOrderStatus);

module.exports = router;

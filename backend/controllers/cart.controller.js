const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Product not found',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    let quantityToAdd = 1;
    if (
      req.body &&
      typeof req.body.quantity === 'number' &&
      Number.isInteger(req.body.quantity) &&
      req.body.quantity > 0
    ) {
      quantityToAdd = req.body.quantity;
    }

    const existingIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingIndex > -1) {

      const newQuantity = user.cart[existingIndex].quantity + quantityToAdd;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: `Cannot add more. Requested quantity (${newQuantity}) exceeds available stock (${product.stock}).`,
        });
      }

      user.cart[existingIndex].quantity = newQuantity;
    } else {

      if (product.stock < 1) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: 'Product is currently out of stock.',
        });
      }

      if (quantityToAdd > product.stock) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: `Requested quantity (${quantityToAdd}) exceeds available stock (${product.stock}).`,
        });
      }

      user.cart.push({
        product: productId,
        quantity: quantityToAdd,
      });
    }

    await user.save();

    await user.populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Cart updated',
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error adding product to cart',
    });
  }
};

const getCart = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      count: validCart.length,
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error fetching cart',
    });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid product ID',
      });
    }

    if (quantity === undefined || quantity === null || typeof quantity !== 'number' || isNaN(quantity)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Quantity must be a valid number',
      });
    }

    const parsedQuantity = Math.floor(quantity);
    if (parsedQuantity < 1) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Product not found',
      });
    }

    if (parsedQuantity > product.stock) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: `Quantity exceeds available stock (${product.stock})`,
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (!cartItem) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Product not in cart',
      });
    }

    cartItem.quantity = parsedQuantity;
    await user.save();

    await user.populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Cart quantity updated',
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error updating cart quantity',
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid product ID',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    const exists = user.cart.some(
      (item) => item.product.toString() === productId.toString()
    );

    if (!exists) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Product not in cart',
      });
    }

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId.toString()
    );
    await user.save();

    await user.populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Product removed from cart',
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error removing product from cart',
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};

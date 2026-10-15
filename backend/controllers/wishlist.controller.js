const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const addToWishlist = async (req, res) => {
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

    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        statusCode: 409,
        success: false,
        message: 'Product already in wishlist',
      });
    }

    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error adding product to wishlist',
    });
  }
};

const getWishlist = async (req, res) => {
  try {

    const user = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name description price category image stock createdAt',
    });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    const validWishlist = (user.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error fetching wishlist',
    });
  }
};

const removeFromWishlist = async (req, res) => {
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

    const exists = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (!exists) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Product not in wishlist',
      });
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );
    await user.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error removing product from wishlist',
    });
  }
};

const toggleWishlist = async (req, res) => {
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

    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (isAlreadyWishlisted) {

      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId.toString()
      );
      await user.save();

      return res.status(200).json({
        statusCode: 200,
        success: true,
        saved: false,
        message: 'Product removed from wishlist',
      });
    } else {

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          statusCode: 404,
          success: false,
          message: 'Product not found',
        });
      }

      user.wishlist.push(productId);
      await user.save();

      return res.status(200).json({
        statusCode: 200,
        success: true,
        saved: true,
        message: 'Product added to wishlist',
      });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error toggling wishlist',
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import * as dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 3010;
import Order from "../models/order.js";
import Product from "../models/product.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      "some very secret key",
      { expiresIn: "24h" }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

export const registration = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName, role } =
    req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Password doesn't match" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      email,
      role,
      password: hashedPassword,
      fullName: `${firstName} ${lastName}`,
    });

    const token = jwt.sign(
      { email: result.email, id: result._id },
      "some very secret key",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      result: {
        _id: result._id,
        fullName: result.fullName,
        email: result.email,
        role: result.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.remove();

  return res.json({ message: "User deleted" });
};

export const updateUserProfile = async (req, res) => {
  try {
    const { id: _id } = req.params;
    const userId = req.userId;
    const profile = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure user can only update their own profile
    if (String(userId) !== String(_id)) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    // Remove _id from update data (immutable field)
    const { _id: removedId, email: removedEmail, ...updateData } = profile;

    // Email is used as username/identifier and should not be changed
    // Prevent email updates for security
    if (profile.email) {
      console.warn(`Attempt to update email for user ${_id} - email updates are not allowed`);
    }

    // Validate required fields
    if (!updateData.fullName && Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "At least fullName must be provided" });
    }

    const updatedProfile = await User.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove password from response
    const { password, ...profileResponse } = updatedProfile.toObject();

    return res.json(profileResponse);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const fullUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    const updated = await User.findByIdAndUpdate(id, { profilePhoto: fullUrl }, { new: true });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: "Failed to upload profile photo" });
  }
};

export const uploadCoverPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const fullUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    const updated = await User.findByIdAndUpdate(id, { coverPhoto: fullUrl }, { new: true });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: "Failed to upload cover photo" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  const users = await User.find();
  const privateFields = users.map((user) => {
    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  });
  return res.json(privateFields);
};

export const validateUser = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user) {
      return res.status(200).json({ result: user });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

export const createNewPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const hashedPassword = await bcrypt.hash(password, 12);

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { password: hashedPassword },
        { new: true }
      );

      return res.status(200).json({ result: updatedUser });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const isSeller = user?.role === 'seller';
    
    const orders = await Order.find({ userId });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.amount / 100), 0);
    
    // Handle both string and ObjectId userID for backward compatibility
    const mongoose = (await import("mongoose")).default;
    const userProducts = await Product.find({
      $or: [
        { userID: userId },
        { userID: String(userId) },
        { userID: new mongoose.Types.ObjectId(userId) }
      ]
    });
    const totalProducts = userProducts.length;
    
    if (isSeller) {
      // Seller stats: orders containing seller's products
      const productIds = userProducts.map(p => p._id);
      const productIdStrings = productIds.map(id => String(id));
      
      if (productIds.length > 0) {
        const sellerOrders = await Order.find({
          "items.productId": { $in: productIds }
        });
        const totalSales = sellerOrders.length;
        const totalRevenue = sellerOrders.reduce((sum, order) => {
          const sellerItems = order.items.filter(item => 
            productIdStrings.includes(String(item.productId))
          );
          return sum + sellerItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        }, 0);
        
        // Count items in carts
        const Cart = (await import("../models/cart.js")).default;
        const cartsWithSellerProducts = await Cart.find({
          "items.productId": { $in: productIds }
        });
        const cartItemsCount = cartsWithSellerProducts.reduce((count, cart) => {
          return count + cart.items.filter(item => 
            productIdStrings.includes(String(item.productId))
          ).length;
        }, 0);
      
        return res.json({ 
          totalOrders, 
          totalSpent, 
          totalProducts, 
          totalSales,
          totalRevenue,
          cartItemsCount
        });
      } else {
        return res.json({ 
          totalOrders, 
          totalSpent, 
          totalProducts, 
          totalSales: 0,
          totalRevenue: 0,
          cartItemsCount: 0
        });
      }
    } else {
      // Buyer stats
      const totalSales = orders.filter(o => userProducts.some(p => String(p._id) === String(o.items?.[0]?.productId))).length;
      return res.json({ totalOrders, totalSpent, totalProducts, totalSales });
    }
  } catch (e) {
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
};

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import User from "../models/user.js";

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
  const { id: _id } = req.params;
  const profile = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("User not found");
  const updatedProfile = await User.findByIdAndUpdate(
    _id,
    { ...profile, _id },
    { new: true }
  );
  res.json(updatedProfile);
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

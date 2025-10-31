import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  id: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  },
  profilePhoto: { type: String },
  coverPhoto: { type: String },
});

export default mongoose.model("User", userSchema);

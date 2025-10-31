import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
    enum: ["admin", "seller", "user", "delivery_agency", "delivery_person", "support"],
    required: true,
  },
  // For delivery persons - reference to their delivery agency
  deliveryAgencyId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    default: null,
  },
  profilePhoto: { type: String },
  coverPhoto: { type: String },
  // Contact information
  secondaryEmail: { type: String },
  phone: { type: String },
  secondaryPhone: { type: String },
  // Addresses
  primaryAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
  },
  secondaryAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
  },
});

export default mongoose.model("User", userSchema);

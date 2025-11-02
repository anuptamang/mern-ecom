import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
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
    enum: [
      "admin",
      "seller",
      "user",
      "delivery_agency",
      "delivery_person",
      "warehouse_operator",
      "support",
      "support_user",
      "verification_team",
      "return_inspector",
      "return_deliverer",
      "finance",
    ],
    required: true,
  },
  // For delivery persons - reference to their delivery agency
  deliveryAgencyId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    default: null,
  },
  // For delivery persons - type of deliverer
  delivererType: {
    type: String,
    enum: ["warehouse", "customer_delivery", "customer_return"],
    // No default - only set for delivery_person role
    // warehouse: picks up from seller and delivers to facility
    // customer_delivery: delivers orders to customers
    // customer_return: handles return pickups and re-deliveries
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
  // Bank payout information (for sellers)
  bankPayout: {
    accountHolderName: { type: String },
    accountNumber: { type: String },
    bankName: { type: String },
    routingNumber: { type: String },
    swiftCode: { type: String },
    iban: { type: String },
    accountType: { type: String, enum: ["checking", "savings"] },
  },
  // Profile completion tracking
  profileCompleted: { type: Boolean, default: false },
  profileCompletedAt: { type: Date },
  // Workload tracking (computed fields, not stored in DB but can be queried)
  // This will be calculated dynamically based on active assignments
});

export default mongoose.model("User", userSchema);

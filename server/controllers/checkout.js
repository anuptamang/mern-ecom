import Stripe from "stripe";
import Cart from "../models/cart.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, currency = "usd" } = req.body || {};

    let finalAmount = amount;
    if (!finalAmount) {
      const cart = await Cart.findOne({ userId });
      const totals = cart?.getTotals() || { totalPrice: 0 };
      finalAmount = Math.round(Number(totals.totalPrice || 0) * 100);
    }

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency,
      metadata: { userId: String(userId) },
      automatic_payment_methods: { enabled: true },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create payment intent" });
  }
};

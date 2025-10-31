import Stripe from "stripe";
import Cart from "../models/cart.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return res.status(500).json({ 
        message: "Payment service is not configured. Please contact support." 
      });
    }

    const { amount, currency = "usd" } = req.body || {};

    let finalAmount = amount;
    if (!finalAmount) {
      // Get cart and calculate totals
      const cart = await Cart.findOne({ userId });
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate totals manually if getTotals method fails
      try {
        const totals = cart.getTotals ? cart.getTotals() : {
          totalPrice: cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        finalAmount = Math.round(Number(totals.totalPrice || 0) * 100);
      } catch (calcError) {
        console.error("Error calculating cart totals:", calcError);
        // Fallback: calculate manually
        finalAmount = Math.round(
          cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100
        );
      }
    } else {
      // Convert amount to cents if it's not already
      finalAmount = Math.round(Number(amount) * 100);
    }

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount. Cart total must be greater than 0." });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency,
      metadata: { userId: String(userId) },
      automatic_payment_methods: { enabled: true },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    
    // Provide more specific error messages
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        message: "Invalid payment request", 
        error: error.message 
      });
    }
    
    if (error.type === 'StripeAuthenticationError') {
      return res.status(500).json({ 
        message: "Payment service authentication failed. Please contact support." 
      });
    }
    
    return res.status(500).json({ 
      message: "Failed to create payment intent", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

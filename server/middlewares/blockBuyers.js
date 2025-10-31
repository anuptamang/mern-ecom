// Middleware to block buyers from product management
export const blockBuyers = (req, res, next) => {
  if (req.userRole !== 'seller') {
    return res.status(403).json({ message: "Only sellers can manage products. Please use a seller account." });
  }
  next();
};


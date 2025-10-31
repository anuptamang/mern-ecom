// Middleware to block sellers from purchasing
export const blockSellers = (req, res, next) => {
  if (req.userRole === 'seller') {
    return res.status(403).json({ message: "Sellers cannot purchase products. Please use a buyer account." });
  }
  next();
};


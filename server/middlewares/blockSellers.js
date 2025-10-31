// Middleware to block sellers from accessing buyer-specific routes
export const blockSellers = (req, res, next) => {
  if (req.userRole === 'seller') { // Assuming 'seller' role is for sellers
    return res.status(403).json({ message: "Sellers do not have access to this feature." });
  }
  next();
};

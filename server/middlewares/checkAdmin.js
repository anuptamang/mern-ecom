/**
 * Middleware to check if user is admin
 */
export const checkAdmin = async (req, res, next) => {
  try {
    if (!req.userRole) {
      return res.status(401).json({ message: 'Unauthorized - No user role found' });
    }

    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Error in checkAdmin middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default checkAdmin;

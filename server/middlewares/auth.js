import jwt from 'jsonwebtoken'
import User from '../models/user.js'

const Auth = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const token = req.headers.authorization.split(" ")[1]
        
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const iscustomAuth = token.length < 500
        let decodedData
        
        if (token && iscustomAuth) {
            decodedData = jwt.verify(token, 'some very secret key')
            req.userId = decodedData?.id
            // Fetch user to get role and verify user still exists
            const user = await User.findById(decodedData?.id)
            if (!user) {
                // User doesn't exist (e.g., deleted during system upgrade)
                return res.status(401).json({ message: "User not found. Please log in again." })
            }
            req.userRole = user?.role
        } else {
            decodedData = jwt.decode(token)
            req.userId = decodedData?.sub
        }
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: "Unauthorized" })
    }
}

export default Auth
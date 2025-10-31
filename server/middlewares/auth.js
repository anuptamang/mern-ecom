import jwt from 'jsonwebtoken'
import User from '../models/user.js'

const Auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const iscustomAuth = token.length < 500
        let decodedData
        if (token && iscustomAuth) {
            decodedData = jwt.verify(token, 'some very secret key')
            req.userId = decodedData?.id
            // Fetch user to get role
            const user = await User.findById(decodedData?.id)
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
import jwt from 'jsonwebtoken'

const Auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const iscustomAuth = token.length < 500
        let decodedData
        if (token && iscustomAuth) {
            decodedData = jwt.verify(token, 'some very secret key')
            req.userId = decodedData?.id
        } else {
            decodedData = jwt.decode(token)
            req.userId = decodedData?.sub
        }
        next()
    } catch (error) {
        console.log(error)
    }
}

export default Auth
const CustomError = require('../errors')
const {isTokenValid} = require('../utils/jwt')

const authenticateUser = async (req, res, next)=>{
    const token = req.signedCookies.token
    if(!token){
        throw new CustomError.UnauthenticatedError("Authentication Invalid")
    }
    
    
    try {
        const {name, userId, role} = isTokenValid({token})
        req.user = {name, userId, role}
        next()
    } catch (error) {
        throw new CustomError.UnauthenticatedError("Authentication Invalid")
    }

}

const authorizePermissions = (...role)=>{
    return (req, res, next)=>{
        if(!role.includes(req.user.role)){
            throw new CustomError.UnauthorizedError("Route not available for this user")
        }
        next()
    }
}


module.exports = {
    authenticateUser,
    authorizePermissions
}
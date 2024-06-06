const { StatusCodes } = require('http-status-codes')
const User = require('../models/User')
const CustomError = require('../errors')
const {createTokenUser, attachCookiesToResponse, checkPermissions} = require('../utils')

const getAllUsers = async (req, res)=>{
    const user = await User.find({role:"user"}).select('-password')
    res.status(StatusCodes.OK).json(user)
}

const getSingleUser = async (req, res)=>{
    const user = await User.findOne({_id:req.params.id}).select('-password')
    if(!user){
        throw new CustomError.NotFoundError('User not found')
    }
    checkPermissions(req.user, user._id)
    res.status(StatusCodes.OK).json(user)
}

const showCurrentUser = async (req, res)=>{
    res.status(StatusCodes.OK).json({ user:req.user})
}


const updateUser = async (req, res)=>{
    const {name, email} = req.body
    if(!name || !email){
        throw new CustomError.BadRequestError('Please provide email and password')
    }
    const user = await User.findOne({_id:req.user.userId})
    user.name = name
    user.email = email
    await user.save()
    const tokenUser = createTokenUser( user )
    attachCookiesToResponse({ res, user: tokenUser})
    res.status(StatusCodes.OK).json({ user:tokenUser })
}

const updateUserPassword = async (req, res)=>{
    const {oldPassword, newPassword} = req.body
    if(!oldPassword || !newPassword){
        throw new CustomError.BadRequestError('one field is missing')
    }
    const user = await User.findOne({_id:req.user.userId})
    if(!user){
        throw new CustomError.BadRequestError('Invalid Credential')
    }
    const isPasswordCorrect = await user.comparePassword(oldPassword)
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError("Invalid credentials")
    }
    user.password = newPassword
    user.save()
    res.status(StatusCodes.OK).json({ msg:'password changed' })
}

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}

// const updateUser = async (req, res)=>{
//     const {name, email} = req.body
//     if(!name || !email){
//         throw new CustomError.BadRequestError('Please provide email and password')
//     }
//     const user = await User.findOneAndUpdate(
//         {_id:req.user.userId},
//         {email,name},
//         {new: true, runValidators:true}
//     )
//     const tokenUser = createTokenUser( user )
//     attachCookiesToResponse({ res, user: tokenUser})
//     res.status(StatusCodes.OK).json({ user:tokenUser })
// }
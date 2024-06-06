const { StatusCodes } = require('http-status-codes')
const Product = require('../models/Product')
const CustomError = require('../errors')
const path = require('path')
const Review = require('../models/Review')

const createProduct= async(req, res)=>{
    req.body.user = req.user.userId
    const product = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({product})
}

const getAllProducts= async(req, res)=>{
    const product = await Product.find({})
    res.status(StatusCodes.OK).json(product)
}

const getSingleProduct= async(req, res)=>{
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
        throw new CustomError.NotFoundError(`No product with id : ${req.params.id}`);
    }
    res.status(StatusCodes.OK).json({product})
}

const updateProduct= async(req, res)=>{
    const {id: productId} = req.params
    const product = await Product.findOneAndUpdate(
        {_id:productId},
        req.body,
        {
            new: true,
            runValidators: true
        }
    ) 
    if(!product){
        throw new CustomError.NotFoundError(`There is no product with id ${productId}`)
    }
    res.status(StatusCodes.OK).json({product})
}

const deleteProduct= async(req, res)=>{
    // const {id : productId} = req.params
    // const product = await Product.findOne({_id : productId})
    // if(!product){
    //     throw new CustomError.NotFoundError(`There is no product with id ${productId}`)
    // }
    
    // res.status(StatusCodes.OK).json({ product })
    const id = req.params.id
    const product = await Product.findOne({_id : id})
    if(!product){
        throw new CustomError.NotFoundError(`Tere is no product with id ${id}`)
    }
    await Product.findOneAndDelete({_id:id})

    await Review.deleteMany({product: product.id})
    res.status(StatusCodes.OK).json({msg:"Deleted"})
}

const uploadImage= async(req, res)=>{
    //check if image file is available
    if(!req.files){
        throw new CustomError.BadRequestError('Please upload a file')
    }

    //if available, assign it to productImage variable
    const productImage = req.files.image
    
    //check if file ia an image file
    if(!productImage.mimetype.startsWith('image')){
        throw new CustomError.BadRequestError('Please upload an image file')
    }

    //assign max size to a variable
    const maxSize = 1024 * 1024

    //throw error if image size is more tha maxSize
    if(productImage.size > maxSize){
        throw new CustomError.BadRequestError('Image size must be smaller than 1MB')
    }

    //create imagePath pointing to /public/uploads that is two levels up
    const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`)

    //move image file to imagePath
    await productImage.mv(imagePath)
    //send image full path as response
    res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}`})
}

module.exports = {
    createProduct, 
    getAllProducts,
    getSingleProduct, 
    updateProduct, 
    deleteProduct, 
    uploadImage
}
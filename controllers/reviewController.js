const { StatusCodes } = require('http-status-codes')
const Review = require('../models/Review')
const CustomError = require('../errors')
const Product = require('../models/Product')
const {checkPermissions} = require('../utils')


const createReview= async(req, res)=>{
    const {product : productId} = req.body
    
    const isProductValid = await Product.findOne({_id:productId})
    if(!isProductValid){
        throw new CustomError.NotFoundError(`No product with id : ${productId}`)
    }

    const alreadySubmited = await Review.findOne({
        product : productId,
        user : req.user.userId
    })

    if(alreadySubmited){
        throw new CustomError.BadRequestError(`Already submited review for this product`)
    }

    req.body.user = req.user.userId
    const review = await Review.create(req.body)
    
    res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews= async(req, res)=>{
    const reviews = await Review.find({}).populate({
        path: 'product',
        select: 'name company price',
      }).populate({
        path:'user',
        select:'name'
      });
    
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
}

const getSingleReview= async(req, res)=>{
    const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
}

const updateReview= async(req, res)=>{
    const {id} = req.params
    const {rating, title, comment} = req.body
    const review = await Review.findOne({ _id:id })
    if(!review){
        throw new CustomError.NotFoundError(`There is no review with id ${id}`)
    }
    checkPermissions(req.user, review.user)
    if (!rating) {
        review.rating = review.rating
        
    } else {
        review.rating = rating
    }
    if (!title) {
        review.title = review.title
        
    } else {
        review.title = title
    }
    if (!comment) {
        review.comment = review.comment
        
    } else {
        review.comment = comment
    }
    await review.save()
    res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
    const {id:reviewId} = req.params
    const review = await Review.findOneAndDelete({ _id: reviewId });
    if (!review) {
      throw new CustomError.NotFoundError(`There is no review with id ${req.params.id}`);
    }
    checkPermissions(req.user, review.user);
  
    res.status(StatusCodes.OK).json({ review });
  };

const getSingleProductReview = async(req, res)=>{
    const {id:productId} = req.params
    const review = await Review.find({product:productId}).populate({
        path:'user',
        select: 'name email'
    })
    res.status(StatusCodes.OK).json({ review })
}


module.exports = {
    createReview, 
    getAllReviews, 
    getSingleReview, 
    updateReview, 
    deleteReview,
    getSingleProductReview
}
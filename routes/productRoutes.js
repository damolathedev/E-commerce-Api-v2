const express = require('express')
const router = express.Router()
const {
    createProduct, 
    getAllProducts,
    getSingleProduct, 
    updateProduct, 
    deleteProduct, 
    uploadImage
} = require('../controllers/productController')
const {
    authenticateUser,
    authorizePermissions
} = require('../middleware/authentication')
const {getSingleProductReview}  = require('../controllers/reviewController')


router.route('/').post(authenticateUser, authorizePermissions('admin'), createProduct).get(authenticateUser, getAllProducts)

router.route('/uploadImage').post(authenticateUser, authorizePermissions('admin'), uploadImage)

router.route('/:id').patch(authenticateUser, authorizePermissions('admin'), updateProduct).delete(authenticateUser, authorizePermissions('admin'), deleteProduct).get(authenticateUser, getSingleProduct)

router.route('/:id/reviews').get(getSingleProductReview)

module.exports = router
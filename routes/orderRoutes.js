const express = require('express')
const router = express.Router()
const {
    authenticateUser,
    authorizePermissions
} = require('../middleware/authentication')
const {
    getAllOrders, 
    getSingleOrder, 
    getCurrentUserOrders,
    createOrder, 
    updateOrder
} = require('../controllers/ordercontroller')



router.route('/').get(authenticateUser, authorizePermissions('admin'), getAllOrders).post(authenticateUser, createOrder).patch(authenticateUser, updateOrder)
router.route('/showAllOredrs').get(authenticateUser, getCurrentUserOrders)
router.route('/:id').get(authenticateUser, getSingleOrder)


module.exports = router
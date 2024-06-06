const Order = require('../models/Order')
const Product = require('../models/Product');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');


const getAllOrders= async(req, res)=>{
    const orders = await Order.find({})
    res.status(StatusCodes.OK).json({ orders, count: orders.length})
}

const getSingleOrder= async(req, res)=>{
    const { id:orderId} = req.params
    const order = await Order.findOne({_id:orderId})
    if(!order){
        throw new CustomError.NotFoundError(`There is no order with id: ${orderId}`)
    }
    checkPermissions(req.user, order.user)
    res.status.json({ order })
}

const getCurrentUserOrders= async(req, res)=>{
    const orders = await Order.find({ user: req.user.userId})
    res.status(StatusCodes.OK).json({ orders, count: orders.length })
}

const fakeStripeApi= async({amount, currency})=>{
    const client_secret = 'someRandomValue'
    return {client_secret, amount}
}

const createOrder= async(req, res)=>{
    const {items:cartItems, tax, shippingFee} = req.body
    if(!cartItems || cartItems.length < 1){
        throw new CustomError.BadRequestError('There is no item in the cart')
    }
    if(!tax || !shippingFee){
        throw new CustomError.BadRequestError('Please provide tax and shipping fee')
    }
    let orderItems = []
    let subTotal = 0

    for(const item of cartItems){
        const dbProduct = await Product.findOne({_id:item.product})
        if(!dbProduct){
            throw new CustomError.NotFoundError(`There is no product with id : ${item.product}`)
        }
        const {name, price, image, _id} = dbProduct
        const singleOrderItem = {
            amount : item.amount,
            name,
            price,
            image,
            product: _id
        }
        orderItems = [...orderItems, singleOrderItem]

        subTotal += item.amount * price
    }
    const total = tax + shippingFee + subTotal

    const paymentIntent = await fakeStripeApi({
        amount: total,
        currency: 'usd'
    })
    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.client_secret,
        user: req.user.userId
    })

    res.status(StatusCodes.CREATED).json({ order, clientSecret:order.clientSecret})
}

const updateOrder= async(req, res)=>{
    const {id:orderId} = req.params
    const { paymenIntentId} = req.body

    const order = await Order.findOne({ _id:orderId })
    if(!order){
        throw new CustomError.NotFoundError(`There is no order with id: ${orderId}`)
    }
    checkPermissions(req.user, order.user)

    order.paymentIntentId = paymenIntentId
    order.status = 'paid'
    await order.save()

    res.status(StatusCodes.OK).json({ order })
}

module.exports = {
    getAllOrders, 
    getSingleOrder, 
    getCurrentUserOrders,
    createOrder, 
    updateOrder
}
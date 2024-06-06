const mongoose = require('mongoose')
const User = require('./User')


const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please provide name']
    },
    price: {
        type: Number,
        required: [true, 'Please provide price'],
        default: 0
    },
    description: {
        type: String,
        required: [true, 'Please provide description'],
        maxlength: [1000, 'Description must not be more than 1000 cahracters']
    },
    image: {
        type: String,
        default: '/uploads/examples.jpeg'
    },
    category: {
        type: String,
        required: [true, 'Please provide category'],
        enum: ['office', 'kitchen', 'bedroom']
    },
    company: {
        type: String,
        required: [true, 'Please provide company name'],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message: '{VALUE} is not supported'
        }
    },
    colors: {
        type: [String],
        required: true  
    },
    featured: {
        type: Boolean,
        default: false
    },
    freeShipping: {
        type: Boolean,
        default: false
    },
    inventory: {
        type: Number,
        default: 15,
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0,
      },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true, toJSON:{virtuals:true}, toObject:{virtuals:true}})


ProductSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    justOne: false
})

ProductSchema.pre('deleteProduct', async function(next){
    await this.model('review').deleteMany({ product:this._id})
    console.log('deleted');
    next()
})

module.exports = mongoose.model('Product', ProductSchema)
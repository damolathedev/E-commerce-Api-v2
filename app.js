require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()

const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')

const rateLimiter = require('express-rate-limit')
const helment = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

const connectDB = require('./db/connect')

const authRouter = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const orderRoutes = require('./routes/orderRoutes')

const notFoundMiddleWare = require('./middleware/not-found')
const errorHandlerMiddleWare = require('./middleware/error-handler')

app.set('trust proxy', 1)
app.use(
    rateLimiter({
        windowMs : 15 * 60 * 1000,
        max: 60
    })
)
app.use(helment())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())


app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(fileUpload())


app.use(express.static('./public'))


app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/review', reviewRoutes)
app.use('/api/v1/orders', orderRoutes)


app.use(notFoundMiddleWare)
app.use(errorHandlerMiddleWare)

const port = process.env.PORT || 8080

const start= async()=>{
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, ()=>console.log(`Server is listening on port ${port}`))
    } catch (error) {
        console.log(error);
    }
}

start()
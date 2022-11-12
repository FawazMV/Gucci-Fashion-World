require('dotenv').config()
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require("body-parser");
//const aws = require('aws-sdk')
const logger = require('morgan')
const multer = require('multer')
//const multers3 = require('multer-s3')
const homeRouter = require('./routes/home')
const adminRouter = require('./routes/admin')

const connectDB = require('./models/connection')
const DATABASE_URL = process.env.DATABASE_URL
connectDB(DATABASE_URL)


app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')

app.use(expressLayouts)
app.use(express.static('public'))
//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/', homeRouter)
app.use('/admin', adminRouter)

app.listen(process.env.PORT || 4444, () => {
    console.log('Server connected successfully');
})




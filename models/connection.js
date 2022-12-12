const mongoose = require('mongoose')
const connectDB = async (DATABASE_URL) => {
    try {
        const DB_OPTIONS = {dbName:'HEXASHOP'}
        await mongoose.connect(DATABASE_URL,DB_OPTIONS)
        console.log('connected to database successfully');
    }catch(error){
        console.log("error");
    }
}



module.exports = connectDB
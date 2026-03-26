const mongoose =require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI =process.env.MONGO_URI;

const  connectDB =async() =>{
    try{
        await mongoose.connect(
            MONGO_URI,{
                serverSelectionTimeoutMS:30000,
                socketTimeoutMS:45000,
                family:4
            }
        );
        console.log(`MongoDB connected Successfully ${MONGO_URI}`);
    } catch(error){
        console.log(error.message)
        process.exit(1);
    }
};

module.exports = connectDB;
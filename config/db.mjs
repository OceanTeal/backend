import mongoose from 'mongoose'

const connectDB = async()=>{
    try{
        
        await mongoose.connect('mongodb://localhost:27017/companydb')
        console.log("MongoDB is connected")

    }catch(err){
        console.log("Error in connect: ", err.message)
    }
}

export default connectDB

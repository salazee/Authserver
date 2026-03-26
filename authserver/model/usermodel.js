const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:6,

    },
    contact:{
        type:Number,
        required:false
    },
    address:{
        type:String,
        required:false
    },
    role:{
        type:String,
        required:true,
        enum:['admin', 'buyer','seller','owner','user'],
        default:"buyer"
    },
    otp:{
        type:String
    },
    isVerified:{
        type:Boolean,
        default:false
    },

    otpExpires: { 
        type: Date 
    }  ,
    
    isActive:{
      type:Boolean
    }  ,
    resetPasswordToken:{
      type:String,
    } ,
    resetPasswordExpires: {
      type:Date,
    },
    failedLoginAttempts:{
        type:Number,
        default:0
    },
    lockUntil:{
        type:Date,
        default:null
    }
    
    },
    {timestamps:true},

)

module.exports =mongoose.model('user', userSchema)
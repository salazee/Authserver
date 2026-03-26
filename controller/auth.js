const User = require('../model/usermodel');
const bcrypt = require('bcrypt');
const dotenv = require ('dotenv');
const crypto =require('crypto'); 
const JWT = require('jsonwebtoken')
const sendEmail = require('../service/nodemailer');

dotenv.config();

const  JWT_SECRET = process.env.JWT_SECRET;

const register = async(req,res) =>{
    try {
        const {name,email,password} = req.body;

        if (!name || !email || !password){
            return res.status(400).json({message:"Please provide all required fields"});
        }
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({message:"User with this email already exists"});
        }

        const generateToken = () =>{
            return Math.floor(100000+ Math.random()*900000).toString();
        }
        const otp = generateToken();
        // console.log("This is Your Otp:", otp);
        

        const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const user = new User({
        name:name.trim(),
        email:email,
        password:hashedPassword,
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000,
        isVerified:false
    });
    await user.save();
 
    // Send OTP email
    await sendEmail.sendMail({
        to:user.email,
        subject: "Verify your account",
       html:`
         <p>Your OTP for account verification is: <b>${otp}</b>. It will expire in 10 minutes.</p>
        <p>Do not share this OTP with anyone.</p>
        <p>If you did not request this, please ignore this email.</p>`
    });
    
    return res.status(200).json({message:"User registered successfully, Please check your email for OTP to verify your account"});

    } catch (error) {
        res.status(500).json({message:"Internal server error", error:error.message});    
    }
}


const verifyEmail = async(req,res) =>{
    try {
        const {email, otp} = req.body;

        if(!email || !otp){
            return res.status(400).json ({
                message:"Please provide both email and OTP"
            });
            }
        
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        if(user.isVerified){
            return res.status(400).json({message:"User already verified"});
        }
        if(user.otp !== otp){
            return res.status(400).json({message:"Invalid OTP"});
        }

        if(user.otpExpires < Date.now()){
            return res.status(400).json({message:"OTP has expired"});
        }

        // Mark user as verified and clear OTP fields
        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;

        await user.save();

        res.status(200).json({message:"Email verified successfully"});
    } catch (error) {
        res.status(500).json({message:"Internal server error"});
        console.error("Error in verifyEmail:", error.message);
    }
};

const forgetPassword = async(req,res) =>{
    try {
        const {email} = req.body;

        if(!email){
            return res.status(400).json({message:"Please provide your email"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"If this email exist, you will receive an email shortly"});
        }
        const resetToken = crypto.randomBytes(32).toString('hex');

        user.resetPasswordToken =crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

        const existingToken = await User.findOne({resetPasswordToken: hashedToken});
        if(existingToken) {
            return res.status(400).json({message:"Please try again"});
        }

        user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; 
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

        await sendEmail.sendMail({
            to: user.email,
            subject:"Password Reset Request" ,  
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
            <p><a href="${resetUrl}">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>`
        });
        res.status(200).json({message:"Password reset email sent successfully"});
    } catch (error) {
        res.status(500).json({message:"Internal server error"});
        console.error("Error in forgotPassword:", error.message);
    }   
};

const resetPassword = async(req,res) =>{
    try {
      const hashedToken =crypto.
      createHash('sha256')
      .update(req.params.token)
      .digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {$gt: Date.now()}
      });
      if(!user){
        return res.status(400).json({message:"Invalid or expired reset token"});
        
      }

      const salt =await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);

      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;

      await user.save();
      
       return res.status(200).json({message:"Password reset successfully"});
    }
        catch (error) {
       return res.status(500).json({message:"Internal server Error", error:error.message});
}
   
}; 

const ResendOtp = async(req,res) =>{
    try {
        const {email} = req.body;

        if(!email){
            return res.status(400).json({message:"Please provide your email"});
        }
const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        if(user.isVerified){
            return res.status(400).json({message:"User already verified"});
        }
        const generateToken = () =>{
            return Math.floor(100000+ Math.random()*900000).toString();}
        

        const otp = generateToken();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; 
        await user.save();

        // Send OTP email
        await sendEmail.sendMail(
            {
                to:user.email,
                subject:"Resend OTP",
                html:`
                <h3>Here is your new OTP</h3>
                <p>Your new OTP is: <b>${otp}</b>. It will expire in 10 minutes.</p>
                <p>Do not share this OTP with anyone.</p>
                <p>If you did not request this, please ignore this email.</p>
                `
            });
    return res.status(200).json({message:"OTP resent successfully"});

    } catch (error) {
        res.status(500).json({message:"Internal server error", error:error.message});
        console.error("Error in ResendOtp:", error.message);
    }
};


const login = async(req,res) =>{
    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({message:"Invalid email or password"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid email or password"});

        }

        if (user.lockUntil && user.lockUntil > Date.now()) {
          const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
          return res.status(403).json({
            message: `Account locked. Try again in ${minutesLeft} minute(s).`
          });
        }

        if(!user.isVerified){
            return res.status(400).json({message:'Please verify your email before logging in'});
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            //wrong password - number of failed attemps icreased)
            user.failedLoginAttempts += 1

            if (user.failedLoginAttempts>=5){
                user.lockUntil= new Date(Date.now() + 45*60*1000);
                user.failedLoginAttempts =0; //reset counter 

                await user.save();
                return res.status(403).json({
                    message: "Too many failed attempts. Account locked for 45 minutes"
                })
            }
            await user.save();
            return res.status(400).json({message:"Invalid email or password"});
        }

        //generate JWt TOKEN
        const token = JWT.sign({
            userId: user._id,
            role: user.role
},
        JWT_SECRET,
        {expiresIn:"7d"}
        );

        return res.status(200,).json({ message:"Login successful", 
            token,
        user:{
            id:user._id,
            name:user.name,
            email:user.email,
            role:user.role
        }
            
        });

    } catch (error) {
       return res.status(500).json({message:"Internal server error", error: error.message});      
    }
}

module.exports = {register, verifyEmail, forgetPassword, ResendOtp, login, resetPassword};

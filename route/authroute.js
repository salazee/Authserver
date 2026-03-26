const {register, verifyEmail,login,resetPassword,forgetPassword,ResendOtp} = require('../controller/auth');
const express = require('express');
const router = express.Router();
// const {authMidware} = require('../middleware/authmiddleware');

router.post('/register', register);
router.post('/verifyemail', verifyEmail);
router.post('/login', login);
router.post('/resetpassword/:token', resetPassword);
router.post('/forgetpassword/', forgetPassword);
router.post('/resendotp', ResendOtp);

module.exports = router;
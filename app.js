const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const authRoute = require('./route/authroute');

dotenv.config();

const PORT = process.env.PORT ||5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors());

app.use(helmet());
app.use(rateLimit({
    windowMs: 45* 60 * 1000,
    max: 10,
    standardHeaders:true,
    legacyHeaders:false,
    skipSuccessfulRequests:true,
    message: "Too many requests from this IP, please try again after 45 minutes"
}));    
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/health', async (req, res) => {
    try {
      // Optional: Add a quick database ping here to ensure it's alive
      // await db.authenticate(); 
      
      res.status(200).json({ status: 'UP', timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ status: 'DOWN', error: error.message });
    }
  });
  

app.use ('/auth', authRoute);

app.use((req,res,next) =>{
    console.log(req.method,  req.url);
    next();
});
connectDB();

app.listen(PORT, ()=>{
    console.log(`Server running at ${PORT}`)
});

module.exports =app;

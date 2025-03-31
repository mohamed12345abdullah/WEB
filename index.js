const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
}); 
 
app.use(cors());

app.use(express.json());

app.use("/",express.static('public'));
  

const memberRouter=require('./router/member.js');

app.use('/api', memberRouter); 
 
 




app.use("*",(req,res)=>{
    res.status(404).json({
        status:404,
        message:"Page not found"
    })
})
app.use(async(error,req,res)=>{
    res.status(error.statusCode || 500).json({
        status:error.statusCode || 500,
        message:error.message || "Internal Server Errorrr"
    })
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

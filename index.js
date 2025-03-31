const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/robotics', { useNewUrlParser: true, useUnifiedTopology: true });


app.use(express.json());


const memberRouter=require('./router/member.js');

app.use('/api', memberRouter);




app.use(async(error,req,res)=>{
    res.status(error.statusCode || 500).json({
        status:error.statusCode || 500,
        message:error.message || "Internal Server Errorrr"
    })
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

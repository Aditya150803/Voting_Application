////Importing Modules which are required to set up the server
const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const bodyParser = require('body-parser');                            
app.use(bodyParser.json()); 

//Importing router files
const userRouter = require('./Routes/userRouter');
const candidateRouter = require('./Routes/candidateRouter');

//Using the routers
app.use('/user', userRouter);
app.use('/candidate', candidateRouter);

app.listen(PORT, ()=>{ 
    console.log("Listening at port 3000")
});
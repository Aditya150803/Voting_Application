require('dotenv').config();
const jwt = require('jsonwebtoken');

//Token verification
const jwtAuthMiddleware = (req, res, next) =>{
    //First check the request header has authorization or not
    const authorization = req.headers.authorization;
    if(!authorization) return res.status(401).json({error: "Token Not Found"})

    //Extract the jwt token from the request headers    
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({error: "Unauthorized. Log in again."});

    //if token found, then verify the jwt using verify() function
    try{
        //This function will return the payload of the jwt which contains user info
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        //Attach user information to the request object
        req.user = decoded;
        next();
    }catch(err){
        console.log(err);
        res.status(401).json({err: "Invalid Token"});
        next();
    }
}

//Token Generation
const generateJWT = (userData) =>{
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: 1800});
}

module.exports = {jwtAuthMiddleware, generateJWT};
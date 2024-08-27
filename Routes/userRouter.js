//This file contains all the DB functionalities of User schema
const express = require('express');
const router = express.Router();

const User = require('../Models/user');
const {jwtAuthMiddleware, generateJWT} = require('../jwt'); 


//Route to create a new user - Signup route
router.post('/signup', async(req, res) =>{
    try {
      const data = req.body;//Assuming the request body conatains all the required user data
      
      //Check if the role is admin
      if(data.role === 'admin'){
        const adminCount = await User.countDocuments({role: 'admin'});
        //If admin already exists
        if(adminCount>0){
          return res.status(403).json({error:"Only one admin can exist"});
        }
      }

      //Create a new user document using mongoose model
      const newUser = new User(data);

      //Save the new user in the database
      const response = await newUser.save();
      console.log("data saved");

      //Generate token
      const payload = {
        id: response.id // Only ID is being sent as a token
        /*We could have sent AADHAAR no. in it. But if any unauthorized person finds the token,
        then he/she will know the AADHAAR no. of that specific user and can misuse it. 
        */
      };
      const token = generateJWT(payload); //Token generation

      //Token is sent to the user as a response
      res.status(200).json({response: response, token: token});
    } 
    catch (error) {
      console.log(error);
      res.status(500).json({error: "Internal server error"});
    }
});

//Route to log in an existing user - Login route
router.post('/login', async(req, res)=>{
    try{
      //Extract username and password from request body
      const {aadhaarNo, password} = req.body;
      
      //Find the user by aadhaarNo given by the user
      const user = await User.findOne({aadhaarNo: aadhaarNo});
   
      //If user doesn't exist or password doesn't match 
      if(!user || !(await user.comparePassword(password))){
        return res.status(400).json({error: "Invalid user or password"});
      }

      //If user was found and password matches, then generate Token
      const payload = {
        id: user.id
      }
      const token = generateJWT(payload);

      //Return the token to the user as a response
      res.json({token: token});
    }
    catch(err){
      console.log(err);
      res.status(500).json({error: "Internal Server Error"});
    }
});

//Route to get the profile of an existing user - Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res)=>{
    try{
        const userData = req.user;
        const userID = userData.id;

        //Find the person's data using ID
        const user = await User.findById(userID);

        //Send all the info of the user as a response
        res.status(200).json({user})
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
    }
});

//Route to update the profile password of a user - Password update route
router.put('/profile/password', jwtAuthMiddleware, async (req, res) =>{
    try{
        const userId = req.user.id; //Extract Id from the session
        const {currentPassword, newPassword} = req.body;// Extract current & new password from the req body

        //Find the user by userId
        const user = await User.findById(userId);
        
        //If password doesn't match, then return error
        if(!(await user.comparePassword(currentPassword))){
            res.status(401).json({error: "Invalid current password"});
        }

        //If password matches, then update the password
        user.password = newPassword;
        await user.save();

        console.log("password updated");  
        res.status(200).json({message: "Password updated successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
    }
});

module.exports = router;
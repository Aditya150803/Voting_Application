//All operations through this route shall be done by an admin

const express = require('express');
const router = express.Router();

const User = require('./../Models/user');
const Candidate = require('../Models/candidate');
const {jwtAuthMiddleware} = require('../jwt');  

//Function to check the role is admin or not
const checkAdminRole = async (userId) =>{
  try{
    const user = await User.findById(userId);
    return user.role === 'admin';
  }
  catch(err){
    return false;
  }
}

//Route to create a new candidate document
router.post('/',jwtAuthMiddleware, async(req, res) =>{
    try {
      const userId = req.user.id;

      //Check for admin role
      if(!(await checkAdminRole(userId))){
        return res.status(403).json({message: "Authorization denied. The user doesn't have the admin role."});
      }

      const data = req.body;//Assuming the request body contains all the required candidate data

      //Create a new candidate document using mongoose model
      const newCandidate = new Candidate(data);

      //Save the new candidate in the database
      const response = await newCandidate.save();
      console.log("Candidate data saved");
      res.status(200).json({response: response});
    } 
    catch (error) {
      console.log(error);
      res.status(500).json({error: "Internal server error"});
    }
})

//Route to update candidate's credentials
router.put('/:candidateId',jwtAuthMiddleware, async (req, res) =>{
    try{
      const userId = req.user.id;

      //Check for admin role
      if(!(await checkAdminRole(userId))){
        return res.status(403).json({message: "Authorization denied"});
      }

      const candidateId = req.params.candidateId;//Extract the id from the URL parameter
      const updatedCandidateData = req.body;//Updated data of the candidate
      const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData,{
        new: true,
        runValidators: true
      })

      //If candidate not found
      if(!response){
        res.status(404).json({error: 'Candidate not found!!!'});
      }

      //Send response
      console.log("candidate data updated");
      res.status(200).json({response : "Data updated successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
    }
})

//Route to delete a candidate document
router.delete('/:candidateId',jwtAuthMiddleware, async (req, res) =>{
  try {
    const userId = req.user.id;

    //Check for admin role
    if(!(await checkAdminRole(userId))){
      return res.status(403).json({message: "Authorization denied"});
    }

    const candidateId = req.params.candidateId;//Extract candidateID from the URL parameter

    //Find the candidate by candidateID and delete it
    const response = await Candidate.findByIdAndDelete(candidateId);

    //If candidate not found
    if(!response){
      res.status(404).json({error:'Candidate not found!!!'});
    }

    //Send response
    console.log("Candidate record deleted");
    res.status(200).json({message: "Candidate deleted successfully"});
    
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({error: "Internal server error"});
  }
})

//Route to get the candidate list 
router.get('/', async (req, res) =>{
  try{
    const candidate = await Candidate.find();
    //candidate contains all the data like id,name, party, age, votes and voteCounts
    //We can't send all the data to the user. 
    //So we map the data to send only id, name and party
    const record = candidate.map((data) =>{
      return {
        id: data.id,
        name: data.name,
        party: data.party
      }
    })
    res.status(200).json({record}); //
    console.log("candidate data fetched");
  }
  catch(error){
    console.log(error);
    res.status(500).json({error: "Internal server error"});
  }
})

//Route to vote to a specific candidate using candidateId
router.post('/vote/:candidateId',jwtAuthMiddleware, async (req, res) =>{
  const candidateId =  req.params.candidateId;//Extract candidate ID from the URL parameter
  const userId = req.user.id;//Extract the user ID from the token
  try{
    //Find the specified candidate by candidateId
    const candidate = await Candidate.findById(candidateId);

    //If candidate not found
    if(!candidate){
      return res.status(400).json({message: "Candidate not found"});
    }

    //Find the user by userId
    const user = await User.findById(userId);
    //If user is an admin
    if(user.role === 'admin'){
      return res.status(403).json({message: "Admin is not allowed to vote"});
    }
    //If user has already voted
    if(user.hasVoted === true){
      return res.status(400).json({message: "You have already voted"});
    }

    //Update the candidate document to record the vote
    candidate.votes.push({user: userId});
    candidate.voteCount++;
    await candidate.save();

    //Update the user document 
    user.hasVoted = true;
    await user.save();

    res.status(200).json({message: "Your vote recorded successfully"});
  }
  catch(err){
    console.log(error);
    res.status(500).json({error: "Internal server error"});
  } 
})

//Route to get the sorted list of candidates with their vote counts
router.get('/vote/count', async (req, res) =>{
  //Find all the candidates in a descending order of their vote count
  const candidate = await Candidate.find().sort({voteCount: 'desc'});

  //Map the candidate to return only name and vote count
  const voteRecord = candidate.map((data)=>{
    return {
      party: data.party,
      voteCount: data.voteCount
    }
  });
  res.status(200).json({voteRecord});
})

module.exports = router;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 

//Definition of a schema for the person's data to be saved 
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    mobile: {
        type: String
    },
    email: {
        type: String
    },
    address: {
        type: String, 
        required: true
    },
    aadhaarNo: {
        type: Number,
        required: true, 
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String, 
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    hasVoted: {
        type: Boolean,
        default: false
    }
})

//This middleware will execute before any save operation is done
userSchema.pre('save', async function (next) {
    const user = this;
   
    /*Logic to not hash the password if any other save operation rather than password  
     save is being performed.(Because the password must be already hashed)*/
    if(!(user.isModified('password') || user.isModified('role'))) return next();
   
    //Hash the password only if the password is updated or new
    try{
        //Generating salt
        const salt = await bcrypt.genSalt(10);

        //Hashing password
        const hashedPassword = await bcrypt.hash(user.password, salt);

        //Storing the hashed password in DB
        user.password = hashedPassword;
        next();
    }
    catch(err){
        next(err);
    }
})

//Function to compare the saved password with the entered password
userSchema.methods.comparePassword = async function (candidatePassword){
    try{
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }
    catch(err){
        throw err;
    }
}

const User = mongoose.model('User', userSchema);
module.exports = User;

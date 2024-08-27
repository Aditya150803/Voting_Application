//db.js file acts like a central module which manages the connection of MongoDB with local server using Mongoose. 
const mongoose = require('mongoose');
require('dotenv').config();

// const mongoURL = process.env.MONGODB_URL_LOCAL;
const mongoURL = process.env.MONGODB_URL;

// Define MongoDB URL
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//Mongoose maintains a constant connection object
const db = mongoose.connection;

db.on('connected', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (err) => {
  console.log('Mongoose connection error: ' + err);
});

db.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

//Export the database connection object
module.exports = db;
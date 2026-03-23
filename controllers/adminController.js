const fs = require('fs/promises');

const User = require('../models/user-model.js')
const Movie = require('../models/movie-model.js')
const Review = require('../models/review-model.js')

// Show admin page with all users
exports.showAdminHome = async (req, res) => {
  try {
    let users = await User.find();
    res.render('admin-home', {Users: users});
  } catch (error) {
    console.error(error);
    res.send("Error reading database");
  }
};

// Show users marked for deletion
exports.getMarkedUsers = async (req, res) => {
  try {
    let emails = req.body.emails; // Get emails from form
    if (typeof emails === 'string') {
      emails = [emails]; // Convert single email to array
    }
    
    let users = await User.find({email: {$in: emails}}); // Searched it is a MongoDB operator that searches for values inside an array. So it finds users with matching emails
    res.render('user-delete-confirmation', {result: users});
  } catch (error) {
    console.error(error);
    res.send("Error reading database");
  }
};

// Delete users from database
exports.deleteUsers = async (req, res) => {
  try {
    let emails = req.body.emails;
    if (typeof emails === 'string') {
      emails = [emails];
    }
    
    let success = await User.deleteMany({email: {$in: emails}}); // Delete users with matching emails
    
    if (success.deletedCount > 0) {
      res.send(`${success.deletedCount} user(s) have been successfully banned. <a href="/admin">Back to admin</a>`);
    } else {
      res.send("No users deleted. <a href='/admin'>Back</a>");
    }
  } catch (error) {
    console.error(error);
    res.send("Error deleting users");
  }
};

// Show form to create new user
exports.showCreateUserForm = async (req, res) => {
  try {
    res.render('create-user', {result: ""});
  } catch (error) {
    console.error(error);
  }
};

// Create new user in database as an admin
exports.createUser = async (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;

  let newUser = {
    name: name,
    email: email,
    password: password,
    admin: false
  };

  try {
    let existingUser = await User.findOne({email: email});
    if (existingUser) {
      return res.render('create-user', {result: "User with this email already exists!"});
    }
    
    let result = await User.addUser(newUser);
    console.log("User created:" + result);
    res.render('create-user', {result: result || null});
  } catch (error) {
    console.error(error);
    let result = "fail";
    res.render('create-user', {result});
  }
};

// Make user an admin
exports.makeUserAdmin = async (req, res) => {
  let email = req.body.email;
  
  try {
    let success = await User.updateAdminStatus(email, true);
    console.log(success);
    
    if (success.modifiedCount > 0) {
      res.send(`User is now an admin. <a href="/admin">Back to admin</a>`);
    } else {
      res.send("Could not update user. <a href='/admin'>Back</a>");
    }
  } catch (error) {
    console.error(error);
    res.send("Error updating user. <a href='/admin'>Back</a>");
  }
};
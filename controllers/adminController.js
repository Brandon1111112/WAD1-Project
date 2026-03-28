const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const User = require('../models/user-model.js')
const Movie = require('../models/movie-model.js')
const Review = require('../models/review-model.js')

// Show admin page with all users
exports.showAdminHome = async (req, res) => {
  try {
    let users = await User.find();
    res.render('admin-home', {Users: users, error: null, message: null});
  } catch (error) {
    console.error(error);
    res.render('admin-home', {Users: [], error: 'Error reading database'});
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
    let users = await User.find();
    res.render('admin-home', {Users: users, error: 'Error reading database', message: null});
  }
};

// Delete users from database
exports.deleteUsers = async (req, res) => {
  try {
    let emails = req.body.emails;
    if (typeof emails === 'string') {
      emails = [emails]; //Handle when only one email 
      //Convert single email to array if only one user was selected for deletion, so it can be processed by $in operator in deleteMany. If multiple users were selected, it is already an array and will be processed correctly.
    }
    
    let success = await User.deleteMany({email: {$in: emails}}); // Delete users with matching emails with email as the key. 
    
    if (success.deletedCount > 0) { //deleteMany provides deletedCount to indicate how many were deleted built-in 
      res.render('delete-success', {deletedCount: success.deletedCount});
    } else {
      let users = await User.find();
      res.render('admin-home', {Users: users, error: 'No users selected for deletion', message: null});
    }
  } catch (error) {
    console.error(error);
    let users = await User.find();
    res.render('admin-home', {Users: users, error: 'Error deleting users', message: null});
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

  try {
    const { name, email, password } = req.body;
    // Validate all required fields
    if (!name || !email || !password) {
        let users = await User.find();
        return res.render('admin-home', { Users: users, error: 'Please enter all fields', message: null });
    }

    let existingUser = await User.findOne({email: email});
    if (existingUser) {
      let users = await User.find();
      return res.render('admin-home', { Users: users, error: 'User with this email already exists!', message: null }); 
    }
        // Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        name,
        email,
        password: hashedPassword, // Use 'password' field to match schema
        admin: false
    });
    
    let result = await User.addUser(newUser);
    console.log("User created:" + result);
    let users = await User.find();
    res.render('admin-home', { message: 'User created successfully!', Users: users, error: null });
  } catch (error) {
    console.error(error);
    let users = await User.find();
    res.render('admin-home', { Users: users, error: 'Error creating user', message: null }); //Only does this if cannot create user still pulls to try display users available.
  }
};

// Make user an admin for admin privileges (Admin/SuperAdmin can do so)
exports.makeUserAdmin = async (req, res) => {
  let email = req.body.email;
  
  try {
    let success = await User.updateAdminStatus(email, true);
    console.log(success);
    
    if (success.modifiedCount > 0) {
      res.render('admin-status-success', {message: 'User is now an admin'});
    } else {
      let users = await User.find();
      res.render('admin-home', {Users: users, error: 'Could not update user', message: null});
    }
  } catch (error) {
    console.error(error);
    let users = await User.find();
    res.render('admin-home', {Users: users, error: 'Error updating user', message: null});
  }
};

exports.demoteUserAdmin = async (req, res) => {
  let email = req.body.email;
  let currentUser = req.session.user;
  
  let users = await User.find();
  // Only superadmin can demote //Redundant code since now only superadmin can access this function but JIC this will prevent normal admins from demoting other admins.
  if (!currentUser.superAdmin) { //If NOT (False) == True then return error message. So only super admin can access this function
    return res.render('admin-home', {Users: users, error: 'Only super admin can demote admins', message: null});
  }
  
  let success = await User.updateAdminStatus(email, false);
  
  if (success.modifiedCount > 0) {
    res.render('admin-status-success', {message: 'User has been demoted'});
  } else {
    res.render('admin-home', {Users: users, error: 'Could not update user', message: null});
  }
};
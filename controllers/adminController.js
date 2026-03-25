const fs = require('fs/promises');
const bcrypt = require('bcrypt');
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
    
    if (success.deletedCount > 0) { //deleteMany provides deletedCount to indicate how many were deleted
      res.send(` <div style="
        margin: 0;
        font-family: 'Source Sans 3', system-ui, sans-serif;
        background: #0d0d0d;
        color: #f0f0f0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    ">
        <div style="
            background: #161618;
            border: 1px solid #2a2a2e;
            border-radius: 10px;
            padding: 40px 48px;
            text-align: center;
        ">
            <div style="font-size: 2rem; margin-bottom: 12px;">🚫</div>
            <h2 style="
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 8px;
            ">${success.deletedCount} user(s) successfully banned</h2>
            <a href="/admin" style="
                color: #e50914;
                text-decoration: none;
                font-size: 0.9rem;
            ">← Back to Admin</a>
        </div>
    </div>
`);
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

  try {
    const { name, email, password } = req.body;
    // Validate all required fields
    if (!name || !email || !password) {
        return res.render('admin-home', { error: 'Please enter all fields' });
    }

    let existingUser = await User.findOne({email: email});
    if (existingUser) {
      return res.render('admin-home', { error: 'User with this email already exists!' });
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
    res.render('admin-home', { message: 'User created successfully!', Users: users });
  } catch (error) {
    console.error(error);
    let result = "fail";
    res.render('admin-home', { error: 'Error creating user' });
  }
};

// Make user an admin for admin privileges (Admin/SuperAdmin can do so)
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

exports.demoteUserAdmin = async (req, res) => {
  let email = req.body.email;
  let currentUser = req.session.user;
  
  // Only superadmin can demote
  if (!currentUser.isSuperAdmin) { //If NOT (False) == True then return error message. So only super admin can access this function
    return res.send("Only super admin can demote admins. <a href='/admin'>Back</a>");
  }
  
  let success = await User.updateAdminStatus(email, false);
  
  if (success.modifiedCount > 0) {
    res.send(`User has been demoted. <a href="/admin">Back to admin</a>`);
  } else {
    res.send("Could not update user. <a href='/admin'>Back</a>");
  }
};
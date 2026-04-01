const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const User = require('../models/user-model.js');
const Movie = require('../models/movie-model.js');
const Review = require('../models/review-model.js');
const Logs = require('../models/logs-model.js');
const Watchlist = require('../models/watchlist-model');

// Show admin page with all users
exports.showAdminHome = async (req, res) => {
  try {
    let users = await User.find();
    
    // Get filter parameters
    const { search, roles } = req.query;
    let filtered = users;
    
    // Filter by search term (email or name)
    if (search && search.trim()) { //Trim whitespace and check if search is not empty to prevent unnecessary filtering when search is just spaces. //As long as it returns false it will not filter and just return all users. So only when there is an actual search term it will filter.
      filtered = filtered.filter(u => //u is each user from the filtered array and it checks if either email or name includes the search term. If it returns true it's kept in filtered results. Else if false, user is excluded from results.
        u.email.toLowerCase().includes(search.toLowerCase()) || //This allows for search operator to match either email or name.
        u.name.toLowerCase().includes(search.toLowerCase()) 
      );
    }
    
    // Filter by roles
    if (roles && roles.length) { //Only filter if at least one role is selected. If not just return all users.
      const roleArray = Array.isArray(roles) ? roles : [roles]; //If only one role is selected then it will be a string, so check and then convert to array for single string else it would already be array. Simple check.
      filtered = filtered.filter(u => { //Each person in the filtered array is checked against the selected roles. If any of the conditions match.
        if (roleArray.includes('superadmin') && u.superAdmin) return true; 
        if (roleArray.includes('admin') && u.admin && !u.superAdmin) return true;
        if (roleArray.includes('user') && !u.admin) return true;
        return false; // Exclude users that don't match any selected role
      });
    }
    
    res.render('admin-home', {
      Users: filtered, 
      error: null, 
      message: null,
      searchQuery: search || '', // OR empty string if search is undefined to prevent issues in EJS template
      selectedRoles: Array.isArray(roles) ? roles : (roles ? [roles] : []) // Always convert to array so checkboxes stay checked
    }); // If Roles is an array, use it, else if string convert to array else prepare for undefined case therefore return empty array. 
  } catch (error) {
    console.error(error);
    res.render('admin-home', {Users: [], error: 'Error reading database', searchQuery: '', selectedRoles: []});
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
    res.render('admin-delete-confirmation', {result: users});
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
    // Find users to be deleted and delete from watchlist
    const usersToDelete = await User.find({ email: { $in: emails } });
    const userIds = usersToDelete.map(user => user._id);

    await Watchlist.deleteMany({ userId: { $in: userIds } });
    await Logs.deleteMany({ userId: { $in: userIds } });

    await Logs.createALog(req.session.user.userId, `Deleted ${userIds.length} user/s`, 'admin');

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
    await Logs.createALog(req.session.user.userId, `Added a new user ${newUser.name}`, 'admin', result._id, 'User');
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
    const userToPromote = await User.findOne({ email:email });
    if (success.modifiedCount > 0) {
      await Logs.createALog(req.session.user.userId, `Promoted ${userToPromote.name} to admin`, 'admin', userToPromote._id, 'User');
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
  
  const userToDemote = await User.findOne({ email:email });
  await Logs.createALog(currentUser.userId, `Demoted ${userToDemote.name} to user`, 'admin', userToDemote._id, 'User');

  let success = await User.updateAdminStatus(email, false);
  
  if (success.modifiedCount > 0) {
    res.render('admin-status-success', {message: 'User has been demoted'});
  } else {
    res.render('admin-home', {Users: users, error: 'Could not update user', message: null});
  }
};

exports.showLogs = async (req,res) => {
  try {
    const userId = req.params.userID;

    const user = await User.findById(userId);
    const userLogs = await Logs.find({userId:userId})
        .sort({ createdAt: -1 });

    res.render('logs', {userLogs, user})
  } catch(error){
    console.log(error);
    res.status(500).send('Error fetching logs');
  }
  
};
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth-middleware');


// HOME
router.get('/home', auth.isLoggedIn, (req, res) => { // Render index page (with auth)
    res.render('home');
});

// LOGIN
const { loginUser } = require("../controllers/loginController");

router.get('/login', (req, res) => { //Render login page
    res.render('login', { error: null });
});

router.post('/login', loginUser) //Handle login form submission

// REGISTER
const { registerUser } = require("../controllers/registerController");

router.get('/register', (req, res) => { //Render register page
    res.render('register', { error: null });
});

router.post('/register', registerUser) //Handle register form submission

// PROFILE
const profileController = require("../controllers/profileController");

router.get('/profile', auth.isLoggedIn, profileController.getProfile); //Render profile page

router.get('/profile/edit', auth.isLoggedIn, profileController.renderEditProfile); //Render profile edit page

router.post("/profile/edit", profileController.editUser); // Route to POST the profile edit

router.get('/profile/logout', profileController.logout); // Route to logout

router.get('/profile/delete', auth.isLoggedIn, profileController.renderDeleteUser); // Route to render delete confirmation page

router.post('/profile/delete', auth.isLoggedIn, profileController.deleteUser); // Route to delete user account



module.exports = router;
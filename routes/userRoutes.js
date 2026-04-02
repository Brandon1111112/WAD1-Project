const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth-middleware');
const userController = require("../controllers/userController");

// HOME
router.get('/', (req, res) => { // Render index page (with auth)
    res.render('home');
});

// LOGIN
router.get('/login', (req, res) => { //Render login page
    res.render('login', { error: null });
});

router.post('/login', userController.loginUser) //Handle login form submission

// REGISTER

router.get('/register', (req, res) => { //Render register page
    res.render('register', { error: null });
});

router.post('/register', userController.registerUser) //Handle register form submission

// PROFILE

router.get('/profile', auth.isLoggedIn, userController.getProfile); //Render profile page

router.get('/profile/edit', auth.isLoggedIn, userController.renderEditProfile); //Render profile edit page

router.post("/profile/edit", userController.editUser); // Route to POST the profile edit

router.get('/profile/logout', userController.logout); // Route to logout

router.get('/profile/delete', auth.isLoggedIn, userController.renderDeleteUser); // Route to render delete confirmation page

router.post('/profile/delete', auth.isLoggedIn, userController.deleteUser); // Route to delete user account



module.exports = router;
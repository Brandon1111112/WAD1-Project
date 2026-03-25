const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth-middleware')
const profileController = require("../controllers/profileController");



//Render profile page
router.get('/', auth.isLoggedIn, profileController.getProfile);

//Render profile edit page
router.get('/edit', auth.isLoggedIn, profileController.renderEditProfile);

// Route to POST the profile edit
router.post("/edit", profileController.editUser);

// Route to logout
router.get('/logout', profileController.logout);

module.exports = router;


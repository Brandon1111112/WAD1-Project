const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth-middleware');

// Render index page (with auth)
router.get('/', auth.isLoggedIn, (req, res) => {
    res.render('home');
});

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth-middleware')

router.get('/', (req, res) => { //Render index page
router.get('/', auth.isLoggedIn, (req, res) => { //Render index page
    res.render('home');
});

module.exports = router;
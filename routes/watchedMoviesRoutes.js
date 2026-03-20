const express = require('express');
const router = express.Router();
const Movie = require('../controllers/movieController')
const auth = require('../middlewares/auth-middleware')

router.get('/', auth.isLoggedIn, (req,res) => {
    res.send('works')
})

module.exports = router;
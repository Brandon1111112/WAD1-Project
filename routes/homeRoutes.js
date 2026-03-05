const express = require('express');
const router = express.Router();

router.get('/', (req, res) => { //Render index page
    res.render('home');
});

module.exports = router;
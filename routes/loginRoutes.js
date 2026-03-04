const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const email = req.query.email;
    const password = req.query.password;
    res.render('login');
});

module.exports = router;
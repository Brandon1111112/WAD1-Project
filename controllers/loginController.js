const fs = require('fs/promises')
const bcrypt = require('bcrypt');
//Get Model
const User = require('../models/user-model')

//Data validation of Login details
exports.loginUser = async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    const match = await bcrypt.compare(password, user.password);
    try {
        if (!user) {
            console.log("Email Not Found")
            return res.render('login', { error: "Email not found" })
        }
        if (!match) {
            console.log("Wrong Password")
            return res.render('login', { error: "Wrong password" })
        }
        
        // success
        // initialised session with user infos
        req.session.user = {
            userId: user._id
        }
        
        console.log("Success")
        if (user.admin === true){
            console.log('admin')
            return res.redirect('/admin')
        }
        res.redirect('/home')
       
        
    } catch (err) {
        res.render('login', { error: "Server error" })
    }
}
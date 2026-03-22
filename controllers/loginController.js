const fs = require('fs/promises')

//Get Model
const User = require('../models/user-model')

//Data validation of Login details
exports.loginUser = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            console.log("Email Not Found")
            return res.render('login', { error: "Email not found" })
        }
        if (user.password !== password) {
            console.log("Wrong Password")
            return res.render('login', { error: "Wrong password" })
        }
        
        // success
        // initialised session with user infos
        req.session.user = {
            userId: user.email,
            userName: user.name,
            isAdmin: user.admin
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
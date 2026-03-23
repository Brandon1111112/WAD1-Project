const User = require('../models/user-model'); // Get user model to check if watched or not

exports.editUser = async (req, res) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const user = req.session.user
    const userId = req.session.user.userId
    // check duplicate email
    const existingUser = await User.findOne({
        email,
        _id: { $ne: userId } //Exclude current email 
    });

    // If any of the fields is not filled, return error
    if (!email || !password || !name) {
        return res.render('editProfile', {
            user: user,
            error: 'Please Enter All Fields'
        });
    }

    //If User exists, return an error that Email already exists
    if (existingUser) {
        return res.render('editProfile', {
            user: user,
            error: 'Email already in use'
        });
    }

    const updateData = {
        name,
        email,
        password
    };

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true } //Returns updated user and making sure schema validation is valid
    );

    // update session
    req.session.user = {
        userId: updatedUser._id,
        userName: updatedUser.name,
        email: updatedUser.email,
        password: updatedUser.password,
        isAdmin: updatedUser.admin,
        profilePic: user.profilePic
    };
    
    res.redirect('/profile');
}
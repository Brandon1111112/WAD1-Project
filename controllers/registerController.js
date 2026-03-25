const bcrypt = require('bcrypt');
const User = require('../models/user-model');

// Register new user with validation
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate all required fields
        if (!name || !email || !password) {
            return res.render('register', { error: 'Please enter all fields' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { error: 'Email already in use' });
        }

        // Hash password and create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword, // Use 'password' field to match schema
            admin: false
        });

        await newUser.save();
        return res.redirect('/home');

    } catch (err) {
        console.error('Server error:', err);
        res.render('register', { error: 'Server error. Please try again.' });
    }
}
const mongoose = require('mongoose')
const userModel = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'User must have an email']
    },
    password: {
        type: String,
        required: [true, 'User must have a password']
    }


}
)

const User = mongoose.model('User', userModel, 'user-auth')
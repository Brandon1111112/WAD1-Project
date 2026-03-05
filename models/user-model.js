const mongoose = require('mongoose')

// Defining Schema
const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name']
    },
    email: {
        type: String,
        required: [true, 'User must have an email']
    },
    password: {
        type: String,
        required: [true, 'User must have a password']
    }


})

// Model Creation
const User = mongoose.model('User', userModel, 'users')
// Export it so controller can use the data
// exports.retrieveAll = function(){
//     return User.find()
// }
module.exports = User
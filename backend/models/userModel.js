const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        // required: true,
        unique: true
    },
    name: {
        type: String,
        // required: true
    },
    cnp: {
        type: String,
        unique: true,
    },
    role: {
        type: String,
        enum: ['victima', 'autoritate', 'voluntar'],
        default: 'victima'
    }
});

userSchema.plugin(findOrCreate);
const User = mongoose.model('User', userSchema);

module.exports = User;
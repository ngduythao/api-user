const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please fill in email'],
        unique: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email invalid']
    },
    password: String,
    name: {
        type: String,
        required: [true, 'Please fill in your name']
    },
    role: {
        type: String,
        enum: ['student', 'tutor']
    },
    address: String,
    avatar: {
        type: String,
        default: 'https://my-final-project-ptudwnc.s3.amazonaws.com/default-image/41ea2374-59c9-409e-a8ad-21a8020e0b2a.jpg'
    },
    facebook: {
        id: String,
        accessToken: String
    },
    google: {
        id: String,
        accessToken: String
    },
    isActive: {
        type: Boolean,
        default: false
    },
    accountToken: String, // use for active user, reset password
    accountTokenExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})



module.exports = mongoose.model('User', UserSchema);
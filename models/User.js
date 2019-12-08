const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Vui lòng điền địa chỉ email'],
        unique: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Địa chỉ email không hợp lệ']
    },
    password: String,
    name: {
        type: String,
        required: [true, 'Vui lòng điền họ tên']
    },
    role: {
        type: String,
        enum: ['student', 'tutor']
    },
    address: String,
    avatar: String,
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
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema({
    userInfo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    }
})



module.exports = mongoose.model('Student', StudentSchema);
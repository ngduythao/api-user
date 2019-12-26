const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please fill in skill'],
        unique: true
    },
    isActive:{
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Tag', TagSchema);
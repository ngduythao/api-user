const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng điền tag kĩ năng']
    },
    isActive:{
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Tag', TagSchema);
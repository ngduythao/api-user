const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng điền tag kĩ năng']
    },
});

module.exports = mongoose.model('Tag', TagSchema);
const mongoose = require('mongoose');

const SpecializationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please fill in specialization'],
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Specialization', SpecializationSchema);
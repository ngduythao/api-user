const mongoose = require('mongoose');

const SpecializationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng điền thông tin chuyên ngành']
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Specialization', SpecializationSchema);
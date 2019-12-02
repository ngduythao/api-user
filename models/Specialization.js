const mongoose = require('moongoose');

const SpecializationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng điền thông tin chuyên ngành']
    },
});

module.exports = mongoose.model('Specialization', SpecializationSchema);
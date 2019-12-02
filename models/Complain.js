const mongoose = require('moongoose');
const constants = require('../constants/constant');

const {
    COMPLAIN_STATUS_PROCESSING,
    COMPLAIN_STATUS_COMPLETED,
    COMPLAIN_STATUS_CANCELED
} = constants;


const ComplainSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng điền tiêu đề khiếu nại']
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
        required: [true, 'Vui lòng chọn người học']
    },
    contract: {
        type: mongoose.Schema.ObjectId,
        ref: 'Contract',
        required: [true, 'Vui lòng chọn hợp đồng khiếu nại']
    },
    status: {
        type: String,
        required: true,
        enum: [
            COMPLAIN_STATUS_PROCESSING,
            COMPLAIN_STATUS_COMPLETED,
            COMPLAIN_STATUS_CANCELED
        ]
    },
    description: {
        type: String,
        required: [true, 'Vui lòng điền thông tin khiếu nai']
    }
});

module.exports = mongoose.model('Complain', ComplainSchema);
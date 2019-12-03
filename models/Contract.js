const mongoose = require('mongoose');
const constants = require('../constants/constant');

const {
    CONTRACT_STATUS_PROCESSING,
    CONTRACT_STATUS_COMPLAINING,
    CONTRACT_STATUS_COMPLETED,
    CONTRACT_STATUS_CANCELED
} = constants;


const ContractSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng điền tiêu đề hợp đồng']
    },
    tutor:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tutor',
        required: [true, 'Vui lòng chọn người dạy']
    },
    student:{
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
        required: [true, 'Vui lòng chọn người học']
    },
    status: {
        type: [String],
        required: true,
        enum: [
            CONTRACT_STATUS_PROCESSING,
            CONTRACT_STATUS_COMPLAINING,
            CONTRACT_STATUS_COMPLETED,
            CONTRACT_STATUS_CANCELED
        ]
    },
    rentHours:{
        type: Number,
        required: [true, 'Vui lòng chọn số giờ thuê']
    },
    contractAmount: {
        type: Number
    },
    isSuccess: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Thang điểm dánh giá từ 1 tới 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Contract', ContractSchema);
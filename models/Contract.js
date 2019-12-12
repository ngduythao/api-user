const mongoose = require('mongoose');
const constants = require('../constants/constant');

const {
    Processing,
    Completed,
    Complaining,
    Canceled
} = constants;



const ContractSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please fill in a title for the contract']
    },
    tutor:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tutor',
        required: [true, 'Please choose tutor']
    },
    student:{
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
        required: [true, 'Please choose student']
    },
    status: {
        type: String,
        required: true,
        enum: [Processing, Completed, Complaining, Canceled]
    },
    rentHours:{
        type: Number,
        required: [true, 'Please choose rent hours']
    },
    contractAmount: {
        type: Number
    },
    isSuccess: {
        type: Boolean
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 to 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Contract', ContractSchema);
const mongoose = require('mongoose');
const constants = require('../constants/constant');

const {
    Processing, Completed, Canceled
} = constants;


const ComplaintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please fill in a title for the complaint']
    },
    contract: {
        type: mongoose.Schema.ObjectId,
        ref: 'Contract',
        required: [true, 'Please choose the contract']
    },
    status: {
        type: String,
        required: true,
        enum: [Processing, Completed, Canceled]
    },
    description: {
        type: String,
        required: [true, 'Please add some text in description']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
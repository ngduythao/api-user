const mongoose = require('mongoose');


const ChatSchema = new mongoose.Schema({
    tutor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tutor',
        required: [true, 'Please choose the tutor']
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
        required: [true, 'Please choose the student']
    },
    messages: [
        {
            message: {
                type: String
            },
            timestamp: {
                type: Date
            },
            author: {
                type: mongoose.Schema.ObjectId
            }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', ChatSchema);
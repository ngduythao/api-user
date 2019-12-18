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
    messages: {
        type: [String],
        required: [true, 'Please add some text']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', ChatSchema);
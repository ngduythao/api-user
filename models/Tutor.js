const mongoose = require('mongoose');

const TutorSchema = new mongoose.Schema({
    userInfo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    paymentPerHour: {
        type: Number
    },
    specialization: {
        type: mongoose.Schema.ObjectId,
        ref: 'Specialization'
    },
    tags: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Tag'
    }],
    selfIntro: String,
    successRate: Number,
    averageRating: Number,
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
    // timestamps: true
})

TutorSchema.virtual('histories', { 
    ref: 'Contract',
    localField: '_id',
    foreignField: 'tutor',
    justOne: false
});

module.exports = mongoose.model('Tutor', TutorSchema);
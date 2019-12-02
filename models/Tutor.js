const mongoose = require('moongoose');

const TutorSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Vui lòng điền địa chỉ email'],
        unique: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Địa chỉ email không hợp lệ']
    },
    password: {
        type: String,
        required: [true, 'Vui lòng điền mật khẩu'],
        minlength: 6,
        select: false
    },
    name: {
        type: String,
        required: [true, 'Vui lòng điền họ tên']
    },
    address: String,
    avatar: String,
    role: {
        type: String,
        default: 'tutor'
    },
    facebook: {
        id: String,
        accessToken: String
    },
    google: {
        id: String,
        accessToken: String
    },
    isActive: {
        type: Boolean,
        default: false
    },
    accountToken: String, // use for active user, reset password
    accountTokenExpire: Date,
    paymentPerHour: {
        type: Number,
        default: 0
    },
    specialization: {
        type: mongoose.Schema.ObjectId,
        ref: 'Specialization'
    },
    tags: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Tag'
    }],
    selfIntroduction: String,
    successRate: Number,
    averageRating: Number,
    createdAt: {type: Date,default: Date.now}
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

module.exports = mongoose.model('User', TutorSchema);
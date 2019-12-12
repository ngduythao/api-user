const createError = require('http-errors');
const uuid = require('uuid/v4');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');


exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findOneAndUpdate({
        _id: req.params.id,
        isActive: true
    }, req.body, {
        new: true,
        runValidators: true
    }).select('-password');

    
    res.status(200).json({
        success: true,
        data: user
    });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
    const {currentPassword, newPassword} = req.body;
    const user = await User.findById(req.params.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
        return next(createError(400, 'Current password is missing or incorrect'));
    }

    const salt = await bcrypt.genSalt(10);
    user.password= await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
        success: true,
        data: user
    });
});
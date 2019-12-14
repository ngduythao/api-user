const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');


exports.updateUser = asyncHandler(async (req, res, next) => {
    let user = await User.findOne({
        _id: req.user.userId,   // id of user, not full user
        isActive: true
    });

    if (!user) {
        return next(createError(404, 'User is lock or not exists'));
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
        return next(createError(400, 'Current password is missing or incorrect'));
    }

    if (req.body.email) user.mail = req.body.email;
    if (req.body.name) user.name = req.body.name;
    if (req.body.address) user.address = req.body.address;

    await user.save();

    res.status(200).json({
        success: true,
        data: user
    });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
    const {
        currentPassword,
        newPassword
    } = req.body;

    
    const user = await User.findOne({
        _id: req.user.userId,
        isActive: true
    });

    if (!user) {
        return next(new createError(404, 'User is lock or not exists'));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
        return next(createError(400, 'Current password is missing or incorrect'));
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
        success: true,
        data: user
    });
});
const createError = require('http-errors');
const uuid = require('uuid/v4');
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

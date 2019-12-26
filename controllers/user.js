const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SK_KEY);


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


exports.updateImage = asyncHandler(async (req, res, next) => {
    let user = await User.findOne({
        _id: req.user.userId,   // id of user, not full user
        isActive: true
    });

    if (!user) {
        return next(createError(404, 'User is lock or not exists'));
    }
    if (req.body.avatar) user.avatar = req.body.avatar;

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

exports.recharge = asyncHandler(async(req, res) => {
    let { token, price } = req.body;
    price = parseInt(price, 10);
    const user = await User.findById(req.user.userId);
    if (user.role === 'tutor' && user.balance > price) {
        return next(createError(400, 'You cant withdraw money largher than your balance'));
    }
    
    const customer = await stripe.customers.create({
        email: token.email,
        source: token.id
    })

    const charge = await stripe.charges.create({
        amount: price * 100,
        currency: 'usd',
        description: 'Advanced Web Recharge',
        customer: customer.id
    })

    if (user.role === 'student') {
        user.balance += price;
    } else
    if (user.role === 'tutor') {
        user.balance -= price;
    }
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Payment successfully'
    });
});



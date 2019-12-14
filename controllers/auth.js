const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');

const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// @desc      Register a tutor or student
// @route     POST /api/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  let { name, email, password, role } = req.body;
  let user, student, tutor;

  user = await User.findOne({email: email});
  if (user) return next(new createError(401, 'Account is already existed'));

  const accountToken = await crypto.randomBytes(32).toString('hex');
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  
  user = await User.create({
    email,
    password,
    name,
    role,
    accountToken
  });

  if (role === 'student') {
    student = await Student.create({
      userInfo: user.id
    })
  } else if (role === 'tutor') {
    tutor = await Tutor.create({
      userInfo: user.id
    });
  }

  const msg = {
    to: email,
    from: process.env.HOST_EMAIL,
    subject: 'Active account Uber for tutor',
    html: `<p> Welcome to Uber for tutor. \nPlease click to this link <a href="${process.env.SERVER_URL}/api/auth/active/${accountToken}"> to active your account </a>.</p> `
  }

  try {
    await sgMail.send(msg);
    res.status(200).json({
      success: true,
      data: {
        message: 'We has sent active link to your email'
      }
    });
  } catch (error) {
    if (role === 'student')  await Student.deleteOne(student);
    else if (role === 'tutor')  await Tutor.deleteOne(tutor);
    await User.deleteOne(user);
    return next(new createError(400, 'Server error, cant send email'));
  }
});


// @desc      Active new user
// @route     GET /api/auth/active/:token
// @access    Public
exports.activeUser = asyncHandler(async(req, res, next) => {
  const {token} = req.params;
  
  const user = await User.findOne({accountToken: token});

  if (!user) return next(new createError(400, 'Token invalid'));

  // update
  user.isActive = true;
  user.accountToken = undefined;
  await user.save();

  res.redirect(process.env.CLIENT_URL);

  // res.status(200).json({
  //   success: true,
  //   message: 'Kích hoạt tài khoản thành công'
  // })
});


// @desc      Login by using passport local
// @route     POST /api/auth/login
// @access    Public
exports.login = (req, res, next) => {
    passport.authenticate('local', {session: false}, async (errMessage, user) => {
          if (errMessage || !user) {
            return next(new createError(400, errMessage));
          }

          let fullUser;

          if (user.role === 'student') {
            fullUser = await Student.findOne({userInfo: user.id});
          }
          else if (user.role === 'tutor') {
            fullUser = await Tutor.findOne({userInfo: user.id});
          }
          fullUser.userId = user.id;
          fullUser.role = user.role;

          sendTokenResponse(200, res, fullUser);
})(req, res)};


// @desc      Login by using Google account
// @route     POST /api/auth/google or /api/auth/google
// @access    Private
exports.loginByOAuth = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new createError(400, 'Login fail'));
  }

  // create new user
  let user;
  if (!req.user.role) {
    const {role} = req.body;
    if (role === 'student') user = await Student.create({
      userInfo: req.user.id
    });
    else if (role === 'tutor') user = await Tutor.create({
      userInfo: req.user.id
    });
  }

  sendTokenResponse(200, res, user);
});


// @desc      Get current logged in user
// @route     POST /api/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new createError(400, 'Please sign in to continue'));
  }

  // user is tutor or student, not user
  res.status(200).json({
    success: true,
    data: req.user
  });
  
});


// @desc      Forgot password
// @route     POST /api/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const {email} = req.body;

  const user = await User.findOne({email: email});

  if (!user) {
    return next(new createError(404, 'Email invalid'));
  }

  // Get reset token
  const accountToken = await crypto.randomBytes(32).toString('hex');
  const accountTokenExpire = Date.now() + 3600000;

  user.accountToken = accountToken;
  user.accountTokenExpire = accountTokenExpire;
  await user.save();

  const msg = {
    to: email,
    from: process.env.HOST_EMAIL,
    subject: 'Forgetting password Uber for tutor',
    html: `<p> You are receiving this email because you (or someone else) has requested the reset of a password application Uber for tutor. \n
    Please click this link <a href="${process.env.SERVER_URL}/api/auth/resetpassword/${accountToken}"> to update a new password </a>.</p> `
  }

  try {
    await sgMail.send(msg);
    res.status(200).json({
      success: true,
      data: {
        message: 'We has sent update new password link to your email'
      }
    });
  } catch (error) {
    user.accountToken = undefined;
    user.accountTokenExpire = undefined;
    await user.save();
    return next(new createError(400, 'Server err, cant send email'));
  }
});


// @desc      Get access to page reset password
// @route     GET /api/auth/resetpassword/:token
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const {token} = req.params;
  const user = await User.findOne({
      accountToken: token,
      accountTokenExpire: {
        $gt: Date.now()
      }
    });

  if (!user) return next(new createError(400, 'Token invalid'));

  const url = `${process.env.CLIENT_URL}/updatepassword/${token}`;
  res.redirect(url);
});


// @desc      Reset password
// @route     PUT /api/auth/updatepassword
// @access    Public
exports.updateForgotPassword = asyncHandler(async (req, res, next) => {
  const {token, newPassword} = req.body;
  const user = await User.findOne({
      accountToken: token,
      accountTokenExpire: {
        $gt: Date.now()
      }
    });

  if (!user) return next(new createError(400, 'Token invalid'));

  // Set new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.accountToken = undefined;
  user.accountTokenExpire = undefined;
  await user.save();

  let fullUser;

  if (user.role === 'student') {
    fullUser = await Student.findOne({
      userInfo: user.id
    });
  } else if (user.role === 'tutor') {
    fullUser = await Tutor.findOne({
      userInfo: user.id
    });
  }
  fullUser.userId = user.id;
  fullUser.role = user.role;

  sendTokenResponse(200, res, fullUser);
});


const sendTokenResponse = (statusCode, res, user) => {
  console.log(user);
  const payload = {
    id: user.id,
    userId: user.userId,
    role: user.role
  }

  console.log(payload);
  
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET);

  res.status(statusCode).json({
    success: true,
    data: {
      token
    }
  });
}

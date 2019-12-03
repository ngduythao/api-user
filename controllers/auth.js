const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');

const Tutor = require('../models/Tutor');
const Student = require('../models/Student');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// @desc      Register a tutor or student
// @route     POST /api/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  let { name, email, password, role } = req.body;
  let user;

  user = await Student.findOne({email: email});
  if (user) return next(new createError(400, 'Tài khoản đã tồn tại'));

  user = await Tutor.findOne({email: email});
  if (user) return next(new createError(400, 'Tài khoản đã tồn tại'));

  const accountToken = await crypto.randomBytes(32).toString('hex');
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  
  if (role === 'student') user = await Student.create({name, email, password, accountToken})
  else if (role === 'tutor') user = await Tutor.create({name, email, password, accountToken});

  const msg = {
    to: email,
    from: process.env.HOST_EMAIL,
    subject: 'Kích hoạt tài khoản Uber for tutor',
    html: `<p> Chào mừng bạn đến với Uber for tutor. \nBạn vui lòng nhấn vào đường dẫn sau <a href="${process.env.SERVER_URL}/api/auth/active/${role}/${accountToken}"> để kích hoạt tài khoản </a>.</p> `
  }

  try {
    await sgMail.send(msg);
    res.status(200).json({
      success: true,
      message: 'Chúng tôi đã gửi một đường dẫn kích hoạt tài khoản đến địa chỉ email của bạn'
    });
  } catch (error) {
    if (role === 'student') user = await Student.deleteOne(user);
    else if (role === 'tutor') user = await Tutor.deleteOne(user);
    return next(new createError(400, 'Server bị lỗi, không thể gửi email'));
  }
  

  // sendTokenResponse(200, res, user);
});


// @desc      Active new user
// @route     GET /api/auth/active/:role/:token
// @access    Public
exports.activeUser = asyncHandler(async(req, res, next) => {
  const {role, token} = req.params;
  let user;

  if (role === 'student') user = await Student.findOne({accountToken: token});
  else if (role ==='tutor') user = await Tutor.findOne({accountToken: token})

  if (!user) return next(new createError(400, 'Token không hợp lệ'));

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
    passport.authenticate('local', {session: false}, (errMessage, user) => {
      if (errMessage || !user) {
          return next(new createError(400, errMessage));
        }
      sendTokenResponse(200, res, user);
})(req, res)};


// @desc      Login by using Google account
// @route     POST /api/auth/google or /api/auth/google
// @access    Private
exports.loginByOAuth = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new createError(400, 'Đăng nhập không thành công'));
  }

  // create new user
  let user;
  if (!req.user.role) {
    const {role} = req.body;
    if (role === 'student') user = await Student.create(req.user)
    else if (role === 'tutor') user = await Tutor.create(req.user);
  }

  sendTokenResponse(200, res, user);
});


// @desc      Get current logged in user
// @route     POST /api/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new createError(400, 'Đăng nhập không thành công'));
  }

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
  let user;
  console.log(email);
  user = await Student.findOne({email: email});
  if (!user) user = await Tutor.findOne({email: email});

  if (!user) {
    return next(new createError(404, 'Địa chỉ email không hợp lệ'));
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
    subject: 'Lấy lại mật khẩu ứng dụng Uber for tutor',
    html: `<p> Bạn nhận được tin nhắn này vì bạn (hoặc ai đó) đã gửi yêu cầu lấy lại mật khẩu ứng dụng Uber for tutor. \n
    Nhấn vào đường dẫn sau <a href="${process.env.SERVER_URL}/api/auth/resetpassword/${user.role}/${accountToken}"> để tạo mới mật khẩu </a>.</p> `
  }

  try {
    await sgMail.send(msg);
    res.status(200).json({
      success: true,
      message: 'Chúng tôi đã gửi một đường dẫn tạo mới mật khẩu đến địa chỉ email của bạn'
    });
  } catch (error) {
    user.accountToken = undefined;
    user.accountTokenExpire = undefined;
    await user.save();
    return next(new createError(400, 'Server bị lỗi, không thể gửi email'));
  }
});


// @desc      Get access to page reset password
// @route     GET /api/auth/resetpassword/:role/:token
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const {role, token} = req.params;
  let user;

  if (role === 'student') {
    user = await Student.findOne({
      accountToken: token,
      accountTokenExpire: {
        $gt: Date.now()
      }
    });
  } else if (role === 'tutor') {
    user = await Tutor.findOne({
      accountToken: token,
      accountTokenExpire: {
        $gt: Date.now()
      }
    })
  }

  if (!user) return next(new createError(400, 'Token không hợp lệ'));

  const url = `${process.env.CLIENT_URL}/updatepassword/${token}`;
  res.redirect(url);
});


// @desc      Reset password
// @route     PUT /api/auth/updatepassword
// @access    Public
exports.updateForgotPassword = asyncHandler(async (req, res, next) => {
  const {role, token, newPassword} = req.body;
  let user;

  if (role === 'student') {
    user = await Student.findOne({
      accountToken: token,
      accountTokenExpire: {
        $gt: Date.now()
      }
    });
  } else if (role === 'tutor') {
    user = await Tutor.findOne({
      accountToken: token,
      accountTokenExpire: {
        $gt: Date.now()
      }
    })
  }

  if (!user) return next(new createError(400, 'Token không hợp lệ'));

  // Set new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.accountToken = undefined;
  user.accountTokenExpire = undefined;
  await user.save();

  sendTokenResponse(200, res, user);
});


const sendTokenResponse = (statusCode, res, user) => {
  const payload = {
    id: user.id,
    role: user.role
  }

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET);

  res.status(statusCode).json({
    success: true,
    token
  });
}

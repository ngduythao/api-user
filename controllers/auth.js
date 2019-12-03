const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');

const Tutor = require('../models/Tutor');
const Student = require('../models/Student');


// @desc      Register a tutor or student
// @route     POST /api/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res) => {
  let { name, email, password, role } = req.body;
  let user;

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  
  // Model had checked duplicate
  if (role === 'student') user = await Student.create({name, email, password})
  else if (role === 'tutor') user = await Tutor.create({name, email, password});
  
  sendTokenResponse(200, res, user);
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



// @desc      Get current logged in user
// @route     POST /api/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
    res.status(200).json({
    success: true,
    data: req.user
  });
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

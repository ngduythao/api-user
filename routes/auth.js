const express = require('express');
const passport = require('passport');

const {
    register,
    login,
    getMe
} = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', passport.authenticate('jwt', {session: false}), getMe);

module.exports = router;

const express = require('express');
const passport = require('passport');

const {
    register,
    login,
    getMe,
    loginByOAuth
} = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', passport.authenticate('jwt', {session: false}), getMe);
router.post('/google', passport.authenticate('google-token', {session: false}), loginByOAuth);
router.post('/facebook', passport.authenticate("facebook-token", {session: false}), loginByOAuth);


module.exports = router;

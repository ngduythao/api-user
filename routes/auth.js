const express = require('express');
const passport = require('passport');

const {
    register,
    activeUser,
    login,
    loginByOAuth,
    getMe
} = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.get('/active/:role/:token', activeUser);

router.post('/login', login);
router.post('/google', passport.authenticate('google-token', {session: false}), loginByOAuth);
router.post('/facebook', passport.authenticate("facebook-token", {session: false}), loginByOAuth);

router.get('/me', passport.authenticate('jwt', {session: false}), getMe);

module.exports = router;

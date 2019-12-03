const express = require('express');
const passport = require('passport');

const {
    protected,
    authorized
} = require('../middleware/auth');

const {
    register,
    activeUser,
    login,
    loginByOAuth,
    getMe,
    forgotPassword,
    resetPassword,
    updateForgotPassword
} = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.get('/active/:role/:token', activeUser);

router.post('/login', login);
router.post('/google', passport.authenticate('google-token', {session: false}), loginByOAuth);
router.post('/facebook', passport.authenticate("facebook-token", {session: false}), loginByOAuth);

router.get('/me', protected, getMe);

router.post('/forgotpassword', forgotPassword);
router.get('/resetPassword/:role/:token', resetPassword);
router.put('/updatepassword', updateForgotPassword);

module.exports = router;

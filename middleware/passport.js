const bcrypt = require('bcryptjs');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');


const localStratery = new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
}, async (email, password, done) => {
    let user = await Student.findOne({
        email: email
    })

    if (!user) {
        user = await Tutor.findOne({
            email: email
        })
    }

    if (!user) return done('Không tồn tại tài khoản', false);

    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
        return done(null, user);
    } else {
        return done('Tài khoản hoặc một khẩu không chính xác', false);
    }
})


const jwtStrategy = new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}, async (jwtPayload, done) => {
    console.log(jwtPayload);
    if (jwtPayload.role === 'student') {
        user = await Student.findById(jwtPayload.id);
    } 
    else if (jwtPayload.role === 'tutor'){
        user = await Student.findById(jwtPayload.id);
    }
    if (user) return done(null, user);
    else return done(err);
});





const passportConfig = () => {
    passport.use(localStratery);
    passport.use(jwtStrategy);
}


module.exports = passportConfig;

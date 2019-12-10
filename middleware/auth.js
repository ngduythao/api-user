const passport = require('passport');
const createError = require('http-errors');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');

const protected = (req, res, next) => {passport.authenticate('jwt', {session: false,
    }, async (error, jwtPayload) => {
        if (error || !jwtPayload) {
            return next(new createError(401, 'Bạn không thể truy cập trang này'));
        }

        let user;
        if (jwtPayload.role === 'student') {
            user = await Student.findOne({user: jwtPayload.id}).populate('user');
        } else if (jwtPayload.role === 'tutor') {
            user = await Tutor.findOne({user: jwtPayload.id}).populate('user');
        }
        req.user = user;
        next();
    })(req, res, next);
}


const authorized = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.user.role)) {
            return next(new createError(403, 'Bạn không thể đủ quyền hạn truy cập trang này'));
        }
        next();
    };
};

module.exports = {
    protected, 
    authorized
};
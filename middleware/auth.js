const passport = require('passport');
const createError = require('http-errors');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');

const protectedGetMe = (req, res, next) => {
    passport.authenticate('jwt', {
        session: false,
    }, async (error, jwtPayload) => {
        if (error || !jwtPayload) {
            return next(new createError(401, 'Please sign in to continue'));
        }

        let user;
        if (jwtPayload.role === 'student') {
            user = await Student.findOne({
                userInfo: jwtPayload.id
            }).populate('userInfo');
        } else if (jwtPayload.role === 'tutor') {
            user = await Tutor.findOne({
                userInfo: jwtPayload.id
            }).populate([{
                path: 'userInfo',
                select: '-password',
                match: {
                    isActive: true
                }
            }, {
                path: 'tags',
                select: 'name',
                match: {
                    isActive: true
                }
            }, {
                path: 'specialization',
                select: 'name',
                match: {
                    isActive: true
                }
            }]);
        }
        if (!user) {
            return next(new createError(401, 'Token invalid'));
        }
        req.user = user;
        next();
    })(req, res, next);
}

const protected = (req, res, next) => {
    passport.authenticate('jwt', {
        session: false,
    }, async (error, jwtPayload) => {
        if (error || !jwtPayload) {
            return next(new createError(401, 'Please sign in to continue'));
        }

        console.log('in protected jwtPaylod');
        console.log(jwtPayload);

        req.user = jwtPayload;
        next();
    })(req, res, next);
}



const authorized = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new createError(403, 'You are not authorized to access this page'));
        }
        next();
    };
};

module.exports = {
    protectedGetMe,
    protected,
    authorized
};
const express = require('express');
const router = express.Router();
const Tutor = require('../models/Tutor');

const {
    protected,
    authorized
} = require('../middleware/auth')

const advancedSearch = require('../middleware/advancedSearch');

const {
    getTutors,
    updateTutor
} = require('../controllers/tutor');


router
    .route('/')
    .get(advancedSearch(Tutor, [{
        path: 'userInfo',
        select: 'email name address avatar',
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
    }]), getTutors);


router
    .route('/:id')
    .put(protected, authorized('tutor'), updateTutor);

module.exports = router;

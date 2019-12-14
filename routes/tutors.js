const express = require('express');
const router = express.Router();

const {
    protected,
    authorized
} = require('../middleware/auth')


const {
    getTutors,
    updateTutor
} = require('../controllers/tutor');


router
    .route('/')
    .get(getTutors)
    .put(protected, authorized('tutor'), updateTutor);


module.exports = router;

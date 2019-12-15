const express = require('express');
const router = express.Router();

const {
    protected,
    authorized
} = require('../middleware/auth')


const {
    getTutors,
    getTutor,
    updateTutor
} = require('../controllers/tutor');


router
    .route('/')
    .get(getTutors)
    .put(protected, authorized('tutor'), updateTutor);

router
    .route('/:id')
    .get(getTutor)

module.exports = router;

const express = require('express');
const router = express.Router();

const {
    protected,
    authorized
} = require('../middleware/auth')

const {
    updateTutor
} = require('../controllers/tutor');

router.use(protected)

router
    .route('/:id')
    .put(authorized('tutor'), updateTutor);

module.exports = router;

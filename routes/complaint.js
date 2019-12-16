const express = require('express');
const router = express.Router();

const {
    createComplaint,
    cancelComplaint
} = require('../controllers/complaint');

const {
    protected,
    authorized
} = require('../middleware/auth');


router.route('/')
    .post(protected, authorized('student'), createComplaint);

router.route('/:id')
    .put(protected, cancelComplaint)

module.exports = router;

const express = require('express');
const router = express.Router();

const {
    getComplaints,
    createComplaint,
    getComplaint,
    cancelComplaint
} = require('../controllers/complaint');

const {
    protected,
    authorized
} = require('../middleware/auth');

router.use(protected)

router.route('/')
    .get(getComplaints)
    .post(authorized('student'), createComplaint);

router.route('/:id')
    .get(getComplaint)
    .put(cancelComplaint)

module.exports = router;

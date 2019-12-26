const express = require('express');
const router = express.Router();

const {
    protected,
    authorized
} = require('../middleware/auth')


const {
    getStatistics
} = require('../controllers/tutor');

router
    .route('/contracts')
    .get(protected, authorized('tutor'), getStatistics)

module.exports = router;

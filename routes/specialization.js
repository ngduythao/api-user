const express = require('express');
const router = express.Router();

const {
    getSpecializations,
} = require('../controllers/specialization');


router
    .route('/')
    .get(getSpecializations)


module.exports = router;

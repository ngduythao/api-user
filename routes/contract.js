const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');

const advancedSearch = require('../middleware/advancedSearch');

const {
    getContracts,
    createContract,
    getContract,
    updateContract
} = require('../controllers/contract');

const {protected, authorized} = require('../middleware/auth');


router.route('/')
    .get(protected, getContracts)
    .post(protected, authorized('student'), createContract);

router.route('/:id')
    .get(protected, getContract)
    .put(protected, updateContract)

module.exports = router;

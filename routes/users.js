const express = require('express');
const router = express.Router();

const {protected, authorized} =require('../middleware/auth')

const {
  updateUser
} = require('../controllers/user');

router.use(protected)

router
  .route('/:id')
  .put(updateUser)

module.exports = router;

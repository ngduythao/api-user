const express = require('express');
const router = express.Router();

const {protected, authorized} =require('../middleware/auth')

const {
  updateUser,
  updatePassword,
  recharge
} = require('../controllers/user');
const {getSignedUrl} = require('../controllers/upload');

router.use(protected)

router
  .route('/')
  .put(updateUser)

router
  .route('/newpw')
  .put(updatePassword)

router
  .route('/upload')
  .post(getSignedUrl);

router
  .route('/recharge')
  .post(recharge);

module.exports = router;

const express = require('express');
const router = express.Router();

const {protected, authorized} =require('../middleware/auth')

const {
  updateUser,
  updatePassword,
  updateImage,
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
  .route('/newavatar')
  .put(updateImage)

router
  .route('/upload')
  .post(getSignedUrl);

router
  .route('/recharge')
  .post(recharge);

module.exports = router;

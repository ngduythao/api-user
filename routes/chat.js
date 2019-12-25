const express = require('express');
const router = express.Router();
const {
    protected,
    authorized
} = require('../middleware/auth');

const {
    createRoom,
    getListRooms,
    getRoom,
    sendMessage
} = require('../controllers/chat');


router.route('/')
    .get(protected, getListRooms)
    .post(protected, authorized('student'), createRoom);

router.route('/:id')
    .get(protected, getRoom)
    .put(protected, sendMessage)

module.exports = router;

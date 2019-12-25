const asyncHandler = require('../middleware/async');
const createError = require('http-errors');
const Chat = require('../models/Chat');

const populateTutor = {
        path: 'tutor',
        select: 'userInfo',
        populate: [{
            path: 'userInfo',
            select: 'name avatar role',
            match: {
                isActive: true
            }
        }]
    };

const populateStudent = {
    path: 'student',
    select: 'userInfo',
    populate: {
        path: 'userInfo',
        select: 'name avatar role',
    }
};
const chatPipeline = [
    populateTutor, populateStudent
]


exports.createRoom = asyncHandler(async (req, res, next) => {
    if (!req.body.tutor) {
        return next(new createError(404, `Please choose tutor you want to chat`));
    }

    const roomInfo = {
        tutor: req.body.tutor,
        student: req.user.id
    }
    const existingRoom = await Chat.find(roomInfo);
    if (existingRoom) {
        return next(new createError(400, `You had created chat room with this tutor`));
    }
    const room = await Chat.create(roomInfo);

    res.status(200).json({
        success: true,
        data: room
    });
});


exports.getListRooms = asyncHandler(async (req, res, next) => {
    const condition = {};
    let populateObject;
    if (req.user.role === 'student') {
        condition['student'] = req.user.id;
        populateObject = populateTutor;
    } else
    if (req.user.role === 'tutor') {
        condition['tutor'] = req.user.id;
        populateObject = populateStudent
    }

    const rooms = await Chat.find(condition).populate(populateObject).sort({
        updatedAt: -1
    });

    res.status(200).json({
        success: true,
        data: rooms
    });
});


exports.getRoom = asyncHandler(async (req, res, next) => {
    const room = await Chat.findById(req.params.id).populate(chatPipeline);

    if (!room) {
        return next(new createError(404, `Room not found`));
    }

    // id => string, _id => objectId
    if (req.user.role === 'student' && room.student.id !== req.user.id) {
        return next(new createError(404, `You cant read messages of another user`));
    } else
    if (req.user.role === 'tutor' && room.tutor.id !== req.user.id) {
        return next(new createError(404, `You cant read read messages of another user`));
    }

    res.status(200).json({
        success: true,
        data: room
    });
});


exports.sendMessage = asyncHandler(async (req, res, next) => {
    const { message } = req.body;
    const room = await Chat.findById(req.params.id);
    const newMessage = {
        content: message,
        time: new Date(),
        author: req.user.userId
    }
    room.messages.push(newMessage);
    await room.save();

    res.status(200).json({
        success: true,
        data: newMessage
    });
});
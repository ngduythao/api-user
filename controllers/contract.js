const createError = require('http-errors');
const asyncHandler = require('../middleware/async');
const Contract = require('../models/Contract');
const Tutor = require('../models/Tutor');
const constants = require('../constants/constant');

const {
    Requesting,
    Happening,
    Completed,
    Canceled
} = constants;

const contractPipeline = [{
        path: 'tutor',
        populate: [{
            path: 'userInfo',
            select: '-password',
            match: {
                isActive: true
            }
        }, {
            path: 'tags',
            select: 'name',
            match: {
                isActive: true
            }
        }, {
            path: 'specialization',
            select: 'name',
            match: {
                isActive: true
            }
        }]
    },
    {
        path: 'student',
        populate: {
            path: 'userInfo',
            select: '-password',
        }
    }
]


exports.getContracts = asyncHandler(async (req, res, next) => {
    const condition = {};
    if (req.user.role === 'student') {
        condition['student'] = req.user.id;
    } else 
    if (req.user.role === 'tutor') {
        condition['tutor'] = req.user.id;
    }

    const contracts = await Contract.find(condition);
    const count = contracts.length;

    // const page = parseInt(req.query.page, 10) || 1;
    // const limit = parseInt(req.query.limit, 10) || 8;
    // const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;

    let query = Contract.find(condition).populate(contractPipeline);
    // query = query.skip(startIndex).limit(limit).populate(contractPipeline);

    try {
        results = await query;
    } catch (error) {
        return next(new createError(404, 'Resource not found'));
    }

    // const pagination = {};

    // if (endIndex < count) {
    //     pagination.next = {
    //         page: page + 1,
    //         limit
    //     };
    // }

    // if (startIndex > 0) {
    //     pagination.prev = {
    //         page: page - 1,
    //         limit
    //     };
    // }


    res.status(200).json({
        success: true,
        data: {
            count,
            // pagination,
            results
        }
    });
});



exports.createContract = asyncHandler(async (req, res, next) => {
    if (req.body.status) {
        return next(new createError(403, 'You are not authorized to set state of contract'));
    }

    const tutor = await Tutor.findById(req.body.tutor)
        .populate({
            path: 'userInfo',
            select: '-password',
            match: {
                isActive: true
            }
        });

    if (!tutor || !tutor.userInfo) {
        return next(new createError(403, 'Tutor not found or has been locked, init contract fail'));
    }


    if (req.body.student !== req.user.id) {
        return next(new createError(403, 'You cant init contract by a id of different student'));
    }

    req.body.status = Requesting;
    req.body.contractAmount = req.body.rentHours * tutor.paymentPerHour;


    const contract = await Contract.create(req.body)

    if (!contract) {
        return next(404, 'Init a new contract fail');
    }

    const fullContract = await Contract.findById(contract._id).populate(contractPipeline);


    res.status(200).json({
        success: true,
        data: fullContract
    });

});


exports.getContract = asyncHandler(async (req, res, next) => {
    const contract = await Contract.findById(req.params.id).populate(contractPipeline);

    if (!contract) {
        return next(new createError(404, `Contract not found`));
    }

    // id => string, _id => objectId
    if (req.user.role === 'student' && contract.student.id !== req.user.id) {
        return next(new createError(404, `You cant read a contract of another user`));
    } else
    if (req.user.role === 'tutor' && contract.tutor.id !== req.user.id) {
        return next(new createError(404, `You cant read a  contract of another user`));
    }

    res.status(200).json({
        success: true,
        data: contract
    });
});


exports.updateContract = asyncHandler(async (req, res, next) => {
    const {status, isSuccess, rating, review} = req.body;
    const contract = await Contract.findById(req.params.id).populate(contractPipeline);
    let isUpdated = false;

    if (!contract) {
        return next(new createError(404, `'Not found contract with id ${req.params.id} `));
    }

    if (contract.status === Canceled) {
        return next(new createError(403, `Contract has been canceled, you cant update`));
    }

    /* tutor */
    if (req.user.role === 'tutor') {
        if (contract.tutor.id !== req.user.id) {
            return next(new createError(404, `You cant update a contract of another user`));
        }

        if (contract.status !== Requesting || !status || (status && status !== Happening && status !== Canceled)) {
                return next(new createError(403, 'Status of contract invalid, cant update'));
        }    

        contract.status = status;
        isUpdated = true;
    } else
    if (req.user.role === 'student') {
        if (contract.student.id !== req.user.id) {
            return next(new createError(404, `You cant update a contract of another user`));
        }

        // if exists status in req.body and status is neither Completed nor Canceled
        if (status && status !== Completed && status !== Canceled) {
            return next(new createError(403, 'Status of contract invalid, cant update'));
        }

        // status is Requesting && update Canceled
        if (contract.status === Requesting && status === Canceled) {
            contract.status = Canceled;
            isUpdated = true;
        } else
        if ((contract.status === Happening && status === Completed)    // completed and give review
            || contract.status === Completed) { // give review after completed
                if (req.body.isSuccess) contract.isSuccess = isSuccess;
                if (req.body.rating) contract.rating = parseInt(rating, 10);
                if (req.body.review) contract.review = review;
                contract.status = Completed;
                isUpdated = true;
        }

        if(!isUpdated) {
            return next(new createError(403, `Invalid request, you cant not update contract`));
        }
    }

    await contract.save();

    res.status(200).json({
        success: true,
        data: contract
    });

});

const createError = require('http-errors');
const asyncHandler = require('../middleware/async');
const Contract = require('../models/Contract');
const Tutor = require('../models/Tutor');
const constants = require('../constants/constant');

const {
    Requesting,
    Happening,
    Completed,
    Complaining,
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

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let query = Contract.find(condition);
    query = query.skip(startIndex).limit(limit).populate(contractPipeline);

    try {
        results = await query;
    } catch (error) {
        return next(new createError(404, 'Resource not found'));
    }

    const pagination = {};

    if (endIndex < count) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.advancedSearch = {
        count: results.length,
        pagination,
        results
    };

    res.status(200).json({
        success: true,
        data: {
            count,
            pagination,
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

    

    // check owner late
    // id => string, _id => objectId
    if (req.user.role === 'student' && contract.student.id !== req.user.id) {
        return next(new createError(404, `You cant read contract of another user`));
    } else
    if (req.user.role === 'tutor' && contract.tutor.id !== req.user.id) {
        return next(new createError(404, `You cant read contract of another user`));
    }

    res.status(200).json({
        success: true,
        data: contract
    });
});


exports.updateContract = asyncHandler(async (req, res, next) => {
    const Contract = await Contract.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!Contract) {
        return next(new createError(404, `Contract not found`));
    }

    res.status(200).json({
        success: true,
        data: Contract
    });
});

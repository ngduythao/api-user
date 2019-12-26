const createError = require('http-errors');
const asyncHandler = require('../middleware/async');
const Contract = require('../models/Contract');
const User = require('../models/User');
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
            select: '-password -balance -accountToken',
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
            select: '-password -balance -accountToken',
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

    let query = Contract.find(condition).populate(contractPipeline).sort({
        updatedAt: -1
    });
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

    req.body.student = req.user.id;
    req.body.status = Requesting;
    req.body.contractAmount = req.body.rentHours * tutor.paymentPerHour;
    if (req.user.balance < req.body.contractAmount) {
        return next(new createError(400, 'Account balance is not enough, please recharge money to the wallet, then create contract again. Thank you!'));
    }

    const contract = await Contract.create(req.body)

    if (!contract) {
        return next(404, 'Init a new contract fail');
    }

    // minus balance
    const user = await User.findById(req.user.userId);
    user.balance -= req.body.contractAmount;
    await user.save();

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

        if (status === Canceled) {
            // sent back money to student;
            const user = await User.findById(contract.student.userInfo._id);
            user.balance += contract.contractAmount;
            await user.save();
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
            // sent back money to student;
            const user = await User.findById(contract.student.userInfo._id);
            user.balance += contract.contractAmount;
            await user.save();
            contract.status = Canceled;
            isUpdated = true;
        } else // completed and give review
        if (contract.status === Happening && status === Completed) { 
                contract.status = Completed;
                // sent money to tutor
                const user = await User.findById(contract.tutor.userInfo._id);
                user.balance += contract.contractAmount;
                await user.save();
                if (req.body.isSuccess) contract.isSuccess = isSuccess;
                if (req.body.rating) contract.rating = parseInt(rating, 10);
                if (req.body.review) contract.review = review;
                isUpdated = true;
        } else // give review after completed
        if (contract.status === Completed) {
            if (req.body.isSuccess) contract.isSuccess = isSuccess;
            if (req.body.rating) contract.rating = parseInt(rating, 10);
            if (req.body.review) contract.review = review;
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

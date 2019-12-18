const createError = require('http-errors');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const Contract = require('../models/Contract');
const Complaint =  require('../models/Complaint');

const {
    Requesting,
    Happening,
    Processing,
    Complaining,
    Completed,
    Canceled
} = require('../constants/constant');

exports.createComplaint = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'student') {
        return next(new createError(403, `Only student can request a complaint`));
    }

    const contract = await Contract.findById(req.body.contract);
    if (!contract) {
        return next(new createError(404, `Contract not found with id ${req.body.contract}`));
    }

    // console.log(contract.student, req.user.id, typeof (contract.student), typeof (req.user.id));
    if (contract.student.toString() !== req.user.id) {
        return next(new createError(403, `You can not request complaint of another user's contract`));
    }

    if (contract.status !== Happening) {
        if (contract.status === Requesting) {
            return next(new createError(403, `You can not complain a requesting contract. If you don't want hire tutor anymore, please cancel contract. Thank you`))
        }
        if (contract.status === Completed || contract.status === Canceled){
            return next(new createError(403, `Contract has been saved, you can not request a complaint`));
        }
        // contract.status === Complaining
        return next(new createError(403, `You have been requested a complaint for this contract. Please wait for judgment of administrator, if you don't want complain anymore, please cancel. Thank you`));
    }

    req.body.status = Processing;
    const complaint = await Complaint.create(req.body);
    if (!complaint) {
        return next(new createError(404, 'Invalid input, can not create complaint'))
    }

    contract.status = Complaining;
    await contract.save();

    res.status(200).json({
        success: true,
        data: {
            complaint,
            contract
        }
    });
});


exports.getComplaints = asyncHandler(async (req, res, next) => {
    const condition = {};
    let count;
    if (req.user.role === 'student') {
        condition['student'] = req.user.id;
    } else
    if (req.user.role === 'tutor') {
        condition['tutor'] = req.user.id;
    }

    const contracts = await Contract.find(condition);
    const arrayIds = contracts.map(contract => mongoose.Types.ObjectId(contract.id));

    const pipeline = [{
        $match: {
            $expr: {
                $in: ['$contract', arrayIds]
            }
        }
    }];

    try {
        results = await Complaint.aggregate(pipeline);
        count = results.length;
    } catch (error) {
        return next(new createError(404, 'Resource not found'));
    }


    res.status(200).json({
        success: true,
        data: {
            count,
            results
        }
    });
});


exports.getComplaint = asyncHandler(async(req, res, next) => {
    let complaint = await Complaint.findById(req.params.id).populate('contract');

    if (!complaint) {
        return next(new createError(404, `Complaint not found`));
    }

    // id => string, _id => objectId
    if (req.user.role === 'student' && complaint.contract.student.toString() !== req.user.id) {
        return next(new createError(404, `You cant read a complaint of another user`));
    } else
    if (req.user.role === 'tutor' && complaint.contract.tutor.toString() !== req.user.id) {
        return next(new createError(404, `You cant read a complaint of another user`));
    }

    const temp = complaint.contract.id;
    complaint.contract = undefined;
    complaint.contract = temp;
    
    res.status(200).json({
        success: true,
        data: complaint
    });
}) 

exports.cancelComplaint = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'student') {
        return next(new createError(403, `Only student can cancel a complaint`));
    }

    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) {
        return next(new createError(404, `Complaint not found with id ${req.body.contract}`));
    }

    const contract = await Contract.findById(complaint.contract);
    
    if (contract.student.toString() !== req.user.id) {
        return next(new createError(403, `You can not update complaint of another user`));
    }


    if (complaint.status !== Processing) {
        return next(new createError(403, `Contract has been saved, you can not update a complaint`));
    }

    complaint.status = Canceled;
    await complaint.save();

    contract.status = Happening;
    await contract.save();

    res.status(200).json({
        success: true,
        data: {
            complaint,
            contract
        }
    });
});

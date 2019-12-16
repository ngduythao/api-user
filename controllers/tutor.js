const mongoose = require('mongoose')
const createError = require('http-errors');
const asyncHandler = require('../middleware/async');
const Tutor = require('../models/Tutor');
const Contract = require('../models/Contract');

// @route     GET /api/tutors
// @access    Public
exports.getTutors = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const matchObject = {};
    const sortObject = {};
    const pagination = {};

    if (req.query.address) {
        matchObject['userInfo.address'] = {
            $regex: req.query.address,
            '$options': 'i'
        }
    }

    if (req.query.paymentPerHour) {
        const parseField = ['gt', 'gte', 'lt', 'lte'];
        parseField.forEach(param => {
            if (req.query.paymentPerHour[param]) {
                req.query.paymentPerHour[param] = parseInt(req.query.paymentPerHour[param]);
            }
        })

        const queryStr = JSON.stringify(req.query)
            .replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
        const query = (JSON.parse(queryStr));

        matchObject.paymentPerHour = query.paymentPerHour;
    }


    if (req.query.specialization) {
        req.query.specialization = mongoose.Types.ObjectId(req.query.specialization);
        matchObject.specialization = {
            $eq: req.query.specialization
        }
    }

    if (req.query.tags) {
        const tags = req.query.tags.split(',');
        for (let i = 0; i < tags.length; i++) tags[i] = mongoose.Types.ObjectId(tags[i]);
        req.query.tags = tags;
        matchObject.tags = {
            $all: req.query.tags
        }
    }

    if (req.query.sort) {
        const sorts = req.query.sort.split(',');
        for (let s of sorts) {
            if (s[0] === '-') sortObject[s] = -1; // descending
            else sortObject[s] = 1; // ascending            
        }
    } else {
        sortObject['successRate'] = -1;
    }

    // console.log(matchObject);

    const pipelineSearch = [{
            $lookup: {
                from: 'users',
                localField: 'userInfo',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $unwind: '$userInfo'
        },
        {
            $match: {
                ...matchObject,
            }
        }
    ]


    const pipelinePopulate = [{
            $sort: sortObject
        },
        {
            $skip: startIndex,
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: 'tags',
                let: {
                    'tagIds': '$tags'
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{
                                    $in: ['$_id', '$$tagIds']
                                },
                                {
                                    $eq: ['$isActive', true]
                                }
                            ]
                        }
                    }
                }],
                as: 'tags'
            }
        },
        {
            $lookup: {
                from: 'specializations',
                localField: 'specialization',
                foreignField: '_id',
                as: 'specialization'
            }
        },
        {
            $unwind: 
                {
                    path: '$specialization',
                    preserveNullAndEmptyArrays: true
                } 
        },
        {
            $lookup: {
                from: 'contracts',
                localField: '_id',
                foreignField: 'tutor',
                as: 'histories'
            }
        },
        {
            $unwind: 
            {
                path: '$histories',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'students',
                localField: 'histories.student',
                foreignField: '_id',
                as: 'histories.student'
            }
        },
        {
            $unwind:{ 
                path: '$histories.student',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'histories.student.userInfo',
                foreignField: '_id',
                as: 'histories.student.userInfo'
            }
        },
        {
            $unwind: 
            { 
                path: '$histories.student.userInfo',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: '$_id',
                userInfo: {
                    $first: '$userInfo'
                },
                averageRating: {
                    $first:'$averageRating'
                },
                paymentPerHour: {
                    $first: '$paymentPerHour'
                },
                selfIntro: {
                    $first: '$selfIntro'
                },
                successRate: {
                    $first: '$successRate'
                },
                specialization: {
                    $first: '$specialization'
                },
                tags: {$first: '$tags'},
                histories: {'$push': '$histories'}
            }
        }
    ]

    const pipeline = [...pipelineSearch, ...pipelinePopulate];
    const results = await Tutor.aggregate(pipeline);

    const tutors = await Tutor.aggregate(pipelineSearch);
    const count = tutors.length;

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


    res.status(200).json({
        success: true,
        data: {
            count,
            pagination,
            results
        }
    });
});


// @route     GET /api/tutors/:idTutor
// @access    Public
exports.getTutor = asyncHandler(async (req, res, next) => {
    const tutor = await Tutor.findById(req.params.id)
        .populate([{
                path: 'userInfo',
                select: '-password',
                match: {
                    isActive: true
                }
            },
            {
                path: 'tags',
                match: {
                    isActive: true
                }
            },
            {
                path: 'specialization',
                select: 'name',
                match: {
                    isActive: true
                }
            },
            {
                path: 'histories',
                populate: {
                    path: 'student',
                    populate: {
                        path: 'userInfo'
                    }
                }
            }
        ])

    if (!tutor || !tutor.userInfo) {
        return next (new createError(404, 'Tutor not found or has been locked'));
    }

    res.status(200).json({
        success: true,
        data: tutor
    });
})


// @route     PUT /api/tutors/:idTutor
// @access    Private
// @note      only tutor can update these information, and use id of tutor - not user
exports.updateTutor = asyncHandler(async (req, res, next) => {
    const user = await Tutor.findOneAndUpdate({
            _id: req.user.id,
        }, req.body, {
            new: true,
            runValidators: true
        })
        .populate([{
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
        }]);

    if (!user) {
        return next(new createError(404, 'User not found'));
    }
    res.status(200).json({
        success: true,
        data: user
    });
});



// @route     GET /api/tutors/:idTutor/statistics
// @access    Private
// @note      Get statistics amount of tutor is logged in
exports.getStatistics = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'student') {
        return next(new createError(403,'You can not authorize to access this page'));
    }

    const contracts = await Contract.aggregate([
        {
            $match: {
                tutor: mongoose.Types.ObjectId(req.user.id)
            }
        },
        {
            $group: {
                _id: '$status',
                numberOfContracts: {$sum: 1},
                totalAmount: {
                    $sum: '$contractAmount'
                }
            }
        }
    ]);


    res.status(200).json({
        success: true,
        data: contracts
    });
});

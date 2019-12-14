const mongoose = require('mongoose')

const asyncHandler = require('../middleware/async');
const Tutor = require('../models/Tutor');
const User = require('../models/User');

// @route     GET /api/tutors
// @access    Public
exports.getTutors = asyncHandler(async (req, res, next) => {
    const matchObject = {};
    if (!req.query.address) {
        req.query.address = 'King';
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
        console.log(typeof (tags[0]), typeof (mongoose.Types.ObjectId('5df3a6a8a0a5d03dac29e3c1')));
        matchObject.tags = {
            $all: req.query.tags
        }
    }

    if (req.query.sort) {
        const sortObject = {};
        const sorts = req.query.sort.split(',');
        for (let s of sorts) {
            if (s[0] === '-') sortObject[s] = -1; // descending
            else sortObject[s] = 1; // ascending            
        }
        req.query.sort = sortObject;
    }



    const pipeline = [{
            $lookup: {
                from: 'users',
                localField: 'userInfo',
                foreignField: '_id',
                as: 'userInfo' // override the old one
            }
        },
        {
            $unwind: '$userInfo' // now this look like populate
        },
        {
            $match: {
                ...matchObject,
                'userInfo.address': {
                    $regex: req.query.address,
                    '$options': 'i'
                },
                paymentPerHour: {
                    $gte: 15,
                    $lte: 25
                }
            }
        },
        {
            $sort: req.query.sort // {'userInfo.name': 1}
        },
        {
            $skip: parseInt(req.query.page, 10) || 1,
        },
        {
            $limit: parseInt(req.query.limit, 10) || 8
        },
        // populate the
        {
            $lookup: {
                from: 'tags',
                localField: 'tags',
                foreignField: '_id',
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
            $unwind: '$specialization'
        }
    ]


    const tutors = await Tutor.aggregate(pipeline)



    res.status(200).json({
        success: true,
        length: tutors.length,
        data: tutors
    });
});


// @route     PUT /api/tutors/:idTutor
// @access    Private
// @note      only tutor can update these information, and use id of tutor - not user
exports.updateTutor = asyncHandler(async (req, res, next) => {
    const user = await Tutor.findOneAndUpdate({
            _id: req.params.id,
        }, req.body, {
            new: true,
            runValidators: true
        })
        .populate('userInfo');

    res.status(200).json({
        success: true,
        data: user
    });
});


// const pipeline2 = [{
//     $match: {
//         address: {
//             $regex: req.params.address,
//             '$options': 'i'
//         }
//     }
// }]
// await User.aggregate(pipeline2);

// to use comparision gt,lt, v.., must place it in pipiline, in this case that is $match

// find -> select -> sort -> popuplate
// const pipeline = [{
//         $lookup: {
//             from: 'users',
//             localField: 'userInfo',
//             foreignField: '_id',
//             as: 'userInfo' // override the old one
//         }
//     },
//     {
//         $unwind: '$userInfo' // now this look like populate
//     },
//     {
//         $match: {
//             'userInfo.address': {
//                 $regex: req.query.address,
//                 '$options': 'i'
//             },
//             paymentPerHour: {
//                 $gte: 15,
//                 $lte: 25
//             },
//             specialization: {
//                 // $eq: mongoose.Types.ObjectId('5df4468e86cbb71fa8849c04'),
//                 $eq: req.query.specialization
//             },
//             tags: {
//                 // $all: [mongoose.Types.ObjectId('5df3a6a8a0a5d03dac29e3c1'), mongoose.Types.ObjectId('5df4469986cbb71fa8849c05')]
//                 $all: req.query.tags
//             }
//         }
//     },
//     {
//         $sort: req.query.sort // {'userInfo.name': 1}
//     },
//     {
//         $skip: parseInt(req.query.page, 10) || 1,
//     },
//     {
//         $limit: parseInt(req.query.limit, 10) || 8
//     },
//     // populate the
//     {
//         $lookup: {
//             from: 'tags',
//             localField: 'tags',
//             foreignField: '_id',
//             as: 'tags'
//         }
//     },
//     {
//         $lookup: {
//             from: 'specializations',
//             localField: 'specialization',
//             foreignField: '_id',
//             as: 'specialization'
//         }
//     },
//     {
//         $unwind: '$specialization'
//     }
// ]
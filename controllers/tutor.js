const asyncHandler = require('../middleware/async');
const Tutor = require('../models/Tutor');

exports.getTutors = asyncHandler(async (req, res, next) => {
    return res.status(200).json(res.advancedSearch);
});


// only tutor can update these information
exports.updateTutor = asyncHandler(async (req, res, next) => {
    const user = await Tutor.findOneAndUpdate({
            _id: req.params.id
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

const asyncHandler = require('../middleware/async');
const Tutor = require('../models/Tutor');


// @route     GET /api/tutors
// @access    Public
exports.getTutors = asyncHandler(async (req, res, next) => {
    return res.status(200).json(res.advancedSearch);
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

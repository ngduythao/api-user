const asyncHandler = require('../middleware/async');
const Tutor = require('../models/Tutor');


// only tutor can update these information
exports.updateTutor = asyncHandler(async (req, res, next) => {
    const user = await Tutor.findOneAndUpdate({
            _id: req.params.id
        }, req.body, {
            new: true,
            runValidators: true
        })
        .populate('user');

    res.status(200).json({
        success: true,
        data: user
    });
});

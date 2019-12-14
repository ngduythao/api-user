const asyncHandler = require('../middleware/async');
const Specialization = require('../models/Specialization');


exports.getSpecializations = asyncHandler(async (req, res, next) => {
    const specializations = await Specialization.find({
        isActive: true
    });
    res.status(200).json({
        success: true,
        data: specializations
    });
});

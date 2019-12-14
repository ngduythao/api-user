const asyncHandler = require('../middleware/async');
const Tag = require('../models/Tag');


exports.getTags = asyncHandler(async (req, res, next) => {
    const tags = await Tag.find({
        isActive: true
    });

    res.status(200).json({
        success: true,
        data: tags
    });
});

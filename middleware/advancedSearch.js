const createError = require('http-errors');

const advancedSearch = (model, populate) => async (req, res, next) => {
    let query, results;

    const reqQuery = {
        ...req.query
    };

    const removeFields = ['address', 'limit', 'page', 'select', 'sort'];

    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);

    // https://stackoverflow.com/questions/11839765/whats-wrong-with-in-in-mongoose
    // Create operators by $ before operators
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    query = model.find(JSON.parse(queryStr));


    // ex: ?select=paymentPerHour,userInfo
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // ex: ?select=paymentPerHour,userInfo&sort=name
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }


    // ex: select=paymentPerHour&page=2&limit=10
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }


    try {
       results  = await query;
    } catch (error) {
        return next(new createError(404, 'Không tìm thấy nội dung'));
    }

    
    if (req.query.address) {
        results = results.filter(result => result.userInfo.address.includes(req.query.address));
    }
    
    // this is if location is object, populate property then find
    // results = results.filter(result =>
    //     Object.values(req.query.address).some(property =>
    //         Object.values(result.address).includes(property)));
    
    const pagination = {};

    if (endIndex < total) {
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
        success: true,
        count: results.length,
        pagination,
        data: results
    };
    next();
};

module.exports = advancedSearch;

// type: function
// input: Mongoose model & populate property
// output: middleware function
// des: search include select fields, filter, sort, paging
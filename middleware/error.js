const createError = require('http-errors');

const errorHandler = (err, req, res, next) => {
    let error = {...err}; 

    error.message = err.message;

    console.log(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = new createError(404, message);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new createError(404,message);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new createError(400, message);
    }


    res.status(err.status || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};



module.exports = errorHandler;

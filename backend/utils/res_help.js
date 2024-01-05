const giveresponse = (res, statusCode, success, message, data = null) => {
 var data = data ? data : {};
 var statusCode = statusCode || 500;
 return res.status(statusCode).json({ status: statusCode, success, message, data });
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { giveresponse, asyncHandler };

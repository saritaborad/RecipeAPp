const { giveresponse } = require("../utils/res_help");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
 const token = req.cookies.token;
 if (!token) return giveresponse(res, 403, false, "Not authorized, token missing");

 try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ _id: decoded._id });
  req.user = user;
  next();
 } catch (error) {
  return giveresponse(res, 403, false, error.message);
 }
};

module.exports = authenticate;

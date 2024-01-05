const User = require("../models/User");
const { asyncHandler, giveresponse } = require("../utils/res_help");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = asyncHandler(async (req, res, next) => {
 const { email, password } = req.body;
 const user = await User.findOne({ email });
 if (!user) return giveresponse(res, 404, false, "User not found");
 const matched = bcrypt.compare(password, user.password);
 if (!matched) return giveresponse(res, 400, false, "Invalid credential");
 const token = jwt.verify(token, process.env.JWT_SECRET);
 res.cookie("token", token);
 return giveresponse(res, 200, true, "Login success");
});

exports.register = asyncHandler(async (req, res, next) => {
 const { email, password } = req.body;
 const exist = await User.findOne({ email });
 if (exist) return giveresponse(res, 400, false, "User already exist");
 const hashPass = await bcrypt.hash(password, 10);
 const user = new User({ email, password: hashPass });
 await user.save();
 return giveresponse(res, 200, true, "User register success");
});

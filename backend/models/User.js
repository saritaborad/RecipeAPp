const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
 username: String,
 password: String,
 savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
});

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;

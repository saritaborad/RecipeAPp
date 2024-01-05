const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
 title: String,
 image: String,
 summary: String,
 ingredients: [String],
 instructions: String,
 nutritionalInfo: String,
 recipeId: Number,
});

const RecipeModel = mongoose.model("Recipe", recipeSchema);
module.exports = RecipeModel;

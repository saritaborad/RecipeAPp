const axios = require("axios");
const config = require("../config");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const { giveresponse, asyncHandler } = require("../utils/res_help");

exports.searchRecipes = async (res, res) => {
 const { query } = req.query;

 try {
  const response = await axios.get("https://api.spoonacular.com/recipes/search", {
   params: {
    apiKey: spoonacularApiKey,
    query,
   },
  });

  const recipes = response.data.results;
  res.json({ recipes });
 } catch (error) {
  console.error("Error fetching recipes:", error.message);
  res.status(500).json({ error: "Internal Server Error" });
 }
};

exports.savePreferance = async (req, res) => {
 const { recipeId } = req.body;
 const user = req.user;
 const existRecipe = await Recipe.findOne({ recipeId });
 if (!existRecipe) {
  const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true`);
  const newRecipe = new Recipe({
   title: response.data.title,
   image: response.data.image,
   summary: response.data.summary,
   ingredients: response.data.extendedIngredients.map((ingredient) => ingredient.originalName),
   instructions: response.data.instructions,
   nutritionalInfo: response.data.nutrition.nutrients.map((nutrient) => `${nutrient.title}: ${nutrient.amount} ${nutrient.unit}`).join(", "),
   recipeId: response.data.id,
  });
  await newRecipe.save();
  user.savedRecipes.push(newRecipe._id);
  await user.save();
  return res.json({ message: "Recipe saved" });
 } else {
  return res.json({ message: "Recipe already saved!" });
 }
};

exports.getSavedRecipe = asyncHandler(async (req, res) => {
 const user = req.user.populate("savedRecipes");
 return giveresponse(res, 200, true, "Saved recipe get success", { savedRecipes: user.savedRecipes });
});

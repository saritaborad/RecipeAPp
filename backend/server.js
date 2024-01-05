// server.js

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const OatStrategy = require("passport-oauth2-oat").Strategy;
const session = require("express-session");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/recipeApp", { useNewUrlParser: true, useUnifiedTopology: true });

// Define User schema and model (you can customize this based on your needs)
const userSchema = new mongoose.Schema({
 username: String,
 savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
});

const User = mongoose.model("User", userSchema);

// Define Recipe schema and model (you can customize this based on your needs)
const recipeSchema = new mongoose.Schema({
 title: String,
 image: String,
 summary: String,
 ingredients: [String],
 instructions: String,
 nutritionalInfo: String,
});

const Recipe = mongoose.model("Recipe", recipeSchema);

// Passport OAT configuration
passport.use(
 new OatStrategy({ passReqToCallback: true }, async (req, token, tokenSecret, profile, done) => {
  // You can implement user registration and authentication logic here
  let user = await User.findOne({ username: profile.username });

  if (!user) {
   user = new User({ username: profile.username });
   await user.save();
  }

  return done(null, user);
 })
);

passport.serializeUser((user, done) => {
 done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
 const user = await User.findById(id);
 done(null, user);
});

// Express middleware
app.use(session({ secret: "your-secret-key", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// API endpoint to fetch recipes from Spoonacular API
app.get("/api/recipes/search", async (req, res) => {
 try {
  const { query } = req.query;
  const response = await axios.get(`https://api.spoonacular.com/recipes/search?query=${query}&apiKey=your-spoonacular-api-key`);
  res.json({ recipes: response.data.results });
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: "Internal Server Error" });
 }
});

// API endpoint to save a recipe to the user's preferences
app.post("/api/user/preferences/save", passport.authenticate("oauth2-oat", { session: true }), async (req, res) => {
 try {
  const { recipeId } = req.body;
  const user = req.user;

  // Assuming recipeId is the Spoonacular recipe ID
  const existingRecipe = await Recipe.findOne({ recipeId });

  if (!existingRecipe) {
   const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=your-spoonacular-api-key`);

   const newRecipe = new Recipe({
    title: response.data.title,
    image: response.data.image,
    summary: response.data.summary,
    ingredients: response.data.extendedIngredients.map((ingredient) => ingredient.originalString),
    instructions: response.data.instructions,
    nutritionalInfo: response.data.nutrition.nutrients.map((nutrient) => `${nutrient.title}: ${nutrient.amount}${nutrient.unit}`).join(", "),
   });

   await newRecipe.save();
   user.savedRecipes.push(newRecipe);
   await user.save();
   res.json({ message: "Recipe saved successfully" });
  } else {
   res.status(400).json({ error: "Recipe already saved" });
  }
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: "Internal Server Error" });
 }
});

// API endpoint to fetch the user's saved recipes
app.get("/api/user/preferences/saved", passport.authenticate("oauth2-oat", { session: true }), async (req, res) => {
 try {
  const user = req.user.populate("savedRecipes");
  res.json({ savedRecipes: user.savedRecipes });
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: "Internal Server Error" });
 }
});

// Start the server
app.listen(PORT, () => {
 console.log(`Server is running on http://localhost:${PORT}`);
});

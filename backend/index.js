const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const OauthStrategy = require("passport-oauth2");
const session = require("express-session");
const User = require("./models/User");
const userRoutes = require("./routes/User");
const recipeRoutes = require("./routes/Receipe");

const app = express();
const PORT = process.env.PORT || 3014;
app.use(session({ secret: "", resave: true, saveUninitialized: true }));
app.use("/user", userRoutes);
app.use("/recipes", recipeRoutes);

app.use(passport.initialize());
app.use(passport.session());
passport.use(
 new OauthStrategy({ authorizationURL: "", tokenURL: "", clientID: "", clientSecret: "", callbackURL: "" }, async (accessToken, refreshToken, profile, done) => {
  try {
   const user = await User.findOne({ username: profile.username });
   if (!user) {
    const newUser = new User({ username: profile.username, password: bcrypt.hashSync("fcmo", 10) });
    await newUser.save();
    return done(null, newUser);
   } else {
    return done(null, user);
   }
  } catch (error) {
   return done(null, error);
  }
 })
);

passport.serializeUser((user, done) => {
 done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
 const user = await User.findById({ id }, (err, user) => {
  done(err, user);
 });
});

app.listen(PORT, () => {
 console.log(`server is listening on http://localhost:${PORT}`);
});

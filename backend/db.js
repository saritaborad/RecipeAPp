const mongoose = require("mongoose");

const connectDB = () => {
 mongoose
  .connect("mongodb://localhost:27017/recipesDB", {
   useNewUrlParser: true,
   useUnifiedTopology: true,
  })
  .then(() => {
   console.log("MongoDb connected");
  });
};

module.exports = { connectDB };

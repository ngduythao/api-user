const mongoose = require("mongoose");
require("dotenv").config();
mongoose.Promise = global.Promise;

const url =
  "mongodb+srv://" +
  process.env.MONGO_USER +
  ":" +
  process.env.MONGO_PW +
  "@apollo-ku1tl.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(url, { useNewUrlParser: true });
mongoose.connection.once("open", () =>
  console.log(`Connected to mongo at ${url}`)
);

const express = require("express");
const app = express();
const bodyParser = require("body-parser");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

const cookieParser = require("cookie-parser");
app.use(cookieParser());
require("./utilities/passportConfig");

app.use(require("./routers/auth"));
app.use(require("./routers/survey"));
app.use(require("./routers/module"));
app.use(require("./routers/image"));

app.listen(process.env.PORT, () => {
  console.log("listen on port " + process.env.PORT);
});

const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fileName: String,
});

module.exports = mongoose.model("Image", imageSchema);

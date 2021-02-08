const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  authorId: String,
  title: String,
  detail: { type: String, default: "" },
  beginTime: Date,
  endTime: Date,
  modules: [{ type: mongoose.Types.ObjectId, ref: "Module" }],
});

module.exports = mongoose.model("Survey", surveySchema);

const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  surveyId: String,
  title: { type: String, default: "Undefined Title" },
  type: String,
  required: { type: Boolean, default: true },
  setting: Object,
});

module.exports = mongoose.model("Module", moduleSchema);

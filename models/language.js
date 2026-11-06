const mongoose = require("mongoose");

const languageSchema = new mongoose.Schema({
    language: { type: String, required: true },
    parent: { type: String },
    relationship: { type: String },
    phonemes: { type: [String], default: [] }
});

module.exports = mongoose.model("Language", languageSchema, "languages");
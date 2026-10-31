const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
    word: { type: String, required: true },
    structure: { type: String },
    derives: { type: String },
    class: { type: String },
    function: { type: String },
    morphemes: { type: [String], default: [] },
    meaning: { type: [String], default: [] }
});

module.exports = mongoose.model("Word", wordSchema, "words");
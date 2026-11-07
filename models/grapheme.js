const mongoose = require("mongoose");

const graphemeSchema = new mongoose.Schema({
    grapheme: { type: String, required: true },
    language: { type: String, required: true },
    phonemes: { type: [String] },
    pronunciation: { type: String }
});

module.exports = mongoose.model("Grapheme", graphemeSchema, "graphemes");
const mongoose = require("mongoose");

const graphemeSchema = new mongoose.Schema({
    grapheme: { type: String, required: true },
    language: { type: String, required: true },
    function: { type: String },
    phonemes: { type: [String] },
    pronunciation: { type: String }
},{
    versionKey: false
});

module.exports = mongoose.model("Grapheme", graphemeSchema, "graphemes");
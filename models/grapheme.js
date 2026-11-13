const mongoose = require("mongoose");

const graphemeSchema = new mongoose.Schema({
    language: { type: String, required: true },
    grapheme: { type: String, required: true },
    function: { type: String },
    phonemes: { type: [String] },
    pronunciation: { type: String }
},{
    versionKey: false
});

module.exports = mongoose.model("Grapheme", graphemeSchema, "graphemes");
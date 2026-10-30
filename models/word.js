const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
    word: { type: String, required: true },
    structure: { type: String },
    derives: { type: String },
    class: { type: String },
    function: { type: String },
    morphemes: { type: mongoose.Schema.Types.Mixed },
    meaning: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model("Word", wordSchema, "words");
const mongoose = require("mongoose");

const morphemeSchema = new mongoose.Schema({
    morpheme: { type: String, required: true },
    language: { type: String },
    derives: { type: String },
    meaning: { type: String },
    inspiration_language: { type: String },
    derived_from: { type: String },
    real_meaning: { type: [String], default: [] }
});

module.exports = mongoose.model("Morpheme", morphemeSchema, "morphemes");
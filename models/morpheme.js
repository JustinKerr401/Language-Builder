const mongoose = require("mongoose");

const morphemeSchema = new mongoose.Schema({
    morpheme: { type: String, required: true },
    language: { type: String },
    type: { 
        type: String,
        enum: [
            "free",
            "bound"
        ]
    },
    meaning: { type: String },
    affixType: { 
        type: String,
        enum: [
            "prefix",
            "suffix",
            "infix",
            "circumfix"
        ]
    },
    inspiration_word: { type: String },
    inspiration_language: { type: String },
    inspiration_meaning: { type: [String], default: [] }
});

module.exports = mongoose.model("Morpheme", morphemeSchema, "morphemes");
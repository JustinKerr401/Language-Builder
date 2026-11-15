const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
    word: { type: String, required: true },
    language: { type: String, required: true},
    structure: { 
        type: String,
        enum: [
            "simplex",
            "derived",
            "compound",
            "inflected"
        ]
    },
    class: { 
        type: String,
        enum: [
            "noun",
            "verb",
            "adjective",
            "adverb",
            "pronoun",
            "determiner",
            "adposition",
            "conjunction"
        ]
    },
    morphemes: { type: [String], default: [] },
    meaning: { type: [String], default: [] }
},{
    versionKey: false
});

wordSchema.index(
    {
        word: 1,
        language: 1
    },
    {
        unique: true
    }
)

module.exports = mongoose.model("Word", wordSchema, "words");
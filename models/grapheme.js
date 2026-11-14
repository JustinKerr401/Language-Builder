const mongoose = require("mongoose");

const graphemeSchema = new mongoose.Schema({
    grapheme: { type: String, required: true },
    language: { type: String, required: true },
    function: { 
        type: String,
        enum: [
            "",
            "vowel",
            "consonant"
        ]
    },
    phonemes: { type: [String] },
    pronunciation: { type: String }
},{
    versionKey: false
});

graphemeSchema.index(
    {
        grapheme: 1,
        language: 1
    },
    {
        unique: true
    }
)

module.exports = mongoose.model("Grapheme", graphemeSchema, "graphemes");
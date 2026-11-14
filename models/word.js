const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
    language: { type: String, required: true},
    word: { type: String, required: true },
    structure: { type: String },
    derives: { type: String },
    class: { type: String },
    function: { type: String },
    morphemes: { type: [String], default: [] },
    meaning: { type: [String], default: [] }
},{
    versionKey: false
});

wordSchema.index(
    {
        language: 1,
        word: 1
    },
    {
        unique: true
    }
)

module.exports = mongoose.model("Word", wordSchema, "words");
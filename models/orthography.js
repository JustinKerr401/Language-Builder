const mongoose = require("mongoose");

const orthographySchema = new mongoose.Schema({
    language: { type: String, required: true },
    writing_system: {
        type: String,
        enum: [
            "alphabet",
            "syllabary"
        ]
    },
    spelling_conventions: { type: [String], default: []}
},{
    versionKey: false
});

orthographySchema.index(
    {
        language: 1
    },
    {
        unique: true
    }
)

module.exports = mongoose.model("Orthography", orthographySchema, "orthography");
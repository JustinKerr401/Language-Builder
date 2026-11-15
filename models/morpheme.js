const mongoose = require("mongoose");

const morphemeSchema = new mongoose.Schema({
    morpheme: { type: String, required: true },
    language: { type: String, required: true },
    type: { 
        type: String,
        enum: [
            "free",
            "bound"
        ]
    },
    ancestral_morpheme: { type: String },
    meaning: { type: [String], default: [] },
    affixPosition: { 
        type: String,
        enum: [
            "",
            "prefix",
            "suffix",
            "infix",
            "circumfix"
        ]
    },
    affixType: {
        type: String, 
        enum: [
            "",
            "Derivational",
            "Inflectional"
        ]
    },
    inspiration_word: { type: String },
    inspiration_language: { type: String },
    inspiration_meaning: { type: [String], default: [] }
},{
    versionKey: false
});

morphemeSchema.index(
    {
        morpheme: 1,
        language: 1
    },
    {
        unique: true
    }
)

module.exports = mongoose.model("Morpheme", morphemeSchema, "morphemes");
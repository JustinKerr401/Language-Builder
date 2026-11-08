const mongoose = require("mongoose");

const languageSchema = new mongoose.Schema({
    language: { type: String, required: true },
    parent: { type: String },
    relationship: { 
        type: String,
        enum: ["", "daughter", "dialect"]
    },
    writing_system: { 
        type: String,
        enum: [
            "",
            "alphabet",
            "syllabary",
            "logography"
        ]
    },
    phonemes: { type: [String], default: [] },
    notes: { type: String }
});

module.exports = mongoose.model("Language", languageSchema, "languages");
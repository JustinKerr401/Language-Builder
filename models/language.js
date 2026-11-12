const mongoose = require("mongoose");

const languageSchema = new mongoose.Schema({
    language: { type: String, required: true },
    parent: { type: String },
    relationship: { 
        type: String,
        enum: ["", "daughter", "dialect"]
    },
    phonemes: { type: [String], default: [] },
    notes: { type: String }
},{
    versionKey: false
});

module.exports = mongoose.model("Language", languageSchema, "languages");
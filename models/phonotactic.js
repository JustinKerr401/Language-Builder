const mongoose = require("mongoose");

const phonotacticSchema = new mongoose.Schema({
    name: { type: String },
    language: { type: String, required: true },
    rule_type: { 
        type: String,
        enum: [
            "syllable structure", 
            "clusters"
        ]
    },
    pattern: { type: String },
    description: { type: String },
    status: { 
        type: String, 
        enum: [
            "proposed",
            "established",
            "depreciated"
        ]
    }
});

module.exports = mongoose.model("Phonotactic", phonotacticSchema, "phonotactics");
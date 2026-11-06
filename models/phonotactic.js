const mongoose = require("mongoose");

const phonotacticSchema = new mongoose.Schema({
    language: { type: String, required: true },
    onset_restrictions: { type: {
        min: Number,
        max: Number
    }},
    coda_restrictions: { type: {
        min: Number,
        max: Number
    }},
    consonant_clusters: { type: [String], default: [] }
});

module.exports = mongoose.model("Phonotactic", phonotacticSchema, "phonotactics");
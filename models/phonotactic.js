const mongoose = require("mongoose");

const phonotacticSchema = new mongoose.Schema({
    language: { type: String, required: true },
    onset_min: { type: String },
    onset_max: { type: String },
    coda_min: { type: String },
    coda_max: { type: String },
    consonant_clusters: { type: [String], default: [] }
});

module.exports = mongoose.model("Phonotactic", phonotacticSchema, "phonotactics");
const mongoose = require("mongoose");

const phonotacticSchema = new mongoose.Schema({
    language: { type: String, required: true },
    onset_min: { type: String },
    onset_max: { type: String },
    coda_min: { type: String },
    coda_max: { type: String },
    allowed_clusters: { type: [String], default: [] }
},{
    versionKey: false
});

module.exports = mongoose.model("Phonotactic", phonotacticSchema, "phonotactics");
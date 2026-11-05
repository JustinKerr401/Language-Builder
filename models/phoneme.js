const mongoose = require("mongoose");

const phonemeSchema = new mongoose.Schema({
    phoneme: { type: String, required: true },
    example: { type: String },
    type: { type: String },
    place: { type: String },
    manner: { type: String },
    voicing: { type: String }
});

module.exports = mongoose.model("Phoneme", phonemeSchema, "phonemes");
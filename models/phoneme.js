const mongoose = require("mongoose");

const phonemeSchema = new mongoose.Schema({
    phoneme: { type: String, required: true },
    example: { type: [String], default: [] },
    type: { 
        type: String,
        enum: ["vowel", "consonant"] 
    },
    place: { 
        type: String,
        enum: [
            "front",
            "near-front",
            "central",
            "near-back",
            "back",
            "bilabial",
            "labiodental",
            "dental",
            "alveolar",
            "post alveolar",
            "retroflex",
            "velar",
        ]
    },
    manner: { 
        type: String,
        enum: [
            "close",
            "near-close",
            "close-mid",
            "mid",
            "open-mid",
            "near-open",
            "open",
            "plosive",
            "nasal",
            "trill",
            "tap or flap",
            "fricative",
            "lateral approximant"
        ] 
    },
    voicing: { 
        type: String,
        enum: ["", "voiced", "unvoiced"] 
    },
    rounded: { 
        type: String,
        enum: ["", "rounded", "unrounded"]
    }
});

module.exports = mongoose.model("Phoneme", phonemeSchema, "phonemes");
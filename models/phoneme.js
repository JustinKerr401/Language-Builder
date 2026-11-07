const mongoose = require("mongoose");

const phonemeSchema = new mongoose.Schema({
    phoneme: { type: String, required: true },
    readible_form: { type: String },
    example: { type: [String], default: [] },
    type: { 
        type: String,
        enum: ["vowel", "consonant"] 
    },
    place: { 
        type: String,
        enum: [
            "",
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
            "palatal",
            "velar",
            "labial-velar",
            "palato-alveolar",
            "glottal"
        ]
    },
    manner: { 
        type: String,
        enum: [
            "",
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
            "lateral approximant",
            "approximant",
            "affricate"
        ] 
    },
    voicing: { 
        type: String,
        enum: ["", "voiced", "unvoiced"] 
    },
    rounded: { 
        type: String,
        enum: ["", "rounded", "unrounded"]
    },
    diphthong: { 
        type: String,
        enum: [
            "",
            "monophthong",
            "diphthong"
        ]
    }
});

module.exports = mongoose.model("Phoneme", phonemeSchema, "phonemes");
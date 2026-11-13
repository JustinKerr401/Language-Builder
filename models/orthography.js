const mongoose = require("mongoose");

const orthographySchema = new mongoose.Schema({
    language: { type: String, required: true }
},{
    versionKey: false
});

module.exports = mongoose.model("Orthography", orthographySchema, "orthography");
const mongoose = require("mongoose");

const orthographySchema = new mongoose.Schema({
    language: { type: String, required: true }
},{
    versionKey: false
});

orthographySchema.index(
    {
        language: 1
    },
    {
        unique: true
    }
)

module.exports = mongoose.model("Orthography", orthographySchema, "orthography");
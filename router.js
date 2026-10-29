
const express = require("express");
const path = require("path");

const Morpheme = require('./models/morpheme')

const router = express.Router();

// Serve the home page
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

// Save a morpheme
router.post("/save-morpheme", async (req, res) => {
    try {
        const morphemeData = req.body;

        const newMorpheme = new Morpheme(morphemeData);

        await newMorpheme.save();

        res.status(201).json({
            message: "Morpheme saved successfully!",
            morpheme: newMorpheme
        });

    } catch (error) {
        console.error("Error saving morpheme:", error);

        res.status(500).json({
            message: "Error saving morpheme",
            error: error.message
        });
    }
});

module.exports = router;

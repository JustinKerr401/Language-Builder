
const express = require("express");
const path = require("path");

const Morpheme = require('./models/morpheme')
const Word = require('./models/word')

const router = express.Router();

// Serve the home page
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

// ------------------------------ Pulling from database ------------------------------
// Specifically, for any given collection, only either the keys or everything per document

router.get("/data", async (req, res) => {
    try {
        const { type } = req.query
        let data;

        switch (type){
            case "morphemes":
                data = await Morpheme.find();
                break
            case "morphemes-list":
                data = await Morpheme.find().select("morpheme -_id")
                break
            case "words":
                data = await Word.find()
                break;
            case "words-list":
                data = await Word.find().select("word -_id")
                break
        }
        res.json(data)
        
    } catch {
        res.status(500).json({ error: error.message })
    }
})

// ------------------------------ Saving to database ------------------------------

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

// Save a word
router.post("/save-word", async (req, res) => {
    try {
        const wordData = req.body;

        const newWord = new Word(wordData);

        await newWord.save();

        res.status(201).json({
            message: "Word saved successfully!",
            word: newWord
        });

    } catch (error) {
        console.error("Error saving word:", error);

        res.status(500).json({
            message: "Error saving word",
            error: error.message
        });
    }
});

module.exports = router;

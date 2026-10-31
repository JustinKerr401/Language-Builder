
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

// Fully functional query for database
router.get("/data", async (req, res) => {
    //      /data?collection=morphemes&fields=morpheme,meaning&filter=language:Latin,inspiration_language:Greek
    try {
        // Variable to return
        let data;
        // Break down query
        const { collection, fields, filter } = req.query
        // Get values for fields and filter if they exist
        let fieldsString = ""
        if (fields) fieldsString = fields.split(",").join(" ")
        const filterObject = {}
        if (filter){
            filter.split(",").forEach(condition => {
                const [field, value] = condition.split(":")
                filterObject[field] = value
            })
        }
        // Execute query, different models for each
        switch (collection){
            case "morphemes":
                data = await Morpheme.find(filterObject).select(`${fieldsString} -_id`)
                break
            case "words":
                data = data = await Word.find(filterObject).select(`${fieldsString} -_id`)
                break
        }

        // Return data
        res.json(data)
        
    } catch {
        res.status(500).json({ error: error.message })
    }
})

// ------------------------------ Saving to database ------------------------------

// Save any saved value
router.post("/save", async (req, res) => {
    //      /data?collection=morphemes
    try {
        // Identify collection to save to
        const collection = Object.keys(req.query)[0];
        // Store the data
        const data = req.body;
        let value = ""

        switch (collection){
            case "morphemes":
                value = new Morpheme(data)
                break
            case "words":
                value = new Word(data)
                break
        }

        await value.save()

        res.status(201).json({
            message: "Morpheme saved successfully!",
            value: value
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

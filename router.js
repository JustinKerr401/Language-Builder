
const express = require("express");
const path = require("path");

const Phoneme = require('./models/phoneme')
const Morpheme = require('./models/morpheme')
const Word = require('./models/word')
const Language = require('./models/language')

const router = express.Router();

// ------------------------------ Serving pages ------------------------------

// Serve the home page
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

// Serve the table page
router.get("/table", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "table.html"));
});

// ------------------------------ Pulling from database ------------------------------

// Get the schema for a collection
router.get("/getSchema", (req, res) => {
    //  /getSchema?collection=

    let model;
    switch (req.query.collection) {
        case "phonemes":
            model = Phoneme;
            break
        case "words":
            model = Word;
            break;
        case "languages":
            model = Language;
            break;
        case "morphemes":
            model = Morpheme;
            break;
        default:
            return res.status(400).json({
                error: "Invalid collection"
            });
    }

    const schema = {};

    Object.entries(model.schema.paths).forEach(([name, path]) => {
        if (["_id", "__v"].includes(name)) return;

        schema[name] = {
            type: path.instance,
            required: path.isRequired,
            default: path.defaultValue
        };

        if (path.instance === "Array") {
            schema[name].elementType = path.caster?.instance;
        }
    });

    res.json(schema);
});

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
            case "languages":
                data = data = await Language.find(filterObject).select(`${fieldsString} -_id`)
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
    try {
        // Identify collection to save to
        const collection = Object.keys(req.query)[0];

        // Store the data
        const data = req.body;

        let Model;
        let key;

        switch (collection) {
            case "morphemes":
                Model = Morpheme;
                key = "morpheme";
                break;

            case "words":
                Model = Word;
                key = "word";
                break;
            
            case "languages":
                Model = Language;
                key = "language";
                break

            default:
                return res.status(400).json({
                    message: "Invalid collection"
                });
        }

            // NOT MY CODE: CHATGPT ADDITION
        // Ensure the unique key exists
        if (data[key] === undefined) {
            return res.status(400).json({
                message: `Missing required field: ${key}`
            });
        }

        // Insert if new, replace if existing
        const value = await Model.findOneAndReplace(
            { [key]: data[key] },
            data,
            {
                upsert: true,
                returnDocument: 'after',
                runValidators: true
            }
        );

        res.status(200).json({
            message: `${collection} saved successfully!`,
            value: value
        });

    } catch (error) {
        console.error("Error saving document:", error);

        res.status(500).json({
            message: "Error saving document",
            error: error.message
        });
    }
});

module.exports = router;

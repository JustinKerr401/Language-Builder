
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const Phoneme = require('./models/phoneme')
const Phonotactic = require('./models/phonotactic')
const Orthography = require('./models/orthography')
const Grapheme = require('./models/grapheme')
const Morpheme = require('./models/morpheme')
const Language = require('./models/language')

const router = express.Router();

// ------------------------------ Serving pages ------------------------------

// Serve the home page
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

// Serve the table page
router.get("/le", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "language_editor.html"));
});

// Serve the table page
router.get("/table", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "table.html"));
});

// Serve the grapheme generator
router.get("/gg", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "grapheme_generator.html"));
});

// ------------------------------ Pulling data ------------------------------

// Get the schema for a collection
router.get("/getSchema", (req, res) => {
    //  /getSchema?collection=

    let model;
    switch (req.query.collection) {
        case "phonemes":
            model = Phoneme;
            break
        case "phonotactics":
            model = Phonotactic;
            break
        case "orthography":
            model = Orthography;
            break
        case "graphemes":
            model = Grapheme;
            break
        case "morphemes":
            model = Morpheme;
            break;
        case "words":
            model = Word;
            break;
        case "languages":
            model = Language;
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
            default: path.defaultValue,
            enum: path.enumValues?.length ? path.enumValues : undefined
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
            case "phonemes":
                data = await Phoneme.find(filterObject).select(`${fieldsString} -_id`)
                break
            case "phonotactics":
                data = await Phonotactic.find(filterObject).select(`${fieldsString} -_id`)
                break
            case "orthography":
                data = await Orthography.find(filterObject).select(`${fieldsString} -_id`)
                break
            case "graphemes":
                data = await Grapheme.find(filterObject).select(`${fieldsString} -_id`)
                break
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

router.get("/collectionCheck", async (req, res) => {
    //      /collectionCheck?collection=___
    const collection = req.query.collection.at(-1) === "s" 
        ? req.query.collection 
        : req.query.collection + "s"
    
    if (!collection){
        return res.status(400).json({
            exists: false,
            message: "No collection name provided"
        })
    }

    // Check whether the collection exists
    const exists = await mongoose.connection.db
        .listCollections({ name: collection })
        .hasNext();

    if (!exists) {
        return res.json({
            exists: false,
            collectionName: collection,
            secondAttribute: null
        });
    }

    // Retrieve a document from the collection
    const doc = await mongoose.connection.db
        .collection(collection)
        .findOne();

    // Get the second attribute (including _id)
    let secondAttribute = null;

    if (doc){
        const keys = Object.keys(doc)
        if (keys.length > 0) secondAttribute = keys[1]
    }

    return res.json({
        exists: true,
        collectionName: collection,
        secondAttribute: secondAttribute
    })
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
            case "phonemes":
                Model = Phoneme;
                key = ["phoneme"];
                break;
            
            case "phonotactics":
                Model = Phonotactic
                key = ["language"]
                break
            
            case "orthography":
                Model = Orthography
                key = ["language"]
                break
            
            case "graphemes":
                Model = Grapheme
                key = ["grapheme", "language"]
                break
            
            case "morphemes":
                Model = Morpheme
                key = ["morpheme", "language"]
                break
            
            case "languages":
                Model = Language;
                key = ["language"];
                break

            default:
                return res.status(400).json({
                    message: "Invalid collection"
                });
        }

        // Ensure the unique key exists
        key.forEach(individualKey => {
            if (data[individualKey] === undefined) {
            return res.status(400).json({
                message: `Missing required field: ${key}`
            });
        }
        })
        

        // Assign key object
        let keyObject = {}
        key.forEach(individualKey => {
            keyObject[individualKey] = data[individualKey]
        })

        // Check whether the document already exists
        const existing = await Model.findOne(keyObject);

        let value;

        if (existing) {
            // Update only specified attributes
            value = await Model.findOneAndUpdate(
                keyObject,
                { $set: updateData },
                {
                    returnDocument: 'after',
                    runValidators: true
                }
            );
        } else {
            // Construct new document in schema order
            const orderedData = {};

            Object.keys(Model.schema.paths).forEach(path => {
                if (path !== "_id" && path !== "__v" && data[path] !== undefined) {
                    orderedData[path] = data[path];
                }
            });

            value = await new Model(orderedData).save();
        }

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

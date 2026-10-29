
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const router = require("./router");

const app = express();
const PORT = 4123;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (CSS, JS, images, etc.)
app.use(express.static("public"));

// Register routes
app.use("/", router);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}/`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

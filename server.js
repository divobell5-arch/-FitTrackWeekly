const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FOLDER = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_FOLDER, "reports.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Create data folder and file if missing
if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Read reports
function getReports() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// Save reports
function saveReports(reports) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2));
}

// Test server
app.get("/test", (req, res) => {
    res.send("FitTrack Weekly Server is Running!");
});

// Create report
app.post("/api/reports", (req, res) => {
    try {
        const {
            clientName,
            fitnessGoal,
            startingWeight,
            currentWeight,
            week,
            workouts,
            achievements,
            improvements,
            nextGoals,
            trainerMessage
        } = req.body;

        if (!clientName || !week) {
            return res.status(400).json({
                message: "Client name and week are required."
            });
        }

        const reports = getReports();

        const token = crypto.randomBytes(24).toString("hex");

        const report = {
            id: crypto.randomUUID(),
            token,
            clientName,
            fitnessGoal,
            startingWeight,
            currentWeight,
            week,
            workouts,
            achievements,
            improvements,
            nextGoals,
            trainerMessage,
            createdAt: new Date().toISOString()
        };

        reports.push(report);
        saveReports(reports);

        res.status(201).json({
            message: "Weekly report created successfully!",
            link: `/client/${token}`
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not create report."
        });
    }
});

// Get individual client report
app.get("/api/reports/:token", (req, res) => {
    const reports = getReports();

    const report = reports.find(
        item => item.token === req.params.token
    );

    if (!report) {
        return res.status(404).json({
            message: "Report not found."
        });
    }

    res.json(report);
});

// Client page
app.get("/client/:token", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "client.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`FitTrack Weekly running at http://localhost:${PORT}`);
});
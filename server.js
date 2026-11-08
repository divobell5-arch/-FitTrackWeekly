require("dotenv").config();

const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// Test server
app.get("/test", (req, res) => {
    res.send("FitTrack Weekly Server is Running!");
});

// Convert database report to the format used by the client page
function formatReport(report) {
    return {
        id: report.id,
        token: report.token,
        clientName: report.client_name,
        fitnessGoal: report.fitness_goal,
        startingWeight: report.starting_weight,
        currentWeight: report.current_weight,
        week: report.week,
        workouts: report.workouts,
        achievements: report.achievements,
        improvements: report.improvements,
        nextGoals: report.next_goals,
        trainerMessage: report.trainer_message,
        createdAt: report.created_at
    };
}

// Create report
app.post("/api/reports", async (req, res) => {
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

        const token = crypto.randomBytes(24).toString("hex");

        const { data, error } = await supabase
            .from("client_reports")
            .insert({
                token,
                client_name: clientName,
                fitness_goal: fitnessGoal || null,
                starting_weight: startingWeight === "" ? null : startingWeight || null,
                current_weight: currentWeight === "" ? null : currentWeight || null,
                week,
                workouts: workouts || {},
                achievements: achievements || "",
                improvements: improvements || "",
                next_goals: nextGoals || "",
                trainer_message: trainerMessage || ""
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);

            return res.status(500).json({
                message: "Could not save report."
            });
        }

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
app.get("/api/reports/:token", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("client_reports")
            .select("*")
            .eq("token", req.params.token)
            .maybeSingle();

        if (error) {
            console.error("Supabase error:", error);

            return res.status(500).json({
                message: "Could not retrieve report."
            });
        }

        if (!data) {
            return res.status(404).json({
                message: "Report not found."
            });
        }

        res.json(formatReport(data));

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not retrieve report."
        });
    }
});

// Client page
app.get("/client/:token", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "client.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`FitTrack Weekly running on port ${PORT}`);
});
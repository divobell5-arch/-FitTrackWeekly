const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const workoutDays = document.getElementById("workoutDays");

// Generate workout day sections
days.forEach(day => {

    const card = document.createElement("div");
    card.className = "day-card";

    card.innerHTML = `
        <h4>${day}</h4>

        <label>Workout Focus</label>
        <input type="text" class="focus"
               placeholder="e.g. Chest and Triceps">

        <div class="exercises"></div>

        <button type="button" class="add-btn">
            + Add Exercise
        </button>
    `;

    const exerciseContainer = card.querySelector(".exercises");

    function addExercise() {

        const row = document.createElement("div");
        row.className = "exercise-row";

        row.innerHTML = `
            <input type="text" class="exercise-name"
                   placeholder="Exercise">

            <input type="number" class="sets"
                   placeholder="Sets">

            <input type="number" class="reps"
                   placeholder="Reps">

            <input type="number" class="weight"
                   placeholder="Weight kg" step="0.1">
        `;

        exerciseContainer.appendChild(row);
    }

    card.querySelector(".add-btn").addEventListener("click", addExercise);

    addExercise();

    workoutDays.appendChild(card);
});


// Collect workout information
function collectWorkouts() {

    const workouts = {};

    document.querySelectorAll(".day-card").forEach(card => {

        const day = card.querySelector("h4").textContent;

        const focus = card.querySelector(".focus").value;

        const exercises = [];

        card.querySelectorAll(".exercise-row").forEach(row => {

            const name = row.querySelector(".exercise-name").value;

            if (name.trim() !== "") {

                exercises.push({
                    name,
                    sets: row.querySelector(".sets").value,
                    reps: row.querySelector(".reps").value,
                    weight: row.querySelector(".weight").value
                });

            }

        });

        workouts[day] = {
            focus,
            exercises
        };

    });

    return workouts;
}


// Submit weekly report
document.getElementById("reportForm").addEventListener("submit", async function(e) {

    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    const result = document.getElementById("result");

    submitBtn.disabled = true;
    submitBtn.textContent = "CREATING REPORT...";

    const report = {

        clientName: document.getElementById("clientName").value,

        fitnessGoal: document.getElementById("fitnessGoal").value,

        startingWeight: document.getElementById("startingWeight").value,

        currentWeight: document.getElementById("currentWeight").value,

        week: document.getElementById("week").value,

        workouts: collectWorkouts(),

        achievements: document.getElementById("achievements").value,

        improvements: document.getElementById("improvements").value,

        nextGoals: document.getElementById("nextGoals").value,

        trainerMessage: document.getElementById("trainerMessage").value

    };

    try {

        const response = await fetch("/api/reports", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(report)

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not create report.");
        }

        const clientLink = window.location.origin + data.link;

        result.innerHTML = `
            <h3>Report Created Successfully! 🎉</h3>

            <p>Your client's private report link:</p>

            <p>
                <a href="${data.link}" target="_blank">
                    ${clientLink}
                </a>
            </p>

            <button type="button" id="copyLink">
                COPY CLIENT LINK
            </button>
        `;

        document.getElementById("copyLink").addEventListener("click", async () => {

            try {
                await navigator.clipboard.writeText(clientLink);
                document.getElementById("copyLink").textContent = "COPIED!";
            } catch {
                alert("Please copy the link manually: " + clientLink);
            }

        });

    } catch (error) {

        result.textContent = error.message;

    } finally {

        submitBtn.disabled = false;
        submitBtn.textContent = "GENERATE CLIENT LINK";

    }

});
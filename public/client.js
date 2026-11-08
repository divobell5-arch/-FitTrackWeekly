const clientContent = document.getElementById("clientContent");

// Get token from URL
const pathParts = window.location.pathname.split("/");
const token = pathParts[pathParts.length - 1];

async function loadClientReport() {

    try {

        const response = await fetch(`/api/reports/${encodeURIComponent(token)}`);

        if (!response.ok) {
            throw new Error("Your fitness report could not be found.");
        }

        const report = await response.json();

        displayReport(report);

    } catch (error) {

        clientContent.innerHTML = `
            <div class="error">
                <h2>Report Unavailable</h2>
                <p>${escapeHTML(error.message)}</p>
                <p>Please contact your personal trainer.</p>
            </div>
        `;

    }

}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function displayReport(report) {

    const startingWeight = report.startingWeight || "Not recorded";
    const currentWeight = report.currentWeight || "Not recorded";

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    let workoutHTML = "";

    days.forEach(day => {

        const workout = report.workouts?.[day] || {};
        const exercises = workout.exercises || [];

        let exerciseHTML = "";

        if (exercises.length > 0) {

            exerciseHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Exercise</th>
                            <th>Sets</th>
                            <th>Reps</th>
                            <th>Weight</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${exercises.map(exercise => `
                            <tr>
                                <td>${escapeHTML(exercise.name)}</td>
                                <td>${escapeHTML(exercise.sets)}</td>
                                <td>${escapeHTML(exercise.reps)}</td>
                                <td>${escapeHTML(exercise.weight)} kg</td>
                            </tr>
                        `).join("")}

                    </tbody>
                </table>
            `;

        } else {

            exerciseHTML = `
                <p class="empty-day">
                    No exercises recorded for this day.
                </p>
            `;

        }

        workoutHTML += `
            <div class="day-card">

                <h3>${day.toUpperCase()}</h3>

                <h4>${escapeHTML(workout.focus || "Workout not specified")}</h4>

                ${exerciseHTML}

            </div>
        `;

    });

    clientContent.innerHTML = `

        <section class="welcome-card">

            <h2>Welcome, ${escapeHTML(report.clientName)}! 💪</h2>

            <p>Your weekly fitness progress report.</p>

            <p class="week">
                Week: ${escapeHTML(report.week)}
            </p>

            <p class="week">
                Fitness Goal: ${escapeHTML(report.fitnessGoal)}
            </p>

        </section>


        <section class="stats">

            <div class="stat">

                Starting Weight

                <h3>${escapeHTML(startingWeight)} ${report.startingWeight ? "kg" : ""}</h3>

            </div>

            <div class="stat">

                Current Weight

                <h3>${escapeHTML(currentWeight)} ${report.currentWeight ? "kg" : ""}</h3>

            </div>

        </section>


        <h2 class="section-title">YOUR WEEKLY WORKOUTS</h2>

        ${workoutHTML}


        <h2 class="section-title">WEEKLY ACHIEVEMENTS 🏆</h2>

        <div class="info-card">

            <p>${escapeHTML(report.achievements || "No achievements recorded.")}</p>

        </div>


        <h2 class="section-title">AREAS TO IMPROVE</h2>

        <div class="info-card">

            <p>${escapeHTML(report.improvements || "No areas recorded.")}</p>

        </div>


        <h2 class="section-title">NEXT WEEK'S GOALS 🎯</h2>

        <div class="goal-card">

            <p>${escapeHTML(report.nextGoals || "Goals not yet recorded.")}</p>

        </div>


        <h2 class="section-title">A MESSAGE FROM YOUR TRAINER</h2>

        <div class="info-card trainer-message">

            <p>${escapeHTML(report.trainerMessage || "Keep working hard. Consistency creates results!")}</p>

            <br>

            <strong>Divobell Okinda</strong>

            <p>Personal Trainer</p>

        </div>

    `;

}

loadClientReport();
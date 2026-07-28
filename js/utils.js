const STORAGE_KEY = "graphdle-player";

function loadPlayerData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {

        data = JSON.parse(saved);

        if (!data.revealedDates) {
            data.revealedDates = {
                spanning: null,
                pmc: null
            };
        }

        return data;
        
    }

    return {

        streak: 0,

        longestStreak: 0,

        lastCompletedDate: null,

        // completedToday: {
        //     spanning: false,
        //     pmc: false
        // },

        revealedDates: {
            spanning: null,
            pmc: null
        },

        completedDates: {
            spanning: null,
            pmc: null
        },

        stats: {

            spanning: {
                gamesPlayed: 0,
                gamesWon: 0,
                totalGuesses: 0
            },

            pmc: {
                gamesPlayed: 0,
                gamesWon: 0,
                totalGuesses: 0
            }

        }

    };

}

let playerData = loadPlayerData();

function savePlayerData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(playerData)
    );
}


function recordGamePlayed(gameName) {

    playerData.stats[gameName].gamesPlayed++;

    savePlayerData();

}


function recordGameWon(gameName, guesses) {

    playerData.stats[gameName].gamesWon++;

    playerData.stats[gameName].totalGuesses += guesses;

    savePlayerData();

}




function getTodayString() {
    return new Date().toISOString().split("T")[0];
}

function completeDailyPuzzle(gameName) {

    const today = getTodayString();

    // Already completed this puzzle today
    if (playerData.completedDates[gameName] === today)
        return;

    playerData.completedDates[gameName] = today;

    if (
        playerData.completedDates.spanning === today &&
        playerData.completedDates.pmc === today
    ) {

        if (!playerData.lastCompletedDate) {

            playerData.streak = 1;

        } else {

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const yesterdayString =
                yesterday.toISOString().split("T")[0];

            if (playerData.lastCompletedDate === yesterdayString) {
                playerData.streak++;
            } else if (playerData.lastCompletedDate !== today) {
                playerData.streak = 1;
            }

        }

        playerData.lastCompletedDate = today;

        playerData.longestStreak = Math.max(
            playerData.longestStreak,
            playerData.streak
        );
    }

    savePlayerData();
}   


function loadStatistics() {

    playerData = loadPlayerData();

    const spanStats = playerData.stats.spanning;
    const pmcStats = playerData.stats.pmc;

    document.getElementById("current-streak").textContent =
        playerData.streak;

    document.getElementById("longest-streak").textContent =
        playerData.longestStreak;

    document.getElementById("span-played").textContent =
        spanStats.gamesPlayed;

    document.getElementById("span-won").textContent =
        spanStats.gamesWon;

    // document.getElementById("span-rate").textContent =
    //     spanStats.gamesPlayed === 0
    //         ? 0
    //         : Math.round(spanStats.gamesWon / spanStats.gamesPlayed * 100);

    document.getElementById("pmc-played").textContent =
        pmcStats.gamesPlayed;

    document.getElementById("pmc-won").textContent =
        pmcStats.gamesWon;

    const spanAvg =
    spanStats.gamesWon === 0
        ? 0
        : (spanStats.totalGuesses / spanStats.gamesWon).toFixed(1);

    document.getElementById("span-avg").textContent = spanAvg;

    document.getElementById("pmc-rate").textContent =
        pmcStats.gamesPlayed === 0
            ? 0
            : Math.round(pmcStats.gamesWon / pmcStats.gamesPlayed * 100);
}

function hasCompletedToday(gameName) {
    return playerData.completedDates[gameName] === getTodayString();
}


// function showCompletedMessage(gameTitle) {
//     document.getElementById("cy").innerHTML = `
//         <div class="completed-message">
//             <div class="completed-icon">🎉</div>

//             <h2>Puzzle Complete!</h2>

//             <p class="completed-text">
//                 You have already completed today's
//                 <strong>${gameTitle}</strong> puzzle.
//             </p>

//             <button onclick="showSpanningSolution()">
//                 Show Today's Solution
//             </button>

//             <div class="completed-countdown">
//                 <span id="countdown"></span>
//             </div>
//         </div>
//     `;
//     updateCountdown();  
// }

function showCompletedMessage(gameTitle, buttonText, callback) {

    document.getElementById("graph-container").innerHTML = `
        <div class="completed-message">
            <div class="completed-icon">🎉</div>

            <h2>Puzzle Complete!</h2>

            <p class="completed-text">
                You have already completed today's
                <strong>${gameTitle}</strong> puzzle.
            </p>

            <button id="completed-action">
                ${buttonText}
            </button>

            <div class="completed-countdown">
                <span id="countdown"></span>
            </div>
        </div>
    `;

    document
        .getElementById("completed-action")
        .addEventListener("click", callback);

    updateCountdown();
}


function revealDailyPuzzle(gameName) {

    playerData.revealedDates[gameName] = getTodayString();

    savePlayerData();

}

function hasRevealedToday(gameName) {

    return playerData.revealedDates[gameName] === getTodayString();

}
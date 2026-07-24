const STORAGE_KEY = "graphdle-player";

function loadPlayerData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        return JSON.parse(saved);
    }

    return {

        streak: 0,

        longestStreak: 0,

        lastCompletedDate: null,

        completedToday: {
            spanning: false,
            pmc: false
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


function recordGamePlayed(gameName) {

    playerData.stats[gameName].gamesPlayed++;

    savePlayerData();

}


function recordGameWon(gameName, guesses) {

    playerData.stats[gameName].gamesWon++;

    playerData.stats[gameName].totalGuesses += guesses;

    savePlayerData();

}
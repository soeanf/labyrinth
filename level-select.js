// Konstanten
const TOTAL_LEVELS = 7;

// DOM-Elemente
const levelGrid = document.getElementById('levelGrid');
const resetProgressBtn = document.getElementById('resetProgressBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmResetBtn = document.getElementById('confirmResetBtn');
const cancelResetBtn = document.getElementById('cancelResetBtn');

// Initialisierung
init();

function init() {
    loadLevels();
    setupEventListeners();
}

function setupEventListeners() {
    resetProgressBtn.addEventListener('click', () => {
        confirmModal.classList.add('show');
    });

    confirmResetBtn.addEventListener('click', () => {
        resetLevelProgress();
        confirmModal.classList.remove('show');
        loadLevels();
    });

    cancelResetBtn.addEventListener('click', () => {
        confirmModal.classList.remove('show');
    });
}

// Level laden und anzeigen
async function loadLevels() {
    levelGrid.innerHTML = '';
    const unlockedLevel = getLevelProgress();

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const levelCard = await createLevelCard(i, i <= unlockedLevel);
        levelGrid.appendChild(levelCard);
    }
}

async function createLevelCard(levelNum, isUnlocked) {
    const card = document.createElement('div');
    card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;

    // Level-Nummer oben
    const levelNumber = document.createElement('div');
    levelNumber.className = 'level-number';
    levelNumber.textContent = `Level ${levelNum}`;
    card.appendChild(levelNumber);

    if (isUnlocked) {
        // Level laden für Thumbnail
        try {
            const response = await fetch(`levels/level${levelNum}.json`);
            if (response.ok) {
                const levelData = await response.json();
                const thumbnail = createLevelThumbnail(levelData);
                card.appendChild(thumbnail);
            }
        } catch (error) {
            console.error(`Fehler beim Laden von Level ${levelNum}:`, error);
        }

        // Click-Handler für freigeschaltete Level
        card.addEventListener('click', () => {
            window.location.href = `game.html?level=${levelNum}`;
        });
    } else {
        // Container für gesperrte Level
        const lockContainer = document.createElement('div');
        lockContainer.className = 'lock-container';
        
        const lockIcon = document.createElement('div');
        lockIcon.className = 'lock-icon';
        lockIcon.textContent = '🔒';
        lockContainer.appendChild(lockIcon);

        const lockText = document.createElement('div');
        lockText.className = 'lock-text';
        lockText.textContent = 'Gesperrt';
        lockContainer.appendChild(lockText);
        
        card.appendChild(lockContainer);
    }

    return card;
}
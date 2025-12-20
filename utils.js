// ===================================
// Level-Fortschritt (Cookie-basiert)
// ===================================

const COOKIE_NAME = 'labyrinth_progress';
const COOKIE_DAYS = 365;

function getLevelProgress() {
    const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(COOKIE_NAME + '='));
    
    if (cookie) {
        const value = cookie.split('=')[1];
        return parseInt(value) || 1;
    }
    return 1; // Level 1 ist immer freigeschaltet
}

function saveLevelProgress(nextLevel) {
    // Aktuellen Fortschritt aus Cookie holen
    const currentProgress = getLevelProgress();
    const maxProgress = Math.max(currentProgress, nextLevel);
    
    // Cookie setzen
    const expires = new Date();
    expires.setTime(expires.getTime() + (COOKIE_DAYS * 24 * 60 * 60 * 1000));
    document.cookie = `${COOKIE_NAME}=${maxProgress}; expires=${expires.toUTCString()}; path=/`;
}

function resetLevelProgress() {
    document.cookie = `${COOKIE_NAME}=1; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

// ===================================
// Level-Thumbnail-Generierung
// ===================================

function createLevelThumbnail(levelData) {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'level-thumbnail';

    const gridSize = 12;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'thumbnail-cell';
            
            const coordStr = `${x}x${y}`;
            
            // Standard: Wasser
            let cellType = 'water';
            
            // Prüfen ob Sand
            if (levelData.sand.includes(coordStr)) {
                cellType = 'sand';
            }
            
            // Prüfen ob Weitsprung
            if (levelData.longjump && levelData.longjump.includes(coordStr)) {
                cellType = 'longjump';
            }
            
            // Prüfen ob Start
            if (levelData.start === coordStr) {
                cellType = 'start';
            }
            
            // Prüfen ob Ziel
            if (levelData.goal === coordStr) {
                cellType = 'goal';
            }
            
            cell.classList.add(cellType);
            thumbnail.appendChild(cell);
        }
    }

    return thumbnail;
}

// ===================================
// Koordinaten-Parsing
// ===================================

function parseCoordinate(coordStr) {
    const [x, y] = coordStr.split('x').map(Number);
    return { x, y };
}

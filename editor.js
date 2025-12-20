// Globale Variablen
const GRID_WIDTH = 12;
const GRID_HEIGHT = 12;

let currentTool = 'sand';
let gridData = [];
let startPos = null;
let goalPos = null;
let longjumpFields = []; // Positionen der Weitsprung-Felder

// DOM-Elemente
const editorGrid = document.getElementById('editorGrid');
const toolButtons = document.querySelectorAll('.tool-btn');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const successModal = document.getElementById('successModal');
const continueEditBtn = document.getElementById('continueEditBtn');
const newMapBtn = document.getElementById('newMapBtn');
const toOverviewBtn = document.getElementById('toOverviewBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmClearBtn = document.getElementById('confirmClearBtn');
const cancelClearBtn = document.getElementById('cancelClearBtn');
const duplicateModal = document.getElementById('duplicateModal');
const closeDuplicateBtn = document.getElementById('closeDuplicateBtn');
const unsolvableModal = document.getElementById('unsolvableModal');
const closeUnsolvableBtn = document.getElementById('closeUnsolvableBtn');
const codeDisplay = document.getElementById('codeDisplay');
const savedCodeDisplay = document.getElementById('savedCode');

// Initialisierung
function init() {
    createGrid();
    setupEventListeners();
    ensureUserId();
    
    // Prüfe ob eine Karte zum Bearbeiten geladen werden soll
    loadEditMapIfPresent();
}

// Eindeutige User-ID erstellen oder laden
function ensureUserId() {
    let userId = localStorage.getItem('labyrinth_user_id');
    
    if (!userId) {
        // Neue ID generieren: Zeitstempel + Zufallszahl
        userId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('labyrinth_user_id', userId);
    }
    
    return userId;
}

// Lade Karte zum Bearbeiten, falls im localStorage
function loadEditMapIfPresent() {
    const editMapData = localStorage.getItem('editMapData');
    const editMapCode = localStorage.getItem('editMapCode');
    
    if (editMapData && editMapCode) {
        try {
            const data = JSON.parse(editMapData);
            loadMapIntoEditor(data, editMapCode);
            
            // Zeige Hinweis dass Karte bearbeitet wird
            codeDisplay.textContent = `Bearbeite: ${editMapCode}`;
            codeDisplay.style.color = '#e67e22';
        } catch (error) {
            console.error('Fehler beim Laden der Karte:', error);
        }
    }
}

// Lade Kartendaten in den Editor
function loadMapIntoEditor(data, code) {
    // Grid zurücksetzen
    createGrid();
    
    // Start-Position setzen
    if (data.start) {
        const [x, y] = data.start.split('x').map(Number);
        startPos = { x, y };
        const cell = getCellElement(x, y);
        if (cell) {
            cell.className = 'editor-cell start';
            updateGridData(x, y, 'start');
        }
    }
    
    // Ziel-Position setzen
    if (data.goal) {
        const [x, y] = data.goal.split('x').map(Number);
        goalPos = { x, y };
        const cell = getCellElement(x, y);
        if (cell) {
            cell.className = 'editor-cell goal';
            updateGridData(x, y, 'goal');
        }
    }
        // Weitsprung-Felder setzen
    if (data.longjump && Array.isArray(data.longjump)) {
        data.longjump.forEach(pos => {
            const [x, y] = pos.split('x').map(Number);
            const cell = getCellAt(x, y);
            if (cell) {
                cell.className = 'editor-cell longjump';
                updateGridData(x, y, 'longjump');
                longjumpFields.push({ x, y });
            }
        });
    }
    // Sand-Felder setzen
    if (data.sand && Array.isArray(data.sand)) {
        data.sand.forEach(pos => {
            const [x, y] = pos.split('x').map(Number);
            const cell = getCellElement(x, y);
            if (cell) {
                cell.className = 'editor-cell sand';
                updateGridData(x, y, 'sand');
            }
        });
    }
}

// Lade Karte zum Bearbeiten, falls im localStorage
function loadEditMapIfPresent() {
    const editMapData = localStorage.getItem('editMapData');
    const editMapCode = localStorage.getItem('editMapCode');
    
    if (editMapData && editMapCode) {
        try {
            const data = JSON.parse(editMapData);
            loadMapIntoEditor(data, editMapCode);
            
            // Zeige Hinweis dass Karte bearbeitet wird
            codeDisplay.textContent = `Bearbeite: ${editMapCode}`;
            codeDisplay.style.color = '#e67e22';
        } catch (error) {
            console.error('Fehler beim Laden der Karte:', error);
        }
    }
}

// Lade Kartendaten in den Editor
function loadMapIntoEditor(data, code) {
    // Grid zurücksetzen
    createGrid();
    
    // Start-Position setzen
    if (data.start) {
        const [x, y] = data.start.split('x').map(Number);
        startPos = { x, y };
        const cell = getCellElement(x, y);
        if (cell) {
            cell.className = 'editor-cell start';
            updateGridData(x, y, 'start');
        }
    }
    
    // Ziel-Position setzen
    if (data.goal) {
        const [x, y] = data.goal.split('x').map(Number);
        goalPos = { x, y };
        const cell = getCellElement(x, y);
        if (cell) {
            cell.className = 'editor-cell goal';
            updateGridData(x, y, 'goal');
        }
    }
    
    // Sand-Felder setzen
    if (data.sand && Array.isArray(data.sand)) {
        data.sand.forEach(pos => {
            const [x, y] = pos.split('x').map(Number);
            const cell = getCellElement(x, y);
            if (cell) {
                cell.className = 'editor-cell sand';
                updateGridData(x, y, 'sand');
            }
        });
    }
}

// Grid erstellen
function createGrid() {
    editorGrid.innerHTML = '';
    gridData = [];

    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = document.createElement('div');
            const isBorder = x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1;
            
            if (isBorder) {
                cell.className = 'editor-cell border-cell';
            } else {
                cell.className = 'editor-cell water';
            }
            
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            if (!isBorder) {
                cell.addEventListener('click', handleCellClick);
            }
            
            editorGrid.appendChild(cell);
            gridData.push({ x, y, type: 'water' });
        }
    }
}

// Event-Listeners einrichten
function setupEventListeners() {
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            toolButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
        });
    });

    clearBtn.addEventListener('click', showConfirmModal);
    saveBtn.addEventListener('click', saveLevel);
    
    continueEditBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
    });
    
    newMapBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
        clearGrid();
    });
    
    toOverviewBtn.addEventListener('click', () => {
        window.location.href = 'user-maps.html';
    });
    
    confirmClearBtn.addEventListener('click', () => {
        confirmModal.classList.remove('active');
        clearGrid();
    });
    
    cancelClearBtn.addEventListener('click', () => {
        confirmModal.classList.remove('active');
    });
    
    closeDuplicateBtn.addEventListener('click', () => {
        duplicateModal.classList.remove('active');
    });
    
    closeUnsolvableBtn.addEventListener('click', () => {
        unsolvableModal.classList.remove('active');
    });
}

// Zelle anklicken
function handleCellClick(e) {
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const cell = e.target;

    // Wenn Start/Ziel überschrieben wird, Position zurücksetzen
    if (startPos && x === startPos.x && y === startPos.y) {
        startPos = null;
    }
    if (goalPos && x === goalPos.x && y === goalPos.y) {
        goalPos = null;
    }

    // Vorheriges Start/Ziel zurücksetzen wenn neues gesetzt wird (nur wenn es noch Start/Ziel ist)
    if (currentTool === 'start' && startPos) {
        const oldStartCell = getCellElement(startPos.x, startPos.y);
        const oldStartData = getGridData(startPos.x, startPos.y);
        if (oldStartCell && oldStartData && oldStartData.type === 'start') {
            oldStartCell.className = 'editor-cell water';
            updateGridData(startPos.x, startPos.y, 'water');
        }
    }

    if (currentTool === 'goal' && goalPos) {
        const oldGoalCell = getCellElement(goalPos.x, goalPos.y);
        const oldGoalData = getGridData(goalPos.x, goalPos.y);
        if (oldGoalCell && oldGoalData && oldGoalData.type === 'goal') {
            oldGoalCell.className = 'editor-cell water';
            updateGridData(goalPos.x, goalPos.y, 'water');
        }
    }

    // Neue Zelle setzen
    cell.className = `editor-cell ${currentTool}`;
    updateGridData(x, y, currentTool);

    if (currentTool === 'start') {
        startPos = { x, y };
    } else if (currentTool === 'goal') {
        goalPos = { x, y };
    } else if (currentTool === 'longjump') {
        // Zur Weitsprung-Liste hinzufügen
        if (!longjumpFields.some(pos => pos.x === x && pos.y === y)) {
            longjumpFields.push({ x, y });
        }
    } else if (currentTool === 'sand' || currentTool === 'water') {
        // Weitsprung-Feld entfernen falls vorhanden
        longjumpFields = longjumpFields.filter(pos => !(pos.x === x && pos.y === y));
    }
}

// Grid-Daten aktualisieren
function updateGridData(x, y, type) {
    const index = y * GRID_WIDTH + x;
    if (gridData[index]) {
        gridData[index].type = type;
    }
}

// Grid-Daten abrufen
function getGridData(x, y) {
    const index = y * GRID_WIDTH + x;
    return gridData[index];
}

// Zell-Element finden
function getCellElement(x, y) {
    return editorGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
}

// Bestätigungs-Modal anzeigen
function showConfirmModal() {
    confirmModal.classList.add('active');
}

// Grid leeren
function clearGrid() {
    startPos = null;
    goalPos = null;
    longjumpFields = [];
    createGrid();
    codeDisplay.textContent = 'Noch nicht gespeichert';
}

// Prüfe ob die Karte lösbar ist (BFS-Pathfinding mit Sprung-Option)
function isMapSolvable() {
    if (!startPos || !goalPos) {
        return false;
    }

    // BFS-Queue initialisieren
    const queue = [{ x: startPos.x, y: startPos.y }];
    const visited = new Set();
    visited.add(`${startPos.x},${startPos.y}`);

    // Bewegungsrichtungen: oben, rechts, unten, links
    const directions = [
        { dx: 0, dy: -1 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }
    ];

    while (queue.length > 0) {
        const current = queue.shift();

        // Ziel erreicht?
        if (current.x === goalPos.x && current.y === goalPos.y) {
            return true;
        }

        // Alle vier Richtungen prüfen
        for (const dir of directions) {
            // Normale Bewegung (1 Feld)
            const newX = current.x + dir.dx;
            const newY = current.y + dir.dy;
            const key = `${newX},${newY}`;

            // Prüfe normale Bewegung
            if (!visited.has(key) && 
                newX >= 0 && newX < GRID_WIDTH && 
                newY >= 0 && newY < GRID_HEIGHT) {
                
                const cellData = getGridData(newX, newY);
                if (cellData && (cellData.type === 'sand' || cellData.type === 'longjump' || cellData.type === 'start' || cellData.type === 'goal')) {
                    visited.add(key);
                    queue.push({ x: newX, y: newY });
                }
            }

            // Sprung-Bewegung (über Wasser, 2 Felder)
            const jumpX = current.x + dir.dx * 2;
            const jumpY = current.y + dir.dy * 2;
            const jumpKey = `${jumpX},${jumpY}`;

            // Prüfe ob Sprung möglich ist
            if (!visited.has(jumpKey) && 
                jumpX >= 0 && jumpX < GRID_WIDTH && 
                jumpY >= 0 && jumpY < GRID_HEIGHT) {
                
                // Das erste Feld muss Wasser sein
                const middleCell = getGridData(newX, newY);
                if (middleCell && middleCell.type === 'water') {
                    // Das Zielfeld muss begehbar sein
                    const targetCell = getGridData(jumpX, jumpY);
                    if (targetCell && (targetCell.type === 'sand' || targetCell.type === 'longjump' || targetCell.type === 'start' || targetCell.type === 'goal')) {
                        visited.add(jumpKey);
                        queue.push({ x: jumpX, y: jumpY });
                    }
                }
            }
            
            // Weitsprung-Bewegung (3 Felder über 2 Wasser) - nur wenn Weitsprung-Felder existieren
            if (longjumpFields.length > 0) {
                const longJumpX = current.x + dir.dx * 3;
                const longJumpY = current.y + dir.dy * 3;
                const longJumpKey = `${longJumpX},${longJumpY}`;

                if (!visited.has(longJumpKey) && 
                    longJumpX >= 0 && longJumpX < GRID_WIDTH && 
                    longJumpY >= 0 && longJumpY < GRID_HEIGHT) {
                    
                    // Beide mittleren Felder müssen Wasser sein
                    const middle1Cell = getGridData(current.x + dir.dx, current.y + dir.dy);
                    const middle2Cell = getGridData(current.x + dir.dx * 2, current.y + dir.dy * 2);
                    
                    if (middle1Cell && middle1Cell.type === 'water' && 
                        middle2Cell && middle2Cell.type === 'water') {
                        // Das Zielfeld muss begehbar sein
                        const longTargetCell = getGridData(longJumpX, longJumpY);
                        if (longTargetCell && (longTargetCell.type === 'sand' || longTargetCell.type === 'longjump' || longTargetCell.type === 'start' || longTargetCell.type === 'goal')) {
                            visited.add(longJumpKey);
                            queue.push({ x: longJumpX, y: longJumpY });
                        }
                    }
                }
            }
        }
    }

    // Kein Pfad gefunden
    return false;
}

// Hash-Funktion für Level-Daten
function generateLevelHash(levelData) {
    // Erstelle einen eindeutigen String aus den Level-Daten
    const dataString = JSON.stringify({
        start: levelData.start,
        goal: levelData.goal,
        sand: levelData.sand.sort(), // Sortieren um Reihenfolge zu normalisieren
        longjump: (levelData.longjump || []).sort()
    });
    
    // Einfache Hash-Funktion
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

// Prüfe ob Level bereits gespeichert wurde
function isLevelAlreadySaved(levelHash) {
    const savedMaps = JSON.parse(localStorage.getItem('labyrinth_saved_maps') || '[]');
    return savedMaps.includes(levelHash);
}

// Level-Hash zur Liste gespeicherter Karten hinzufügen
function addSavedLevelHash(levelHash) {
    const savedMaps = JSON.parse(localStorage.getItem('labyrinth_saved_maps') || '[]');
    if (!savedMaps.includes(levelHash)) {
        savedMaps.push(levelHash);
        localStorage.setItem('labyrinth_saved_maps', JSON.stringify(savedMaps));
    }
}

// Level speichern
async function saveLevel() {
    // Validierung
    if (!startPos) {
        showValidationModal('Bitte setze ein Start-Feld!');
        return;
    }

    if (!goalPos) {
        showValidationModal('Bitte setze ein Ziel-Feld!');
        return;
    }

    const sandCells = gridData.filter(cell => cell.type === 'sand');
    const longjumpCells = gridData.filter(cell => cell.type === 'longjump');
    if (sandCells.length === 0 && longjumpCells.length === 0) {
        showValidationModal('Bitte setze mindestens ein Sand-Feld oder Weitsprung-Feld!');
        return;
    }

    // Prüfe ob die Karte lösbar ist
    if (!isMapSolvable()) {
        unsolvableModal.classList.add('active');
        return;
    }

    // Level-Daten zusammenstellen
    const userId = ensureUserId();
    const levelData = {
        start: `${startPos.x}x${startPos.y}`,
        goal: `${goalPos.x}x${goalPos.y}`,
        sand: sandCells.map(cell => `${cell.x}x${cell.y}`),
        longjump: longjumpCells.map(cell => `${cell.x}x${cell.y}`)
    };

    // Prüfe ob diese Karte bereits gespeichert wurde
    const levelHash = generateLevelHash(levelData);
    const editMapCode = localStorage.getItem('editMapCode');
    
    // Wenn wir eine Karte bearbeiten, erlaube das Überschreiben
    if (!editMapCode && isLevelAlreadySaved(levelHash)) {
        duplicateModal.classList.add('active');
        return; // Benutzer kann nicht erneut speichern
    }

    // 6-stelligen Code generieren oder bestehenden Code verwenden
    const levelCode = editMapCode || generateLevelCode();

    // Browser-Informationen sammeln
    const deviceInfo = {
        userId: userId,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
    };

    try {
        // An Server senden
        const response = await fetch('save-level.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: levelCode,
                data: levelData,
                device: deviceInfo,
                overwrite: !!editMapCode // true wenn wir eine Karte bearbeiten
            })
        });

        const result = await response.json();

        if (result.success) {
            // Hash zur Liste gespeicherter Karten hinzufügen (nur wenn es eine neue Karte ist)
            if (!editMapCode) {
                addSavedLevelHash(levelHash);
            }
            
            // Bereinige Edit-Mode
            localStorage.removeItem('editMapData');
            localStorage.removeItem('editMapCode');
            
            // Erfolg anzeigen
            codeDisplay.textContent = levelCode;
            codeDisplay.style.color = '';
            savedCodeDisplay.textContent = levelCode;
            successModal.classList.add('active');
        } else {
            showValidationModal('Fehler beim Speichern: ' + result.error);
        }
    } catch (error) {
        showValidationModal('Fehler beim Speichern: ' + error.message);
    }
}

// Validierungsfehler anzeigen
function showValidationModal(message) {
    // Temporäres Modal für Validierungsfehler
    const tempModal = document.createElement('div');
    tempModal.className = 'modal active';
    tempModal.innerHTML = `
        <div class="modal-content">
            <h2>⚠️ Hinweis</h2>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">OK</button>
        </div>
    `;
    document.body.appendChild(tempModal);
}

// 6-stelligen Level-Code generieren
function generateLevelCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Initialisierung starten
init();

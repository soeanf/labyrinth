// Globale Variablen
const GRID_WIDTH = 12;
const GRID_HEIGHT = 12;

let currentTool = 'sand';
let gridData = [];
let startPos = null;
let goalPos = null;

// DOM-Elemente
const editorGrid = document.getElementById('editorGrid');
const toolButtons = document.querySelectorAll('.tool-btn');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const successModal = document.getElementById('successModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmClearBtn = document.getElementById('confirmClearBtn');
const cancelClearBtn = document.getElementById('cancelClearBtn');
const codeDisplay = document.getElementById('codeDisplay');
const savedCodeDisplay = document.getElementById('savedCode');

// Initialisierung
function init() {
    createGrid();
    setupEventListeners();
    ensureUserId();
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
    closeModalBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
    });
    
    confirmClearBtn.addEventListener('click', () => {
        confirmModal.classList.remove('active');
        clearGrid();
    });
    
    cancelClearBtn.addEventListener('click', () => {
        confirmModal.classList.remove('active');
    });
}

// Zelle anklicken
function handleCellClick(e) {
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const cell = e.target;

    // Vorheriges Start/Ziel zurücksetzen wenn neues gesetzt wird
    if (currentTool === 'start' && startPos) {
        const oldStartCell = getCellElement(startPos.x, startPos.y);
        if (oldStartCell) {
            oldStartCell.className = 'editor-cell water';
            updateGridData(startPos.x, startPos.y, 'water');
        }
    }

    if (currentTool === 'goal' && goalPos) {
        const oldGoalCell = getCellElement(goalPos.x, goalPos.y);
        if (oldGoalCell) {
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
    }
}

// Grid-Daten aktualisieren
function updateGridData(x, y, type) {
    const index = y * GRID_WIDTH + x;
    if (gridData[index]) {
        gridData[index].type = type;
    }
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
    createGrid();
    codeDisplay.textContent = 'Noch nicht gespeichert';
}

// Level speichern
async function saveLevel() {
    // Validierung
    if (!startPos) {
        alert('Bitte setze ein Start-Feld!');
        return;
    }

    if (!goalPos) {
        alert('Bitte setze ein Ziel-Feld!');
        return;
    }

    const sandCells = gridData.filter(cell => cell.type === 'sand');
    if (sandCells.length === 0) {
        alert('Bitte setze mindestens ein Sand-Feld!');
        return;
    }

    // Level-Daten zusammenstellen
    const userId = ensureUserId();
    const levelData = {
        start: `${startPos.x}x${startPos.y}`,
        goal: `${goalPos.x}x${goalPos.y}`,
        sand: sandCells.map(cell => `${cell.x}x${cell.y}`)
    };

    // 6-stelligen Code generieren
    const levelCode = generateLevelCode();

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
                device: deviceInfo
            })
        });

        const result = await response.json();

        if (result.success) {
            // Erfolg anzeigen
            codeDisplay.textContent = levelCode;
            savedCodeDisplay.textContent = levelCode;
            successModal.classList.add('active');
        } else {
            alert('Fehler beim Speichern: ' + result.error);
        }
    } catch (error) {
        alert('Fehler beim Speichern: ' + error.message);
    }
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

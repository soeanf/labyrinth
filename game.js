// Spielkonfiguration
const GRID_WIDTH = 14; // 12 Spielfelder + 2 Randfelder
const GRID_HEIGHT = 14; // 12 Spielfelder + 2 Randfelder
const LEVEL_OFFSET = 1; // Level-Koordinaten starten bei 1,1 statt 0,0

// Spielstatus
let currentLevel = 1;
let gameMode = 'normal'; // 'normal', 'tutorial', 'usermap'
let maxLevels = 7;
let failCount = 0;
let playerPosition = { x: 0, y: 0 };
let playerDirection = 0; // 0=Nord, 1=Ost, 2=Süd, 3=West
let commandQueue = [];
let isRunning = false;
let levelData = null;
let longjumpCount = 0; // Anzahl gesammelter Weitsprungs
let longjumpFields = []; // Positionen der Weitsprung-Felder
let usedLongjumps = 0; // Anzahl bereits verwendeter Weitsprünge in dieser Runde

// Richtungssymbole
const DIRECTION_ARROWS = ['↑', '→', '↓', '←'];

// DOM-Elemente
const gameGrid = document.getElementById('gameGrid');
const commandQueueEl = document.getElementById('commandQueue');
const startBtn = document.getElementById('startBtn');
const clearBtn = document.getElementById('clearBtn');
const levelNumberEl = document.getElementById('levelNumber');
const failCountEl = document.getElementById('failCount');
const winModal = document.getElementById('winModal');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const waterModal = document.getElementById('waterModal');
const retryBtn = document.getElementById('retryBtn');
const completeModal = document.getElementById('completeModal');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const completeMessage = document.getElementById('completeMessage');
const commandButtons = document.querySelectorAll('.command-btn');
const longjumpBtn = document.getElementById('longjumpBtn');
const longjumpCountEl = document.getElementById('longjumpCount');

// Initialisierung
init();

function init() {
    createGrid();
    setupEventListeners();
    
    // Prüfen welcher Modus
    const urlParams = new URLSearchParams(window.location.search);
    const userMapCode = urlParams.get('usermap');
    const tutorialMode = urlParams.get('tutorial');
    const levelParam = urlParams.get('level');
    
    if (userMapCode) {
        gameMode = 'usermap';
        loadUserMap(userMapCode);
    } else if (tutorialMode === 'true') {
        gameMode = 'tutorial';
        maxLevels = 3;
        loadLevel(currentLevel);
    } else {
        gameMode = 'normal';
        maxLevels = 7;
        // Direktes Level aus URL laden
        if (levelParam) {
            const requestedLevel = parseInt(levelParam);
            const unlockedLevel = getLevelProgress();
            
            // Prüfen ob Level freigeschaltet ist
            if (requestedLevel <= unlockedLevel && requestedLevel >= 1 && requestedLevel <= maxLevels) {
                currentLevel = requestedLevel;
            } else {
                // Level nicht freigeschaltet - zurück zur Level-Auswahl
                window.location.href = 'level-select.html';
                return;
            }
            updateStats();
        }
        loadLevel(currentLevel);
    }
}

// Spielfeld erstellen
function createGrid() {
    gameGrid.innerHTML = '';
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = document.createElement('div');
            // Randfelder markieren
            const isBorder = x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1;
            cell.className = isBorder ? 'grid-cell water border-cell' : 'grid-cell water';
            cell.dataset.x = x;
            cell.dataset.y = y;
            gameGrid.appendChild(cell);
        }
    }
}

// Event-Listener einrichten
function setupEventListeners() {
    // Befehlsbuttons
    commandButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!isRunning) {
                addCommandToQueue(btn.dataset.command);
            }
        });
    });

    // Start-Button
    startBtn.addEventListener('click', executeQueue);

    // Clear-Button
    clearBtn.addEventListener('click', clearQueue);

    // Nächstes Level
    nextLevelBtn.addEventListener('click', () => {
        winModal.classList.remove('show');
        
        // Bei User-Maps zurück zur Auswahl
        if (gameMode === 'usermap') {
            window.location.href = 'user-maps.html';
            return;
        }
        
        currentLevel++;
        failCount = 0;
        updateStats();
        
        // Prüfen ob alle Level geschafft
        if (currentLevel > maxLevels) {
            showCompleteModal();
        } else {
            loadLevel(currentLevel);
        }
    });

    // Level neu versuchen
    retryBtn.addEventListener('click', () => {
        waterModal.classList.remove('show');
        const startCoord = parseCoordinate(levelData.start);
        playerPosition = { x: startCoord.x + LEVEL_OFFSET, y: startCoord.y + LEVEL_OFFSET };
        playerDirection = 0;
        updatePlayerDisplay();
        isRunning = false;
        startBtn.disabled = false;
        clearBtn.disabled = false;
        commandButtons.forEach(btn => btn.disabled = false);
    });

    // Zurück zum Hauptmenü oder Level-Auswahl
    backToMenuBtn.addEventListener('click', () => {
        if (gameMode === 'normal') {
            window.location.href = 'level-select.html';
        } else if (gameMode === 'usermap') {
            window.location.href = 'user-maps.html';
        } else {
            window.location.href = 'index.html';
        }
    });
}

// Level laden
async function loadLevel(levelNum) {
    try {
        const folder = gameMode === 'tutorial' ? 'tutorial' : 'levels';
        const response = await fetch(`${folder}/level${levelNum}.json`);
        if (!response.ok) {
            showCompleteModal();
            return;
        }
        
        levelData = await response.json();
        setupLevel();
        clearQueue();
    } catch (error) {
        console.error('Fehler beim Laden des Levels:', error);
        showCompleteModal();
    }
}

// Alle Level geschafft Modal anzeigen
function showCompleteModal() {
    let message = 'Du hast alle Level geschafft!';
    let buttonText = 'Zurück zum Hauptmenü';
    
    if (gameMode === 'tutorial') {
        message = 'Glückwunsch, du hast das Tutorial vollständig gemeistert! Bereit für die echten Herausforderungen?';
    } else if (gameMode === 'normal') {
        message = 'Glückwunsch, du hast alle Level vollständig gemeistert! Probiere den Level Editor aus und erstelle eigene Herausforderungen!';
        buttonText = 'Zurück zur Level-Auswahl';
    } else if (gameMode === 'usermap') {
        message = 'Glückwunsch, du hast die User-Map geschafft!';
        buttonText = 'Zurück zur Map-Auswahl';
    }
    
    completeMessage.textContent = message;
    backToMenuBtn.textContent = buttonText;
    completeModal.classList.add('show');
}

// User-Map laden
async function loadUserMap(code) {
    try {
        const storedLevel = localStorage.getItem('userLevel');
        
        if (storedLevel) {
            levelData = JSON.parse(storedLevel);
            levelNumberEl.textContent = `User Map: ${code}`;
            setupLevel();
            clearQueue();
            
            // Nächstes Level deaktivieren (keine weiteren User-Maps)
            nextLevelBtn.style.display = 'none';
        } else {
            throw new Error('Level-Daten nicht gefunden');
        }
    } catch (error) {
        alert('User-Map konnte nicht geladen werden: ' + error.message);
        window.location.href = 'index.html';
    }
}

// Level aufbauen
function setupLevel() {
    // Alle Felder auf Wasser setzen (außer Randfelder)
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const isBorder = x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1;
        cell.className = isBorder ? 'grid-cell water border-cell' : 'grid-cell water';
        cell.innerHTML = '';
    });

    // Start-Feld (mit Offset)
    const startCoord = parseCoordinate(levelData.start);
    const startCell = getCellAt(startCoord.x + LEVEL_OFFSET, startCoord.y + LEVEL_OFFSET);
    startCell.className = 'grid-cell start';
    playerPosition = { x: startCoord.x + LEVEL_OFFSET, y: startCoord.y + LEVEL_OFFSET };
    playerDirection = 0;

    // Ziel-Feld (mit Offset)
    const goalCoord = parseCoordinate(levelData.goal);
    const goalCell = getCellAt(goalCoord.x + LEVEL_OFFSET, goalCoord.y + LEVEL_OFFSET);
    goalCell.className = 'grid-cell goal';

    // Sand-Felder (mit Offset)
    levelData.sand.forEach(coordStr => {
        const coord = parseCoordinate(coordStr);
        const cell = getCellAt(coord.x + LEVEL_OFFSET, coord.y + LEVEL_OFFSET);
        cell.className = 'grid-cell sand';
    });

    // Weitsprung-Felder (mit Offset)
    longjumpFields = [];
    if (levelData.longjump && Array.isArray(levelData.longjump)) {
        levelData.longjump.forEach(coordStr => {
            const coord = parseCoordinate(coordStr);
            const cell = getCellAt(coord.x + LEVEL_OFFSET, coord.y + LEVEL_OFFSET);
            cell.className = 'grid-cell longjump';
            longjumpFields.push({ x: coord.x + LEVEL_OFFSET, y: coord.y + LEVEL_OFFSET });
            
            // Symbol hinzufügen
            const symbol = document.createElement('div');
            symbol.className = 'longjump-symbol';
            symbol.textContent = '👟'; // Sneaker/Schuh-Emoji
            cell.appendChild(symbol);
        });
    }
    
    // Weitsprung-Zähler zurücksetzen
    longjumpCount = 0;
    usedLongjumps = 0;
    
    // Spieler platzieren
    updatePlayerDisplay();
    
    // Weitsprung-Button initialisieren
    updateLongjumpButton();
}

// Zelle an Position holen
function getCellAt(x, y) {
    return document.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
}

// Spieler-Anzeige aktualisieren
function updatePlayerDisplay() {
    // Alte Spieler-Symbole entfernen
    document.querySelectorAll('.player').forEach(p => p.remove());

    // Neues Spieler-Symbol hinzufügen
    const cell = getCellAt(playerPosition.x, playerPosition.y);
    if (cell) {
        const player = document.createElement('div');
        player.className = 'player';
        player.setAttribute('data-direction', playerDirection);
        
        // Augen hinzufügen
        const eyes = document.createElement('div');
        eyes.className = 'player-eyes';
        
        const eye1 = document.createElement('div');
        eye1.className = 'player-eye';
        const eye2 = document.createElement('div');
        eye2.className = 'player-eye';
        
        eyes.appendChild(eye1);
        eyes.appendChild(eye2);
        player.appendChild(eyes);
        
        cell.appendChild(player);
    }
}

// Prüfe ob Spieler auf Weitsprung-Feld steht
function checkLongjumpPickup() {
    const fieldIndex = longjumpFields.findIndex(field => 
        field.x === playerPosition.x && field.y === playerPosition.y
    );
    
    if (fieldIndex !== -1) {
        // Weitsprung gefunden!
        longjumpCount++;
        longjumpFields.splice(fieldIndex, 1); // Aus Liste entfernen
        
        // Symbol von Zelle entfernen
        const cell = getCellAt(playerPosition.x, playerPosition.y);
        const symbol = cell.querySelector('.longjump-symbol');
        if (symbol) {
            symbol.remove();
        }
    }
}

// Prüfe ob Spieler auf Weitsprung-Feld steht
function checkLongjumpPickup() {
    const fieldIndex = longjumpFields.findIndex(field => 
        field.x === playerPosition.x && field.y === playerPosition.y
    );
    
    if (fieldIndex !== -1) {
        // Weitsprung gefunden!
        longjumpCount++;
        longjumpFields.splice(fieldIndex, 1); // Aus Liste entfernen
        
        // Symbol von Zelle entfernen
        const cell = getCellAt(playerPosition.x, playerPosition.y);
        const symbol = cell.querySelector('.longjump-symbol');
        if (symbol) {
            symbol.remove();
        }
    }
}

// Aktualisiere Weitsprung-Button Status
function updateLongjumpButton() {
    // Zähle wie viele longjump-Befehle bereits in der Queue sind
    const longjumpInQueue = commandQueue.filter(cmd => cmd === 'longjump').length;
    
    // Maximale Anzahl = Anzahl der Weitsprung-Felder auf der Map
    const maxLongjumps = (levelData && levelData.longjump) ? levelData.longjump.length : 0;
    
    // Verfügbare Zählung anzeigen
    if (longjumpCountEl) {
        longjumpCountEl.textContent = `${longjumpInQueue}/${maxLongjumps}`;
    }
    
    // Button deaktivieren wenn Limit erreicht oder während Ausführung
    if (longjumpBtn) {
        longjumpBtn.disabled = longjumpInQueue >= maxLongjumps || isRunning;
    }
}

// Befehl zur Queue hinzufügen
function addCommandToQueue(command) {
    const queueItem = document.createElement('div');
    queueItem.className = 'queue-item';
    queueItem.dataset.command = command;

    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    
    const label = document.createElement('div');
    label.className = 'label';

    switch (command) {
        case 'forward':
            arrow.textContent = '→';
            label.textContent = 'Vorwärts';
            break;
        case 'left':
            arrow.textContent = '↰';
            label.textContent = 'Links';
            break;
        case 'right':
            arrow.textContent = '↱';
            label.textContent = 'Rechts';
            break;
        case 'jump':
            arrow.textContent = '⇒';
            label.textContent = 'Springen';
            break;
        case 'longjump':
            arrow.textContent = '👟';
            label.textContent = 'Weitsprung';
            break;
    }

    queueItem.appendChild(arrow);
    queueItem.appendChild(label);
    
    // Aktions-Buttons Container
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'queue-actions';
    
    // Verschieben-Button (links positioniert)
    const moveBtn = document.createElement('button');
    moveBtn.className = 'queue-move-btn';
    moveBtn.innerHTML = '<img src="changeorder.svg" alt="↕" />';
    moveBtn.title = 'Position ändern';
    moveBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startDragMode(queueItem, e);
    });
    moveBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startDragMode(queueItem, e);
    }, { passive: false });
    
    // Löschen-Button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'queue-delete-btn';
    deleteBtn.innerHTML = '🗑️'; // Mülltonne
    deleteBtn.title = 'Löschen';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteQueueItem(queueItem);
    });
    
    actionsDiv.appendChild(deleteBtn);
    
    // moveBtn ganz vorne einfügen (vor arrow)
    queueItem.insertBefore(moveBtn, queueItem.firstChild);
    queueItem.appendChild(actionsDiv);

    commandQueueEl.appendChild(queueItem);
    commandQueue.push(command);
    updateQueueClass();
    
    // Weitsprung-Button aktualisieren wenn longjump hinzugefügt
    if (command === 'longjump') {
        updateLongjumpButton();
    }
}

// Queue leeren
function clearQueue() {
    commandQueueEl.innerHTML = '';
    commandQueue = [];
    updateQueueClass();
    updateLongjumpButton(); // Button-Status aktualisieren
}

// Queue-Klasse aktualisieren
function updateQueueClass() {
    if (commandQueue.length > 0) {
        commandQueueEl.classList.add('has-items');
        commandQueueEl.classList.remove('empty');
    } else {
        commandQueueEl.classList.remove('has-items');
        commandQueueEl.classList.add('empty');
    }
}

// Queue ausführen
async function executeQueue() {
    if (commandQueue.length === 0 || isRunning) return;

    usedLongjumps = 0; // Zurücksetzen für neue Ausführung
    isRunning = true;
    startBtn.disabled = true;
    clearBtn.disabled = true;
    commandButtons.forEach(btn => btn.disabled = true);
    if (longjumpBtn) longjumpBtn.disabled = true;

    // Spielfigur auf Startfeld zurücksetzen
    const startCoord = parseCoordinate(levelData.start);
    playerPosition = { x: startCoord.x + LEVEL_OFFSET, y: startCoord.y + LEVEL_OFFSET };
    playerDirection = 0; // Nach oben
    updatePlayerDisplay();
    await sleep(300);

    for (let i = 0; i < commandQueue.length; i++) {
        const command = commandQueue[i];
        
        // Highlight aktuellen Befehl
        const queueItems = commandQueueEl.querySelectorAll('.queue-item');
        queueItems.forEach((item, idx) => {
            item.style.background = idx === i ? '#ffd700' : 'white';
        });
        
        // Automatisch zum nächsten Item scrollen (für Vorschau)
        const nextIndex = i + 1;
        if (queueItems[nextIndex]) {
            queueItems[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (queueItems[i]) {
            // Falls kein nächstes Item, zeige aktuelles
            queueItems[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        await executeCommand(command);
        await sleep(500);

        // Prüfen, ob Spieler auf Wasser oder Rand ist
        const currentCell = getCellAt(playerPosition.x, playerPosition.y);
        
        if (currentCell && (currentCell.classList.contains('water') || currentCell.classList.contains('border-cell'))) {
            await sleep(300);
            showWaterModal();
            return;
        }

        // Prüfen, ob Ziel erreicht
        if (currentCell && currentCell.classList.contains('goal')) {
            await sleep(500);
            showWinModal();
            break;
        }
    }

    // Highlights zurücksetzen
    const queueItems = commandQueueEl.querySelectorAll('.queue-item');
    queueItems.forEach(item => item.style.background = 'white');

    isRunning = false;
    startBtn.disabled = false;
    clearBtn.disabled = false;
    commandButtons.forEach(btn => btn.disabled = false);
    updateLongjumpButton();
}

// Einzelnen Befehl ausführen
async function executeCommand(command) {
    switch (command) {
        case 'forward':
            moveForward(1);
            updatePlayerDisplay();
            checkLongjumpPickup();
            break;
        case 'left':
            turnLeft();
            updatePlayerDisplay();
            break;
        case 'right':
            turnRight();
            updatePlayerDisplay();
            break;
        case 'jump':
            await performJump();
            checkLongjumpPickup();
            break;
        case 'longjump':
            await performLongJump();
            checkLongjumpPickup();
            break;
    }
}

// Vorwärts bewegen
function moveForward(steps) {
    const directions = [
        { x: 0, y: -1 },  // Nord
        { x: 1, y: 0 },   // Ost
        { x: 0, y: 1 },   // Süd
        { x: -1, y: 0 }   // West
    ];

    const dir = directions[playerDirection];
    playerPosition.x += dir.x * steps;
    playerPosition.y += dir.y * steps;
}

// Nach links drehen
function turnLeft() {
    playerDirection = (playerDirection + 3) % 4;
}

// Nach rechts drehen
function turnRight() {
    playerDirection = (playerDirection + 1) % 4;
}

// Springen mit Animation
async function performJump() {
    const directions = [
        { x: 0, y: -1 },  // Nord
        { x: 1, y: 0 },   // Ost
        { x: 0, y: 1 },   // Süd
        { x: -1, y: 0 }   // West
    ];
    
    const dir = directions[playerDirection];
    const startPos = { ...playerPosition };
    const jumpDistance = 2; // Normaler Sprung ist immer 2 Felder
    const endPos = { x: startPos.x + dir.x * jumpDistance, y: startPos.y + dir.y * jumpDistance };
    
    // Startposition
    updatePlayerDisplay();
    const startCell = getCellAt(startPos.x, startPos.y);
    if (!startCell) return;
    
    const player = startCell.querySelector('.player');
    if (!player) return;
    
    const startRect = startCell.getBoundingClientRect();
    const endCell = getCellAt(endPos.x, endPos.y);
    if (!endCell) {
        playerPosition = endPos;
        return;
    }
    const endRect = endCell.getBoundingClientRect();
    
    // Zu fixer Positionierung mit fester Größe wechseln
    const playerSize = player.offsetWidth;
    const startX = startRect.left + startRect.width / 2 - playerSize / 2;
    const startY = startRect.top + startRect.height / 2 - playerSize / 2;
    const endX = endRect.left + endRect.width / 2 - playerSize / 2;
    const endY = endRect.top + endRect.height / 2 - playerSize / 2;
    
    player.style.position = 'fixed';
    player.style.width = playerSize + 'px';
    player.style.height = playerSize + 'px';
    player.style.left = startX + 'px';
    player.style.top = startY + 'px';
    player.style.transition = 'none';
    player.style.zIndex = '200';
    
    // Animation mit JavaScript
    const duration = 600;
    const startTime = Date.now();
    const jumpHeight = playerSize * 0.8;
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: ease-in-out
        const eased = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // Horizontale Position (linear)
        const currentX = startX + (endX - startX) * eased;
        
        // Vertikale Position (Parabelbogen)
        const parabola = 4 * progress * (1 - progress);
        const currentY = startY + (endY - startY) * eased - jumpHeight * parabola;
        
        // Größe (leicht während Sprung vergrößern)
        const scale = 1 + 0.2 * parabola;
        
        player.style.left = currentX + 'px';
        player.style.top = currentY + 'px';
        player.style.transform = `scale(${scale})`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation beendet
            playerPosition = endPos;
            player.remove();
            updatePlayerDisplay();
        }
    };
    
    requestAnimationFrame(animate);
    await sleep(duration);
}

// Weitsprung mit Animation (3 Felder)
async function performLongJump() {
    // Prüfe ob genug Weitsprünge gesammelt wurden
    if (usedLongjumps >= longjumpCount) {
        // Nicht genug Weitsprünge gesammelt - normale Bewegung stattdessen (oder skip)
        return; // Einfach überspringen
    }
    
    usedLongjumps++; // Weitsprung verbrauchen
    
    const directions = [
        { x: 0, y: -1 },  // Nord
        { x: 1, y: 0 },   // Ost
        { x: 0, y: 1 },   // Süd
        { x: -1, y: 0 }   // West
    ];
    
    const dir = directions[playerDirection];
    const startPos = { ...playerPosition };
    const jumpDistance = 3;
    const endPos = { x: startPos.x + dir.x * jumpDistance, y: startPos.y + dir.y * jumpDistance };
    
    // Startposition
    updatePlayerDisplay();
    const startCell = getCellAt(startPos.x, startPos.y);
    if (!startCell) return;
    
    const player = startCell.querySelector('.player');
    if (!player) return;
    
    const startRect = startCell.getBoundingClientRect();
    const endCell = getCellAt(endPos.x, endPos.y);
    if (!endCell) {
        playerPosition = endPos;
        return;
    }
    const endRect = endCell.getBoundingClientRect();
    
    // Zu fixer Positionierung mit fester Größe wechseln
    const playerSize = player.offsetWidth;
    const startX = startRect.left + startRect.width / 2 - playerSize / 2;
    const startY = startRect.top + startRect.height / 2 - playerSize / 2;
    const endX = endRect.left + endRect.width / 2 - playerSize / 2;
    const endY = endRect.top + endRect.height / 2 - playerSize / 2;
    
    player.style.position = 'fixed';
    player.style.width = playerSize + 'px';
    player.style.height = playerSize + 'px';
    player.style.left = startX + 'px';
    player.style.top = startY + 'px';
    player.style.transition = 'none';
    player.style.zIndex = '200';
    
    // Animation mit JavaScript (höherer Sprung)
    const duration = 700;
    const startTime = Date.now();
    const jumpHeight = playerSize * 1.2; // Höher als normaler Sprung
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing-Funktion
        const eased = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // Parabel für den Sprung
        const parabola = 4 * progress * (1 - progress);
        
        const currentX = startX + (endX - startX) * eased;
        const currentY = startY + (endY - startY) * eased - jumpHeight * parabola;
        
        player.style.left = currentX + 'px';
        player.style.top = currentY + 'px';
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            playerPosition = endPos;
            player.remove();
            updatePlayerDisplay();
        }
    };
    
    requestAnimationFrame(animate);
    await sleep(duration);
}

// Zum Startfeld zurücksetzen
function resetToStart() {
    failCount++;
    updateStats();
    
    const startCoord = parseCoordinate(levelData.start);
    playerPosition = { ...startCoord };
    playerDirection = 0;
    
    updatePlayerDisplay();
}

// Gewinn-Modal anzeigen
function showWinModal() {
    // Fortschritt speichern (nur im Normal-Mode)
    if (gameMode === 'normal') {
        saveLevelProgress(currentLevel + 1);
    }
    
    // Button-Text und Sichtbarkeit für User-Maps anpassen
    if (gameMode === 'usermap') {
        nextLevelBtn.style.display = 'inline-block';
        nextLevelBtn.textContent = 'Zurück zur Map-Auswahl';
    } else {
        nextLevelBtn.style.display = 'inline-block';
        nextLevelBtn.textContent = 'Nächstes Level';
    }
    
    winModal.classList.add('show');
}

// Wasser-Modal anzeigen
function showWaterModal() {
    failCount++;
    updateStats();
    waterModal.classList.add('show');
}

// Statistiken aktualisieren
function updateStats() {
    levelNumberEl.textContent = currentLevel;
    failCountEl.textContent = failCount;
}

// Hilfsfunktion: Warten
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Verschiebe- und Lösch-Funktionen - Variablen
let draggedItem = null;
let isDragMode = false;
let touchStartY = 0;
let touchStartX = 0;
let touchClone = null;

// Lösche ein Queue-Item
function deleteQueueItem(item) {
    item.remove();
    // Queue-Array neu aufbauen
    commandQueue = [];
    const queueItems = commandQueueEl.querySelectorAll('.queue-item');
    queueItems.forEach(queueItem => {
        commandQueue.push(queueItem.dataset.command);
    });
    updateQueueClass();
    updateLongjumpButton(); // Button-Status aktualisieren
}

// Starte Drag-Modus für ein Item
function startDragMode(item, event) {
    if (isDragMode) return;
    
    isDragMode = true;
    draggedItem = item;
    item.classList.add('dragging');
    
    // Unterscheide zwischen Touch und Maus
    if (event.type === 'touchstart') {
        const touch = event.touches[0];
        touchStartY = touch.clientY;
        touchStartX = touch.clientX;
        
        // Touch-Events
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    } else if (event.type === 'mousedown') {
        // Maus-Events - Track mousemove wie bei Touch
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        touchStartY = mouseY;
        touchStartX = mouseX;
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
}

// Maus-Move-Handler (analog zu Touch)
function handleMouseMove(e) {
    if (!isDragMode || !draggedItem) return;
    
    // Klon für visuelles Feedback erstellen (nur beim ersten Move)
    if (!touchClone) {
        touchClone = draggedItem.cloneNode(true);
        touchClone.style.position = 'fixed';
        touchClone.style.pointerEvents = 'none';
        touchClone.style.opacity = '0.8';
        touchClone.style.zIndex = '1000';
        touchClone.style.width = draggedItem.offsetWidth + 'px';
        document.body.appendChild(touchClone);
    }
    
    // Klon bewegen
    touchClone.style.left = e.clientX - touchClone.offsetWidth / 2 + 'px';
    touchClone.style.top = e.clientY - touchClone.offsetHeight / 2 + 'px';
    
    // Element unter dem Cursor finden und neu positionieren
    const afterElement = getDragAfterElement(commandQueueEl, e.clientY);
    if (afterElement == null) {
        commandQueueEl.appendChild(draggedItem);
    } else {
        commandQueueEl.insertBefore(draggedItem, afterElement);
    }
}

// Maus-Up-Handler (analog zu Touch-End)
function handleMouseUp(e) {
    if (!isDragMode || !draggedItem) return;
    
    // Event-Listener entfernen
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Klon entfernen
    if (touchClone) {
        touchClone.remove();
        touchClone = null;
    }
    
    draggedItem.classList.remove('dragging');
    isDragMode = false;
    draggedItem = null;
    
    // Queue-Array neu aufbauen
    commandQueue = [];
    const queueItems = commandQueueEl.querySelectorAll('.queue-item');
    queueItems.forEach(item => {
        commandQueue.push(item.dataset.command);
    });
    updateQueueClass();
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.queue-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Touch-Event-Handler für Mobile
function handleTouchMove(e) {
    if (!isDragMode || !draggedItem) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    
    // Klon für visuelles Feedback erstellen (nur beim ersten Move)
    if (!touchClone) {
        touchClone = draggedItem.cloneNode(true);
        touchClone.style.position = 'fixed';
        touchClone.style.pointerEvents = 'none';
        touchClone.style.opacity = '0.8';
        touchClone.style.zIndex = '1000';
        touchClone.style.width = draggedItem.offsetWidth + 'px';
        document.body.appendChild(touchClone);
    }
    
    // Klon bewegen
    touchClone.style.left = touch.clientX - touchClone.offsetWidth / 2 + 'px';
    touchClone.style.top = touch.clientY - touchClone.offsetHeight / 2 + 'px';
    
    // Element in Queue neu positionieren
    const afterElement = getDragAfterElement(commandQueueEl, touch.clientY);
    
    if (afterElement == null) {
        commandQueueEl.appendChild(draggedItem);
    } else {
        commandQueueEl.insertBefore(draggedItem, afterElement);
    }
}

function handleTouchEnd(e) {
    if (!isDragMode || !draggedItem) return;
    
    draggedItem.classList.remove('dragging');
    
    // Klon entfernen
    if (touchClone) {
        touchClone.remove();
        touchClone = null;
    }
    
    // Event-Listener entfernen
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    
    // Queue-Array neu aufbauen
    commandQueue = [];
    const queueItems = commandQueueEl.querySelectorAll('.queue-item');
    queueItems.forEach(item => {
        commandQueue.push(item.dataset.command);
    });
    updateQueueClass();
    
    isDragMode = false;
    draggedItem = null;
}

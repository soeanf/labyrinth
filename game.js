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

    // Drag & Drop für Queue
    commandQueueEl.addEventListener('dragover', handleDragOver);
    commandQueueEl.addEventListener('drop', handleDrop);
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

    // Spieler platzieren
    updatePlayerDisplay();
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

// Befehl zur Queue hinzufügen
function addCommandToQueue(command) {
    const queueItem = document.createElement('div');
    queueItem.className = 'queue-item';
    queueItem.draggable = true;
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
    }

    queueItem.appendChild(arrow);
    queueItem.appendChild(label);

    // Drag-Events (Maus)
    queueItem.addEventListener('dragstart', handleDragStart);
    queueItem.addEventListener('dragend', handleDragEnd);
    queueItem.addEventListener('dragover', (e) => e.preventDefault());
    
    // Touch-Events (iPad/Mobile)
    queueItem.addEventListener('touchstart', handleTouchStart);
    queueItem.addEventListener('touchmove', handleTouchMove);
    queueItem.addEventListener('touchend', handleTouchEnd);

    commandQueueEl.appendChild(queueItem);
    commandQueue.push(command);
    updateQueueClass();
}

// Queue leeren
function clearQueue() {
    commandQueueEl.innerHTML = '';
    commandQueue = [];
    updateQueueClass();
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

    isRunning = true;
    startBtn.disabled = true;
    clearBtn.disabled = true;
    commandButtons.forEach(btn => btn.disabled = true);

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
}

// Einzelnen Befehl ausführen
async function executeCommand(command) {
    switch (command) {
        case 'forward':
            moveForward(1);
            updatePlayerDisplay();
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
    const endPos = { x: startPos.x + dir.x * 2, y: startPos.y + dir.y * 2 };
    
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

// Drag & Drop Funktionen
let draggedItem = null;
let touchStartY = 0;
let touchStartX = 0;
let touchClone = null;

function handleDragStart(e) {
    draggedItem = e.target;
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    
    // Prüfen ob außerhalb der Queue gedroppt wurde
    const queueRect = commandQueueEl.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const isOutside = mouseX < queueRect.left || mouseX > queueRect.right ||
                      mouseY < queueRect.top || mouseY > queueRect.bottom;
    
    if (isOutside) {
        // Element löschen
        e.target.remove();
        // Queue-Array neu aufbauen
        commandQueue = [];
        const queueItems = commandQueueEl.querySelectorAll('.queue-item');
        queueItems.forEach(item => {
            commandQueue.push(item.dataset.command);
        });
        updateQueueClass();
    }
}

function handleDragOver(e) {
    e.preventDefault();
    const afterElement = getDragAfterElement(commandQueueEl, e.clientY);
    const dragging = document.querySelector('.dragging');
    
    if (afterElement == null) {
        commandQueueEl.appendChild(dragging);
    } else {
        commandQueueEl.insertBefore(dragging, afterElement);
    }
}

function handleDrop(e) {
    e.preventDefault();
    // Queue-Array neu aufbauen
    commandQueue = [];
    const queueItems = commandQueueEl.querySelectorAll('.queue-item');
    queueItems.forEach(item => {
        commandQueue.push(item.dataset.command);
    });
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

// Touch-Event-Handler für iPad
function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
    draggedItem = e.target.closest('.queue-item');
    
    if (draggedItem) {
        draggedItem.classList.add('dragging');
        
        // Klon für visuelles Feedback erstellen
        touchClone = draggedItem.cloneNode(true);
        touchClone.style.position = 'fixed';
        touchClone.style.pointerEvents = 'none';
        touchClone.style.opacity = '0.8';
        touchClone.style.zIndex = '1000';
        touchClone.style.width = draggedItem.offsetWidth + 'px';
        touchClone.style.left = touch.clientX - draggedItem.offsetWidth / 2 + 'px';
        touchClone.style.top = touch.clientY - draggedItem.offsetHeight / 2 + 'px';
        document.body.appendChild(touchClone);
    }
}

function handleTouchMove(e) {
    if (!draggedItem) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    
    // Klon bewegen
    if (touchClone) {
        touchClone.style.left = touch.clientX - touchClone.offsetWidth / 2 + 'px';
        touchClone.style.top = touch.clientY - touchClone.offsetHeight / 2 + 'px';
    }
    
    // Element in Queue neu positionieren
    const afterElement = getDragAfterElement(commandQueueEl, touch.clientY);
    
    if (afterElement == null) {
        commandQueueEl.appendChild(draggedItem);
    } else {
        commandQueueEl.insertBefore(draggedItem, afterElement);
    }
}

function handleTouchEnd(e) {
    if (!draggedItem) return;
    
    const touch = e.changedTouches[0];
    draggedItem.classList.remove('dragging');
    
    // Klon entfernen
    if (touchClone) {
        touchClone.remove();
        touchClone = null;
    }
    
    // Prüfen ob außerhalb der Queue gedroppt wurde
    const queueRect = commandQueueEl.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    
    const isOutside = touchX < queueRect.left || touchX > queueRect.right ||
                      touchY < queueRect.top || touchY > queueRect.bottom;
    
    if (isOutside) {
        // Element löschen
        draggedItem.remove();
    }
    
    // Queue-Array neu aufbauen
    commandQueue = [];
    const queueItems = commandQueueEl.querySelectorAll('.queue-item');
    queueItems.forEach(item => {
        commandQueue.push(item.dataset.command);
    });
    updateQueueClass();
    
    draggedItem = null;
}

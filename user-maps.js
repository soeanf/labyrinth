// DOM-Elemente
const levelCodeInput = document.getElementById('levelCodeInput');
const loadBtn = document.getElementById('loadBtn');
const mapsList = document.getElementById('mapsList');
const loadingModal = document.getElementById('loadingModal');

// Initialisierung
function init() {
    setupEventListeners();
    loadAvailableMaps();
}

// Event-Listeners
function setupEventListeners() {
    loadBtn.addEventListener('click', loadLevelByCode);
    levelCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadLevelByCode();
        }
    });
}

// Verfügbare Maps laden
async function loadAvailableMaps() {
    try {
        const response = await fetch('list-user-maps.php');
        const result = await response.json();

        if (result.success && result.maps.length > 0) {
            displayMaps(result.maps);
        } else {
            mapsList.innerHTML = `
                <div class="no-maps">
                    <p>Noch keine User Maps vorhanden.</p>
                    <p><a href="editor.html">Erstelle jetzt dein eigenes Level!</a></p>
                </div>
            `;
        }
    } catch (error) {
        mapsList.innerHTML = `
            <div class="no-maps">
                <p>Fehler beim Laden der Maps.</p>
            </div>
        `;
    }
}

// Maps anzeigen
function displayMaps(maps) {
    mapsList.innerHTML = '';
    const currentUserId = localStorage.getItem('labyrinth_user_id');

    maps.forEach(map => {
        const card = document.createElement('div');
        card.className = 'map-card';
        
        // Prüfe ob der Benutzer der Ersteller ist
        const isOwnMap = map.data.creator && map.data.creator.userId === currentUserId;
        
        // Thumbnail erstellen
        const thumbnail = createLevelThumbnail(map.data);
        thumbnail.className = 'thumbnail-grid'; // Für Kompatibilität mit user-maps.css
        
        card.innerHTML = `
            <div class="map-header">
                <div class="map-code">${map.code}</div>
                ${isOwnMap ? '<button class="edit-btn" title="Karte bearbeiten">✏️</button>' : ''}
            </div>
            <div class="map-info">${map.sandCount} Sand-Felder</div>
        `;
        
        // Thumbnail zwischen Header und Info einfügen
        card.insertBefore(thumbnail, card.querySelector('.map-info'));
        
        // Event-Listener
        if (isOwnMap) {
            const editBtn = card.querySelector('.edit-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Verhindert das Laden des Levels
                editMap(map.code, map.data);
            });
        }
        
        card.addEventListener('click', () => loadLevel(map.code));
        mapsList.appendChild(card);
    });
}

// Level per Code laden
async function loadLevelByCode() {
    const code = levelCodeInput.value.trim().toUpperCase();

    if (code.length !== 6) {
        alert('Bitte gib einen 6-stelligen Level-Code ein!');
        return;
    }

    await loadLevel(code);
}

// Level laden und zum Spiel wechseln
async function loadLevel(code) {
    loadingModal.classList.add('active');

    try {
        const response = await fetch(`user-maps/${code}.json`);
        
        if (!response.ok) {
            throw new Error('Level nicht gefunden');
        }

        const levelData = await response.json();

        // Level-Daten in localStorage speichern für das Spiel
        localStorage.setItem('userLevel', JSON.stringify(levelData));
        localStorage.setItem('userLevelCode', code);

        // Zum Spiel wechseln
        window.location.href = 'game.html?usermap=' + code;

    } catch (error) {
        loadingModal.classList.remove('active');
        alert('Level konnte nicht geladen werden: ' + error.message);
    }
}

// Karte zum Bearbeiten im Editor laden
function editMap(code, data) {
    // Speichere die Karten-Daten und den Code für den Editor
    localStorage.setItem('editMapData', JSON.stringify(data));
    localStorage.setItem('editMapCode', code);
    
    // Wechsel zum Editor
    window.location.href = 'editor.html?edit=' + code;
}

// Initialisierung starten
init();

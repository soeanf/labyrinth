// User-ID-Verwaltung und Anzeige
(function() {
    // User-ID laden oder erstellen
    function ensureUserId() {
        let userId = localStorage.getItem('labyrinth_user_id');
        
        if (!userId) {
            // Neue ID generieren: Zeitstempel + Zufallszahl
            userId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('labyrinth_user_id', userId);
        }
        
        return userId;
    }

    // User-ID anzeigen
    function displayUserId() {
        const userId = ensureUserId();
        const display = document.getElementById('userIdDisplay');
        
        if (display) {
            display.textContent = `ID: ${userId}`;
            display.title = 'Deine eindeutige Browser-ID';
        }
    }

    // Bei Seitenladung anzeigen
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', displayUserId);
    } else {
        displayUserId();
    }
})();

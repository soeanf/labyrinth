# 🎮 Labyrinth - Programmier-Lernspiel

Ein browserbasiertes Lernspiel für den Informatikunterricht in Klasse 5 zum Thema **Handlungsabläufe und algorithmisches Denken**.

## 📋 Über das Projekt

Labyrinth ist ein pädagogisches Spiel, das Schüler:innen spielerisch an grundlegende Programmierkonzepte heranführt. Durch das Erstellen von Befehlssequenzen lernen sie:

- **Algorithmisches Denken**: Problemlösung durch schrittweise Anweisungen
- **Sequenzen**: Befehle werden der Reihe nach ausgeführt
- **Debugging**: Fehlerhafte Sequenzen erkennen und korrigieren
- **Planung**: Vorausschauendes Denken vor der Ausführung
- **Iteration**: Mehrere Lösungsversuche bis zum Erfolg

## 🎯 Spielprinzip

Der Spieler steuert eine Figur durch ein Labyrinth vom Start- zum Zielpunkt. Die Steuerung erfolgt nicht direkt, sondern durch das **Zusammenstellen einer Befehlssequenz** aus vier Grundbefehlen:

- **→** Vorwärts gehen
- **↰** Nach links drehen
- **↱** Nach rechts drehen
- **⇒** Über ein Feld springen

Die Befehle werden per Drag & Drop in eine Warteschlange gezogen und dann gemeinsam ausgeführt. So lernen Schüler:innen, einen Plan zu erstellen, bevor sie handeln.

## ✨ Features

### Spielmodi

- **📚 Tutorial**: 3 einführende Level zum Kennenlernen der Mechaniken
- **🎯 Haupt-Spiel**: 7 progressiv schwieriger werdende Level mit Freischalt-System
- **🗺️ User Maps**: Spielen von benutzerdefinierten Leveln
- **🛠️ Level Editor**: Eigene Level erstellen und mit 6-stelligen Codes teilen

### Technische Features

- **Responsives Design**: Funktioniert auf Desktop, Tablet und Smartphone
- **Touch-Unterstützung**: Optimiert für iPad mit Touch-Drag-and-Drop
- **Fortschrittsspeicherung**: Cookie-basiertes Speichern des Level-Fortschritts
- **Level-Vorschau**: Thumbnails zeigen die Level vor dem Spielen
- **User-Tracking**: Anonyme Browser-ID zur Identifikation selbst erstellter Level
- **Keine Installation nötig**: Läuft direkt im Browser

## 🚀 Installation & Einrichtung

### Voraussetzungen

- Webserver (z.B. Apache, Nginx, Laragon, XAMPP)
- PHP (für Level-Speicherung im Editor)
- Moderner Webbrowser (Chrome, Firefox, Safari, Edge)

### Lokale Installation

1. Repository klonen oder downloaden:
```bash
git clone https://github.com/soeanf/labyrinth.git
cd labyrinth
```

2. Ordnerstruktur sicherstellen:
```
labyrinth/
├── index.html              # Hauptmenü
├── start.css               # Styling für Hauptmenü
├── game.html               # Spiel-Interface
├── game.js                 # Spiel-Logik
├── style.css               # Haupt-Stylesheet für Spiel
├── level-select.html       # Level-Auswahl mit Fortschritt
├── level-select.js         # Level-Auswahl-Logik
├── level-select.css        # Level-Auswahl-Styling
├── editor.html             # Level-Editor
├── editor.js               # Editor-Logik
├── editor.css              # Editor-Styling
├── user-maps.html          # User-Maps-Browser
├── user-maps.js            # User-Maps-Logik
├── user-maps.css           # User-Maps-Styling
├── utils.js                # Gemeinsame Hilfsfunktionen
├── user-id.js              # User-Tracking (Browser-ID)
├── save-level.php          # Backend: Level speichern
├── list-user-maps.php      # Backend: User-Maps auflisten
├── levels/                 # Offizielle Level (1-7)
│   ├── level1.json
│   ├── level2.json
│   └── ...
├── tutorial/               # Tutorial-Level (1-3)
│   ├── level1.json
│   ├── level2.json
│   └── level3.json
└── user-maps/              # Benutzerdefinierte Level (erstellt beim Speichern)
```

3. Ordner im Webserver-Root ablegen (z.B. `htdocs/labyrinth/` oder `www/labyrinth/`)

4. Im Browser öffnen: `http://localhost/labyrinth/`

### Ohne Webserver (eingeschränkt)

Für schnelles Testen kann die `index.html` direkt im Browser geöffnet werden. **Hinweis**: Der Level-Editor funktioniert nur mit PHP-Server.

## 📚 Nutzung im Unterricht

### Empfohlene Unterrichtsstruktur

**Phase 1: Einführung**
- Spielprinzip erklären
- Tutorial gemeinsam durchspielen
- Grundbefehle vorstellen
- Konzept "Befehlssequenz" erarbeiten

**Phase 2: Selbstständiges Spielen**
- Schüler:innen spielen die 7 Haupt-Level
- Hilfestellung bei schwierigen Leveln
- Reflexion: Wie plant man die Lösung?

**Phase 3: Kreativphase**
- Level-Editor erkunden
- Eigene Level erstellen
- Level-Codes austauschen
- Gegenseitig Level spielen

### Lernziele

- **Algorithmisches Denken**: Zerlegung eines Problems in Einzelschritte
- **Sequentielle Abläufe**: Verstehen von Reihenfolgen
- **Debugging**: Fehler finden und beheben
- **Räumliches Denken**: Orientierung und Wegplanung
- **Kreativität**: Eigene Level-Designs entwickeln

### Differenzierung

- **Schwächere Schüler:innen**: Fokus auf Tutorial und erste Level
- **Stärkere Schüler:innen**: Komplexe Level, Optimierung (kürzeste Lösung), Editor
- **Gemeinsames Lernen**: Level-Codes teilen und diskutieren

## 🎨 Level-Format

Level sind JSON-Dateien mit folgendem Format:

```json
{
  "start": "1x1",
  "goal": "10x10",
  "sand": [
    "1x2", "2x2", "3x2",
    "3x3", "3x4", "3x5"
  ]
}
```

- **Koordinaten**: Format `xxy` (1-basiert, 1-12 für das 12×12 Spielfeld)
- **start**: Startposition der Figur
- **goal**: Zielposition
- **sand**: Array begehbarer Felder (alle anderen sind Wasser)

## 🔧 Technische Details

### Technologie-Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP (nur für Level-Speicherung)
- **Speicherung**: 
  - Cookies für Level-Fortschritt
  - LocalStorage für User-ID
  - JSON-Dateien für Level
- **Keine Frameworks**: Bewusst framework-frei für maximale Kompatibilität

### Browser-Kompatibilität

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Browser (iOS Safari, Chrome Mobile)

### Responsive Design

- **Desktop**: Optimale Erfahrung mit Maus
- **Tablet**: Touch-optimiert, iPad-getestet
- **Smartphone**: Funktional, aber kleine Bildschirme können limitierend sein

## 🤝 Beiträge

Beiträge sind willkommen! Ob neue Level, Bugfixes oder Features:

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/NeuesFeature`)
3. Commit deine Änderungen (`git commit -m 'Füge neues Feature hinzu'`)
4. Push zum Branch (`git push origin feature/NeuesFeature`)
5. Öffne einen Pull Request

## 📝 Lizenz

Dieses Projekt steht unter der MIT-Lizenz - siehe [LICENSE](LICENSE) Datei für Details.

## 👨‍💻 Autor

Entwickelt für den Einsatz im Informatikunterricht der 5. Klasse.

## 🙏 Danksagungen

- Inspiriert durch klassische Programmier-Lernspiele wie Lightbot und Code.org
- Entwickelt mit Fokus auf einfache Bedienbarkeit und pädagogischen Wert

## 📧 Kontakt & Support

Bei Fragen, Problemen oder Anregungen öffne bitte ein Issue im GitHub-Repository.

---

**Viel Spaß beim Programmieren lernen! 🚀**

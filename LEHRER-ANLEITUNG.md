# 👨‍🏫 Anleitung für Lehrkräfte

## Übersicht

Labyrinth ist ein browserbasiertes Lernspiel für den Informatikunterricht in Klasse 5. Es vermittelt grundlegende Konzepte des algorithmischen Denkens und der Programmierung auf spielerische Weise.

## Lernziele nach Lehrplan

### Kompetenzbereiche

**Modellieren und Implementieren**
- Schüler:innen zerlegen Probleme in Teilschritte
- Sie erstellen sequenzielle Handlungsabläufe
- Sie testen und korrigieren ihre Lösungen

**Algorithmisches Denken**
- Verstehen von Befehlen und deren Ausführungsreihenfolge
- Erkennen von Mustern und Strukturen
- Planung vor Ausführung

**Problemlösestrategien**
- Trial-and-Error mit Reflexion
- Schrittweise Annäherung an die Lösung
- Debugging-Fähigkeiten

## Empfohlener Unterrichtsablauf

### Stunde 1: Einführung (45 Min)

**Phase 1: Motivation (10 Min)**
- Zeigen Sie das Spiel per Beamer
- Frage: "Wie steuert man Roboter oder Computerspiele?"
- Einführung: "Heute programmieren wir eine Figur!"

**Phase 2: Tutorial gemeinsam (15 Min)**
- Tutorial-Level 1 gemeinsam am Beamer lösen
- Jeden Befehl erklären und visualisieren
- Begriffe einführen: Befehl, Sequenz, Algorithmus

**Phase 3: Selbstständiges Üben (15 Min)**
- Schüler:innen spielen Tutorial-Level 2 und 3
- Unterstützung bei Schwierigkeiten

**Phase 4: Reflexion (5 Min)**
- Was war schwierig?
- Welche Strategie hilft? (Erst planen, dann ausführen!)

### Stunde 2: Vertiefung (45 Min)

**Phase 1: Wiederholung (5 Min)**
- Kurze Wiederholung der vier Befehle
- Strategie besprechen: Weg mental durchgehen

**Phase 2: Haupt-Level spielen (30 Min)**
- Schüler:innen arbeiten selbstständig
- Fortschritt wird automatisch gespeichert
- Differenzierung durch progressive Schwierigkeit

**Phase 3: Partnerarbeit (10 Min)**
- Schüler:innen helfen sich gegenseitig
- Gemeinsames Besprechen schwieriger Level

### Stunde 3: Kreativphase (45 Min)

**Phase 1: Editor vorstellen (10 Min)**
- Level-Editor zeigen
- Funktionen erklären (Sand, Wasser, Start, Ziel)
- Hinweis: Level müssen lösbar sein!

**Phase 2: Eigene Level erstellen (25 Min)**
- Schüler:innen erstellen 1-2 eigene Level
- Code notieren für den Austausch

**Phase 3: Level tauschen (10 Min)**
- Codes austauschen (z.B. über Tafel)
- Gegenseitig Level spielen
- Kurzes Feedback: War es lösbar? Schwierig?

## Differenzierungsmöglichkeiten

### Für schwächere Schüler:innen

- **Pairing**: Zu zweit an einem Computer
- **Fokus Tutorial**: Mehr Zeit für die 3 Tutorial-Level
- **Hilfestellung**: Weg mit Finger auf dem Bildschirm nachfahren
- **Vereinfachung**: Nur die ersten 3-4 Haupt-Level als Ziel

### Für stärkere Schüler:innen

- **Optimierung**: Kürzeste Lösung finden (wenigste Befehle)
- **Komplexe Level**: Alle 7 Level durchspielen
- **Editor**: Mehrere eigene Level erstellen
- **Herausforderung**: Level für andere möglichst schwierig gestalten

### Für alle

- **Reflexion**: "Wie gehst du vor?" "Was war deine Strategie?"
- **Visualisierung**: Lösung auf Papier aufzeichnen vor dem Eingeben

## Häufige Schülerfragen

**"Kann ich die Befehle während der Ausführung ändern?"**
- Nein, das ist Absicht! Man muss vorher planen (wie beim echten Programmieren).

**"Warum dreht sich die Figur nicht?"**
- Links/Rechts drehen die Blickrichtung, nicht die Position. Dann mit Vorwärts gehen.

**"Ich komme nicht weiter!"**
- Strategie: Rückwärts vom Ziel denken. Wo muss die Figur vorher stehen?

**"Mein Level im Editor funktioniert nicht!"**
- Prüfen: Ist das Level lösbar? Gibt es einen zusammenhängenden Weg?

## Technische Hinweise

### Vorbereitung

✅ **Vor der Stunde checken:**
- Funktioniert der Webserver?
- Ist das Spiel unter `http://localhost/labyrinth/` erreichbar?
- Funktioniert die Darstellung auf den Schul-Computern?
- Bei iPads: Touch-Bedienung testen

### Troubleshooting

**Problem: Seite lädt nicht**
- Lösung: Webserver neu starten, Pfad prüfen

**Problem: Level-Editor speichert nicht**
- Lösung: PHP muss aktiv sein, Schreibrechte für `user-maps/` Ordner prüfen

**Problem: Fortschritt geht verloren**
- Lösung: Cookies müssen aktiviert sein (normalerweise Standard)

**Problem: Touch funktioniert nicht auf iPad**
- Lösung: Browser aktualisieren, alternativ Safari verwenden

## Bewertungsmöglichkeiten

### Prozessorientiert

- Arbeitsweise beobachten (planvoll vs. wahllos probieren)
- Hilfestellung für Mitschüler:innen
- Reflexionsfähigkeit

### Produktorientiert

- Anzahl geschaffter Level
- Selbst erstellte Level (Kreativität, Lösbarkeit)
- Kürzeste Lösung gefunden

### Nicht empfohlen

- Reine Anzahl geschaffter Level als Note (zu starke Leistungsunterschiede!)
- Zeitdruck (kontraproduktiv für algorithmisches Denken)

## Weiterführende Ideen

### Erweiterungen für fortgeschrittene Klassen

- **Bedingte Befehle**: "Wenn Wasser vor dir, dann springe"
- **Schleifen**: "Wiederhole 3x: Vorwärts, Rechts"
- **Unterprogramme**: Eigene Befehlsblöcke definieren

### Fächerübergreifend

- **Mathematik**: Koordinatensystem, Orientierung im Raum
- **Deutsch**: Handlungsanweisungen formulieren und aufschreiben
- **Kunst**: Pixel-Art für neue Level-Elemente gestalten

## Lizenz & Weitergabe

Das Spiel steht unter MIT-Lizenz und darf:
- ✅ Im Unterricht verwendet werden
- ✅ An Kollegen weitergegeben werden
- ✅ Angepasst und erweitert werden
- ✅ Auf Schulservern gehostet werden

## Feedback & Verbesserungen

Haben Sie Verbesserungsvorschläge oder neue Level-Ideen? Öffnen Sie ein Issue auf GitHub!

---

**Viel Erfolg im Unterricht! 🎓**

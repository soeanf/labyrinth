<?php
header('Content-Type: application/json');

// POST-Daten empfangen
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['code']) || !isset($data['data'])) {
    echo json_encode(['success' => false, 'error' => 'Ungültige Daten']);
    exit;
}

$code = $data['code'];
$levelData = $data['data'];
$deviceInfo = isset($data['device']) ? $data['device'] : null;
$overwrite = isset($data['overwrite']) ? $data['overwrite'] : false;

// Client-IP hinzufügen
if ($deviceInfo) {
    $deviceInfo['ip'] = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

// Validierung
if (!preg_match('/^[A-Z0-9]{6}$/', $code)) {
    echo json_encode(['success' => false, 'error' => 'Ungültiger Level-Code']);
    exit;
}

// user-maps Ordner erstellen falls nicht vorhanden
$dir = 'user-maps';
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

// Dateiname
$filename = $dir . '/' . $code . '.json';

// Prüfen ob Code bereits existiert
if (file_exists($filename) && !$overwrite) {
    // Nur wenn NICHT überschrieben werden soll, neuen Code generieren
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $code = '';
    for ($i = 0; $i < 6; $i++) {
        $code .= $chars[rand(0, strlen($chars) - 1)];
    }
    $filename = $dir . '/' . $code . '.json';
}

// Vollständige Daten zusammenstellen
$fullData = $levelData;
if ($deviceInfo) {
    $fullData['creator'] = $deviceInfo;
}

// Level speichern
$json = json_encode($fullData, JSON_PRETTY_PRINT);
$result = file_put_contents($filename, $json);

if ($result !== false) {
    echo json_encode(['success' => true, 'code' => $code, 'file' => $filename]);
} else {
    echo json_encode(['success' => false, 'error' => 'Fehler beim Schreiben der Datei']);
}
?>

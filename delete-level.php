<?php
header('Content-Type: application/json');

// POST-Daten empfangen
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['code'])) {
    echo json_encode(['success' => false, 'error' => 'Ungültige Daten']);
    exit;
}

$code = $data['code'];

// Validierung
if (!preg_match('/^[A-Z0-9]{6}$/', $code)) {
    echo json_encode(['success' => false, 'error' => 'Ungültiger Level-Code']);
    exit;
}

// Dateiname
$dir = 'user-maps';
$filename = $dir . '/' . $code . '.json';

// Prüfen ob Datei existiert
if (!file_exists($filename)) {
    echo json_encode(['success' => false, 'error' => 'Karte nicht gefunden']);
    exit;
}

// Datei löschen
if (unlink($filename)) {
    echo json_encode(['success' => true, 'message' => 'Karte erfolgreich gelöscht']);
} else {
    echo json_encode(['success' => false, 'error' => 'Fehler beim Löschen der Datei']);
}
?>

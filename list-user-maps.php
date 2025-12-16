<?php
header('Content-Type: application/json');

$dir = 'user-maps';
$maps = [];

if (is_dir($dir)) {
    $files = scandir($dir);
    
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'json') {
            $code = pathinfo($file, PATHINFO_FILENAME);
            $content = file_get_contents($dir . '/' . $file);
            $data = json_decode($content, true);
            
            if ($data && isset($data['sand'])) {
                $maps[] = [
                    'code' => $code,
                    'sandCount' => count($data['sand']),
                    'file' => $file,
                    'data' => $data
                ];
            }
        }
    }
}

echo json_encode([
    'success' => true,
    'maps' => $maps,
    'count' => count($maps)
]);
?>

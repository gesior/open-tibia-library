<?php
/**
 * Script to pack PHP files into JSON format for outfitImagePhpGeneratorCode.ts
 *
 * Usage: php release.php > data.json
 *
 * This script reads selected files from directory,
 * encodes their content in base64, and outputs a formatted JSON array
 * with file paths and base64-encoded contents.
 */

$files = [
    "libs/gifCreator.php",
    "libs/outfitter.php",
    "abuse_warning.png",
    "animoutfit.php",
    "cacheGenerator.php",
    "config.php",
    "index.php",
    "outfit.php",
];

$output = [];

foreach ($files as $relativePath) {
    $fullPath = __DIR__ . '/' . $relativePath;

    if (!file_exists($fullPath)) {
        echo "Warning: File not found: $fullPath\n";
        continue;
    }

    $content = file_get_contents($fullPath);
    $base64Content = base64_encode($content);

    $output[$relativePath] = $base64Content;
}

echo json_encode($output, JSON_PRETTY_PRINT);
echo "\n";

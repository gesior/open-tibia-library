<?php

// Code to generate 'colored-outfit-images-generator' files as JSON object of base64 strings for 'outfitImagePhpGeneratorCode.ts'

$filesList = [
    'libs/gifCreator.php',
    'libs/outfitter.php',
    'abuse_warning.png',
    'animoutfit.php',
    'cacheGenerator.php',
    'config.php',
    'index.php',
    'outfit.php'
];

$filesContent = [];

foreach ($filesList as $file) {
    $filesContent[$file] = base64_encode(file_get_contents($file));
}

echo json_encode($filesContent, JSON_PRETTY_PRINT);

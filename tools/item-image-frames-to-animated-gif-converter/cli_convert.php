<?php

include_once(__DIR__ . '/lib/converterPngToApngAnimation.php');
include_once(__DIR__ . '/lib/converterPngToGifAnimation.php');

if (!isset($argv[1]) || !in_array($argv[1], ['GIF', 'APNG'])) {
    echo 'Missing animation format: GIF or APNG' . PHP_EOL;
    echo 'CLI usage example: php cli_convert.php APNG items.zip' . PHP_EOL;
    echo 'CLI usage example: php cli_convert.php GIF items.zip' . PHP_EOL;
    exit;
}
if (!isset($argv[2])) {
    echo 'Missing path to items.zip file.' . PHP_EOL;
    echo 'CLI usage example: php cli_convert.php APNG items.zip' . PHP_EOL;
    echo 'CLI usage example: php cli_convert.php GIF items.zip' . PHP_EOL;
    exit;
}

$exportFormat = $argv[1];
$zipFilePath = $argv[2];

$startTime = time();

echo 'Started converter - it may take few minutes to generate APNGs/GIFs!' . PHP_EOL;
$loadFolder = substr($zipFilePath, -4, 4) !== '.zip';
if ($exportFormat == 'APNG') {
    $converter = new ConverterPngToApngAnimation($zipFilePath, true, $loadFolder);
} else {
    $converter = new ConverterPngToGifAnimation($zipFilePath, true, $loadFolder);
}
$animatedImagesZipArchivePath = './generated-zip-archives/items_' . microtime(true) . '.zip';
try {
    $converter->convert($animatedImagesZipArchivePath, 0.2);
} catch (Exception $exception) {
    exit('Exception occurred during APNG/GIF generation: ' . $exception->getMessage());
}

echo 'Peak memory allocated: ' . round(memory_get_peak_usage(false) / 1024 / 1024, 2) . ' MB' . PHP_EOL;
echo 'Peak memory usage (real): ' . round(memory_get_peak_usage(true) / 1024 / 1024, 2) . ' MB' . PHP_EOL;
echo 'Execution time: ' . (time() - $startTime) . ' seconds' . PHP_EOL;

echo 'APNG/GIF IMAGES AND ANIMATIONS SAVED TO: ' . $animatedImagesZipArchivePath;

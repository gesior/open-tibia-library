<?php

include_once(__DIR__ . '/lib/converterPngToGifAnimation.php');

if (!isset($argv[1])) {
    echo 'Missing path to items.zip file.';
    echo 'CLI usage example: php cli_convert.php items.zip';
    exit;
}
$zipFilePath = $argv[1];

$startTime = time();

echo 'Started converter - it may take few minutes to generate GIFs!' . PHP_EOL;
$converter = new ConverterPngToGifAnimation($zipFilePath, true);
$gifImagesZipArchivePath = './generated-gif-zip-archives/items_' . microtime(true) . '.zip';
try {
    $converter->convert($gifImagesZipArchivePath);
} catch (Exception $exception) {
    exit('Exception occured during GIF generation: ' . $exception->getMessage());
}

echo 'Peak memory allocated: ' . round(memory_get_peak_usage(false) / 1024 / 1024, 2) . ' MB' . PHP_EOL;
echo 'Peak memory usage (real): ' . round(memory_get_peak_usage(true) / 1024 / 1024, 2) . ' MB' . PHP_EOL;
echo 'Execution time: ' . (time() - $startTime) . ' seconds' . PHP_EOL;

echo 'GIF IMAGES AND ANIMATIONS SAVED TO: ' . $gifImagesZipArchivePath;

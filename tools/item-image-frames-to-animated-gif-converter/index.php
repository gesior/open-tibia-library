<?php

include_once(__DIR__ . '/lib/converterPngToGifAnimation.php');

$generatedArchivesPath = './generated-gif-zip-archives/';

// clean up downloads directory
$list = scandir($generatedArchivesPath);
$archiveFilesList = [];
foreach ($list as $file) {
    if (substr($file, -4, 4) === '.zip') {
        $archiveFilesList[$file] = $file;
    }
}
sort($archiveFilesList);
foreach ($archiveFilesList as $archiveFile) {
    $archiveFilePath = $generatedArchivesPath . $archiveFile;
    $timeSinceFileCreation = time() - filemtime($archiveFilePath);
    if ($timeSinceFileCreation > 3600) {
        unlink($archiveFilePath);
    }
}
while (count($archiveFilesList) > 10) {
    $archiveFile = array_shift($archiveFilesList);
    $archiveFilePath = $generatedArchivesPath . $archiveFile;
    unlink($archiveFilePath);
}

if (isset($_FILES['items_zip']['tmp_name']) && is_uploaded_file($_FILES['items_zip']['tmp_name'])) {
    $zipFilePath = $_FILES['items_zip']['tmp_name'];

    $startTime = time();

    echo 'Started converter - it may take few minutes to generate GIFs!<br />';
    $converter = new ConverterPngToGifAnimation($zipFilePath, false);
    $gifImagesZipArchivePath = $generatedArchivesPath . 'items_' . microtime(true) . '.zip';
    $framesInterval = 0.2;
    if(isset($_POST['frames_interval']) && ((float) $_POST['frames_interval']) > 0.01) {
        $framesInterval = (float) $_POST['frames_interval'];
        echo 'Frames interval: ' . $framesInterval . '<br />';
    }
    try {
        $converter->convert($gifImagesZipArchivePath, $framesInterval);
    } catch (Exception $exception) {
        exit('Exception occurred during GIF generation: ' . $exception->getMessage());
    }

    echo 'Peak memory allocated: ' . round(memory_get_peak_usage(false) / 1024 / 1024, 2) . ' MB<br />';
    echo 'Peak memory usage (real): ' . round(memory_get_peak_usage(true) / 1024 / 1024, 2) . ' MB<br />';
    echo 'Execution time: ' . (time() - $startTime) . ' seconds<br />';

    echo 'GIF IMAGES AND ANIMATIONS SAVED TO: ' . $gifImagesZipArchivePath . '<br />';
    echo '<h2>DOWNLOAD LINK: <a href="' . $gifImagesZipArchivePath . '">' . $gifImagesZipArchivePath . '</a></h2>';
    exit;
}
?>
<html lang="en">
<head>
    <title>PNG to GIF converter</title>
</head>
<body>
<h2>PNG to GIF converter</h2>
<h4>Converts PNG images from Item Image Frames Generator into GIF animations.</h4>
<h4>Also works with not animated PNG images from Item Images Generator - just converts them to GIF, without
    animations.</h4>
<blockquote>
    How to use:<br/><br/>
    1. Generate items.zip using Item Images Generator:<br/>
    <a href="https://item-images.ots.me/generator/">https://item-images.ots.me/generator/</a><br/>
    <a href="https://item-images.ots.me/generator-animated-items/">https://item-images.ots.me/generator-animated-items/</a><br/>
    2. Select generated file in upload form below.<br/>
    3. Click "Convert to GIF"<br/>
    4. Wait... it can take few minutes.<br/>
    5. Click generated download link.<br/>
    <br/>
    <b>Server can process around 5 MB of items.zip per minute. Execution time limit is 5 minutes, so items.zip bigger
        than 20 MB will probably fail.</b>
    <br/>
</blockquote>
<form action="index.php" method="post" enctype="multipart/form-data">
    Select file <b>items.zip</b> to upload:<br/>
    <input type="file" name="items_zip"><br/>
    Frames interval (0.2 = 5 frames per second):<br/>
    <input type="text" name="frames_interval" value="0.2"><br/>
    <input type="submit" value="Convert to GIF" name="submit">
</form>
</body>
</html>

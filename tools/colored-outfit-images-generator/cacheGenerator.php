<?php

require_once('./config.php');

$dirIterator = new RecursiveDirectoryIterator($outfitImagesPath, FilesystemIterator::UNIX_PATHS);
$iterator = new RecursiveIteratorIterator($dirIterator, RecursiveIteratorIterator::SELF_FIRST);

$outfits = [];
$i = 0;
foreach ($iterator as $file)
{
	if ($file->isFile())
	{
        $filePath = trim($file->getPath(), '.');
        $filePath = trim($filePath, '/');
		$outfitIdData = explode('/', $filePath);
		$outfitId = $outfitIdData[1];
		$outfits[$outfitId]['files'][] = $filePath . '/' . $file->getFilename();
		if(isset($outfits[$outfitId]['framesNumber']))
			$outfits[$outfitId]['framesNumber'] = max($outfits[$outfitId]['framesNumber'], (int) substr($file->getFilename(), 0, 1));
		else
			$outfits[$outfitId]['framesNumber'] = (int) substr($file->getFilename(), 0, 1);
    }
}

// CODE TO CHECK WHAT VALUES OF 'framesNumber' ARE POSSIBLE FOR YOUR OUTFITS
$frameNumbers = [];
foreach($outfits as $outfitId => $outfit)
{
	if (!file_put_contents($outfitImagesPath . '/' . $outfitId . '/outfit.data.txt', serialize($outfit))) {
	    exit('PHP cannot write to: "' . $outfitImagesPath . '/' . $outfitId . '/outfit.data.txt", check directory access rights');
    }
	$frameNumbers[$outfit['framesNumber']]++;
}

if (!file_put_contents('./cache.generated.txt', 'cache generated')) {
    exit('PHP cannot write to: "./cache.generated.txt", check directory access rights');
}
echo 'FILE SYSTEM CACHE GENERATED<br />Animation frames count in loaded outfits:';
var_dump($frameNumbers);

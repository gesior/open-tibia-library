<?php

require_once('./config.php');

if (!file_exists('./cache.generated.txt')) {
    require_once('./cacheGenerator.php');
    exit;
}

header('Cache-control: max-age=' . (60 * 60 * 24 * 365));
header('Expires: ' . gmdate(DATE_RFC1123, time() + 60 * 60 * 24 * 365));
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', 1337) . ' GMT');
if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
    header('HTTP/1.0 304 Not Modified');
    header('Cache-Control: public');
    header('Pragma: cache');
    exit;
}

// Block sites that hotlink your host and overload it
$abusersList = array('aurera-global.com', 'bad-server.com');
if (isset($_SERVER['HTTP_REFERER']) && (in_array(parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST), $abusersList) ||
        in_array(substr(parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST), 4), $abusersList))
) {
    header('Content-Type: image/png');
    readfile('abuse_warning.png');
    exit;
}

require('libs/outfitter.php');
Outfitter::$outfitPath = $outfitImagesPath;
Outfitter::setResizeAllOutfitsTo64px($resizeAllOutfitsTo64px);

$id = 0;
if (isset($_GET['id'])) {
    $id = (int)$_GET['id'];
}
if (!Outfitter::loadData($id, false)) {
    exit('Outfit does not exist or file cache is not generated.');
}

$mount = 0;
if (isset($_GET['mount'])) {
    $mount = (int)$_GET['mount'];
}
if ($mount > 0 && !Outfitter::loadData($mount, true)) {
    exit('Mount outfit does not exist or file cache is not generated.');
}

$head = 0;
if (isset($_GET['head'])) {
    $head = (int)$_GET['head'];
}
$body = 0;
if (isset($_GET['body'])) {
    $body = (int)$_GET['body'];
}
$legs = 0;
if (isset($_GET['legs'])) {
    $legs = (int)$_GET['legs'];
}
$feet = 0;
if (isset($_GET['feet'])) {
    $feet = (int)$_GET['feet'];
}
$addons = 0;
if (isset($_GET['addons'])) {
    $addons = (int)$_GET['addons'];
}
$direction = 3;
if (isset($_GET['direction'])) {
    $direction = (int)$_GET['direction'];
}

$animationFrame = 1;
header('Content-type: image/gif');
imagegif(Outfitter::instance()->outfit($id, $addons, $head, $body, $legs, $feet, $mount, $direction, $animationFrame));

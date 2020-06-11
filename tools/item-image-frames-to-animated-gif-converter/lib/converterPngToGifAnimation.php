<?php
include_once(__DIR__ . '/gifCreator.php');

class ConverterPngToGifAnimation
{
    private static $transparentBackgroundColor = [255, 255, 255];
    /**
     * @var string
     */
    private $zipFilePath;
    /**
     * @var bool
     */
    private $printProgress;

    /**
     * @param string $zipFilePath
     */
    public function __construct($zipFilePath, $printProgress = true)
    {
        $this->zipFilePath = $zipFilePath;
        $this->printProgress = $printProgress;
    }

    /**
     * @param string $saveToPath
     * @param float $animationFrameDurationInSeconds
     * @throws Exception
     */
    public function convert($saveToPath, $animationFrameDurationInSeconds = 0.2)
    {
        $gitImagesZipArchive = new ZipArchive();
        if ($gitImagesZipArchive->open($saveToPath, ZIPARCHIVE::CREATE | ZIPARCHIVE::OVERWRITE) !== true) {
            throw new InvalidArgumentException('Failed to create ZIP archive: ' . $saveToPath);
        }

        foreach ($this->getFilesFromZip() as $fileName => $fileContents) {
            $fileBaseName = basename($fileName);
            if (substr($fileName, -4, 4) !== '.png') {
                echo $fileName . ' is not PNG' . PHP_EOL;
                continue;
            }

            $image = imagecreatefromstring($fileContents);
            if ($image === false) {
                throw new InvalidArgumentException('Cannot create image from file: ' . $fileName);
            }
            $width = imagesx($image);
            $height = imagesy($image);

            $fileNameWithoutExtension = substr($fileBaseName, 0, -4);
            $fileNameData = explode('_', $fileNameWithoutExtension);
            $itemId = $fileNameData[0];
            $framesCount = 1;
            if (isset($fileNameData[1])) {
                $framesCount = intval($fileNameData[1]);
            }
            $frameWidth = $width / $framesCount;

            $animationFrameImages = [];
            $animationFrameDurations = [];

            for ($frame = 0; $frame < $framesCount; ++$frame) {
                $animationFrameImage = imagecreatetruecolor($frameWidth, $height);

                $transparentBackgroundColor = imagecolorallocate($animationFrameImage, self::$transparentBackgroundColor[0], self::$transparentBackgroundColor[1], self::$transparentBackgroundColor[2]);
                imagefill($animationFrameImage, 0, 0, $transparentBackgroundColor);
                imagecolortransparent($animationFrameImage, $transparentBackgroundColor);
                imagealphablending($animationFrameImage, true);
                imagesavealpha($animationFrameImage, true);

                imagecopyresampled($animationFrameImage, $image, 0, 0, $frame * $frameWidth, 0, $frameWidth, $height, $frameWidth, $height);

                $animationFrameImages[] = $animationFrameImage;
                $animationFrameDurations[] = $animationFrameDurationInSeconds * 100;
            }

            $gc = new GifCreator();
            $gc->create($animationFrameImages, $animationFrameDurations, 0);
            $gifBinary = $gc->getGif();
            $gitImagesZipArchive->addFromString('item_gifs/' . $itemId . '.gif', $gifBinary);
            $gitImagesZipArchive->setCompressionName('item_gifs/' . $itemId . '.gif', ZipArchive::CM_STORE);
            if ($this->printProgress) {
                echo 'Generated ' . $itemId . ', frames: ' . $framesCount . PHP_EOL;
            }
        }
        echo 'Saving GIF images to ' . $saveToPath . '... ';
        $gitImagesZipArchive->close();
        echo 'SAVED' . PHP_EOL;
    }

    public function getFilesFromZip()
    {
        $zip = new ZipArchive();
        if ($zip->open($this->zipFilePath) === true) {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $fileName = $zip->getNameIndex($i);

                $fileHandler = $zip->getStream($fileName);
                if ($fileHandler === false) {
                    throw new InvalidArgumentException('Failed to read ZIP file: ' . $fileName);
                }
                $fileContents = stream_get_contents($fileHandler);
                if ($fileContents === false) {
                    throw new InvalidArgumentException('Failed to read ZIP file contents: ' . $fileName);
                }
                fclose($fileHandler);

                yield $fileName => $fileContents;
            }
            $zip->close();
        } else {
            throw new InvalidArgumentException('Failed to open ZIP archive.');
        }
    }
}
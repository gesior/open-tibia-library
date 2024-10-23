<?php

include_once(__DIR__ . '/abstractPngConverterAnimation.php');
include_once(__DIR__ . '/apngCreator.php');

class ConverterPngToApngAnimation extends AbstractPngConverterAnimation
{
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

        foreach ($this->getInputFiles() as $fileName => $fileContents) {
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

                $transparentBackgroundColor = imagecolorallocatealpha(
                    $animationFrameImage,
                    self::$transparentBackgroundColor[0],
                    self::$transparentBackgroundColor[1],
                    self::$transparentBackgroundColor[2],
                    self::$transparentBackgroundColor[3]
                );
                imagefill($animationFrameImage, 0, 0, $transparentBackgroundColor);
                imagecolortransparent($animationFrameImage, $transparentBackgroundColor);
                imagealphablending($animationFrameImage, true);
                imagesavealpha($animationFrameImage, true);

                imagecopyresampled(
                    $animationFrameImage,
                    $image,
                    0,
                    0,
                    $frame * $frameWidth,
                    0,
                    $frameWidth,
                    $height,
                    $frameWidth,
                    $height
                );

                $animationFrameImages[] = $animationFrameImage;
                $animationFrameDurations[] = $animationFrameDurationInSeconds * 1000;
            }

            $apngCreatore = new ApngCreator();
            foreach ($animationFrameImages as $i => $animationFrameImage) {
                $apngCreatore->add_image($animationFrameImage, "MIDDLE_CENTER", $animationFrameDurations[$i]);
            }
            $apngBinary = $apngCreatore->getAPNG();
            $gitImagesZipArchive->addFromString('item_apngs/' . $itemId . '.png', $apngBinary);
            $gitImagesZipArchive->setCompressionName('item_apngs/' . $itemId . '.png', ZipArchive::CM_STORE);
            if ($this->printProgress) {
                echo 'Generated ' . $itemId . ', frames: ' . $framesCount . PHP_EOL;
            }
        }
        echo 'Saving PNG images to ' . $saveToPath . '... ';
        $gitImagesZipArchive->close();
        echo 'SAVED' . PHP_EOL;
    }
}

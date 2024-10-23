<?php

include_once(__DIR__ . '/apngCreator.php');

abstract class AbstractPngConverterAnimation
{
    protected static $transparentBackgroundColor = [255, 255, 255, 127];
    /**
     * @var string
     */
    protected $inputPath;
    /**
     * @var bool
     */
    protected $printProgress;
    /**
     * @var bool
     */
    private $loadFolder;

    /**
     * @param string $inputPath
     */
    public function __construct($inputPath, $printProgress = true, $loadFolder = false)
    {
        $this->inputPath = $inputPath;
        $this->printProgress = $printProgress;
        $this->loadFolder = $loadFolder;
    }

    /**
     * @param string $saveToPath
     * @param float $animationFrameDurationInSeconds
     * @throws Exception
     */
    public abstract function convert($saveToPath, $animationFrameDurationInSeconds = 0.2);

    protected function getInputFiles()
    {
        if ($this->loadFolder) {
            foreach ($this->getFilesFromFolder() as $fileName => $fileContents) {
                yield $fileName => $fileContents;
            }
        } else {
            foreach ($this->getFilesFromZip() as $fileName => $fileContents) {
                yield $fileName => $fileContents;
            }
        }
    }

    protected function getFilesFromZip()
    {
        $zip = new ZipArchive();
        if ($zip->open($this->inputPath) === true) {
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

    protected function getFilesFromFolder()
    {
        $recursiveDirectoryIterator = new RecursiveDirectoryIterator($this->inputPath);
        $recursiveIterator = new RecursiveIteratorIterator($recursiveDirectoryIterator);

        foreach ($recursiveIterator as $file) {
            if (is_file($file)) {
                yield $file->getPathname() => file_get_contents($file);
            }
        }
    }
}

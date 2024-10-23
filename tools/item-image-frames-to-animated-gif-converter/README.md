## PNG to APNG/GIF converter

In this folder are PHP files to generate animated item images from item images exported by `itemImageFramesGenerator.html`.

Put `items.zip` in this folder and run with the command line:
```
php cli_convert.php APNG items.zip
```

.zip unpacking in PHP is very slow on Windows (9616 sec for 50k images).
It's up to 200 times faster (43 sec) - with SSD disk -,
if you unpack `items.zip` first and then execute command with unpacked folder name as parameter ex.:
```
php cli_convert.php APNG items
```

In `index.php` is version for hosting online PNG to GIF converter.

Official host is:
https://item-images.ots.me/png-to-gif-converter/

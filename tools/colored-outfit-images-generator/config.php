<?php

$outfitImagesPath = './outfits_anim/';
// resize all outfits to 64x64 pixels, place smaller outfits in bottom-right corner
$resizeAllOutfitsTo64px = false;

// animation speeds: number of animation frames => time in 0.01 of second
$walkSpeeds = [
    1 => 50,
    2 => 35,
    3 => 30,
    4 => 15,
    5 => 15,
    6 => 15,
    7 => 15,
    8 => 10,
    9 => 8
];

/*
some server configurations may print warnings from graphics library
these warnings are interpreted as part of image and make image unreadable for web browsers
if you get black/empty image, you can try to uncomment line below to disable all warnings
*/
// error_reporting(0);
<?php
/**
 * @author Kamil Karkus <kaker@wp.eu>
 * @author Gesior.pl <phoowned@wp.pl>
 * @copyright Copyright (c) 2012, Kamil Karkus
 * @version 2
 */

class Outfitter {
	protected static $instance = null;
	protected static $outfitColors = array(
		0xFFFFFF, 0xFFD4BF, 0xFFE9BF, 0xFFFFBF, 0xE9FFBF, 0xD4FFBF,
		0xBFFFBF, 0xBFFFD4, 0xBFFFE9, 0xBFFFFF, 0xBFE9FF, 0xBFD4FF,
		0xBFBFFF, 0xD4BFFF, 0xE9BFFF, 0xFFBFFF, 0xFFBFE9, 0xFFBFD4,
		0xFFBFBF, 0xDADADA, 0xBF9F8F, 0xBFAF8F, 0xBFBF8F, 0xAFBF8F,
		0x9FBF8F, 0x8FBF8F, 0x8FBF9F, 0x8FBFAF, 0x8FBFBF, 0x8FAFBF,
		0x8F9FBF, 0x8F8FBF, 0x9F8FBF, 0xAF8FBF, 0xBF8FBF, 0xBF8FAF,
		0xBF8F9F, 0xBF8F8F, 0xB6B6B6, 0xBF7F5F, 0xBFAF8F, 0xBFBF5F,
		0x9FBF5F, 0x7FBF5F, 0x5FBF5F, 0x5FBF7F, 0x5FBF9F, 0x5FBFBF,
		0x5F9FBF, 0x5F7FBF, 0x5F5FBF, 0x7F5FBF, 0x9F5FBF, 0xBF5FBF,
		0xBF5F9F, 0xBF5F7F, 0xBF5F5F, 0x919191, 0xBF6A3F, 0xBF943F,
		0xBFBF3F, 0x94BF3F, 0x6ABF3F, 0x3FBF3F, 0x3FBF6A, 0x3FBF94,
		0x3FBFBF, 0x3F94BF, 0x3F6ABF, 0x3F3FBF, 0x6A3FBF, 0x943FBF,
		0xBF3FBF, 0xBF3F94, 0xBF3F6A, 0xBF3F3F, 0x6D6D6D, 0xFF5500,
		0xFFAA00, 0xFFFF00, 0xAAFF00, 0x54FF00, 0x00FF00, 0x00FF54,
		0x00FFAA, 0x00FFFF, 0x00A9FF, 0x0055FF, 0x0000FF, 0x5500FF,
		0xA900FF, 0xFE00FF, 0xFF00AA, 0xFF0055, 0xFF0000, 0x484848,
		0xBF3F00, 0xBF7F00, 0xBFBF00, 0x7FBF00, 0x3FBF00, 0x00BF00,
		0x00BF3F, 0x00BF7F, 0x00BFBF, 0x007FBF, 0x003FBF, 0x0000BF,
		0x3F00BF, 0x7F00BF, 0xBF00BF, 0xBF007F, 0xBF003F, 0xBF0000,
		0x242424, 0x7F2A00, 0x7F5500, 0x7F7F00, 0x557F00, 0x2A7F00,
		0x007F00, 0x007F2A, 0x007F55, 0x007F7F, 0x00547F, 0x002A7F,
		0x00007F, 0x2A007F, 0x54007F, 0x7F007F, 0x7F0055, 0x7F002A,
		0x7F0000,
	);
	public static $mountsTFS = [1 => 368, 2 => 369, 3 => 370, 4 => 371, 5 => 372, 6 => 373, 7 => 374, 8 => 375, 9 => 376, 10 => 377, 11 => 378, 12 => 379, 13 => 387, 14 => 388, 15 => 389, 16 => 390, 17 => 392, 18 => 401, 19 => 402, 20 => 405, 21 => 406, 22 => 421, 23 => 426, 24 => 427, 25 => 437, 26 => 438, 27 => 447, 28 => 450, 29 => 502, 30 => 503, 31 => 506, 32 => 515, 33 => 521, 34 => 522, 35 => 526, 36 => 546, 37 => 547, 38 => 548, 39 => 559, 40 => 571, 41 => 572, 42 => 580, 43 => 606, 44 => 621, 45 => 622, 46 => 624, 47 => 626, 48 => 627, 49 => 628, 50 => 629, 51 => 630, 52 => 631, 53 => 644, 54 => 647, 55 => 648, 56 => 649, 57 => 650, 58 => 651, 59 => 669, 60 => 670, 61 => 671, 62 => 672, 63 => 673, 64 => 674, 65 => 682, 66 => 685, 67 => 686, 68 => 687, 69 => 688, 70 => 689, 71 => 690, 72 => 691, 73 => 692, 74 => 693, 75 => 726, 76 => 727, 77 => 728, 78 => 734, 79 => 735, 80 => 736, 81 => 738, 82 => 739, 83 => 740, 84 => 761, 85 => 762, 86 => 763, 87 => 848, 88 => 849, 89 => 850, 90 => 851, 91 => 868, 92 => 869, 93 => 870, 94 => 883, 95 => 886, 96 => 887, 97 => 888, 98 => 889, 99 => 890, 100 => 901, 101 => 902, 102 => 903];

	public static $data = [];
	private static $transparentBackgroundColor = array(255, 255, 255);
	public static $outfitPath;

	public static function instance() {
		if (!isset(self::$instance))
			self::$instance = new self();
		return self::$instance;
	}

	public static function loadData($outfitId, $isMount = false)
	{
		if($isMount)
		{
			$mount = $outfitId;
			if($mount == 0 || $mount >= 65535)
			{
				// old mount system
                $outfitId = ($mount & 0xFFFF);
				$mountState = (($mount & 0xFFFF0000) != 0) ? 2 : 1;
			}
			elseif($mount < 300)
			{
				// tfs 1.x mount system
                $outfitId = self::$mountsTFS[$mount];
				$mountState = 2;
			}
			else
			{
				$mountState = 2;
			}
		}
		if(file_exists(self::$outfitPath . $outfitId . '/outfit.data.txt'))
		{
			if($isMount)
			{
				$tmp = unserialize(file_get_contents(self::$outfitPath . $outfitId . '/outfit.data.txt'));
				self::$data['files'] = array_merge(self::$data['files'], $tmp['files']);
				self::$data['mountFramesNumber'] = $tmp['framesNumber'];
			}
			else
			{
				self::$data = unserialize(file_get_contents(self::$outfitPath . $outfitId . '/outfit.data.txt'));
				self::$data['mountFramesNumber'] = 1;
			}
			return true;
		}
		return false;
	}

	public static function getOutfitFramesNumber()
	{
		return self::$data['framesNumber'];
	}

	public static function file_exists($filePath)
	{
		return in_array(trim(trim(str_replace('\\', '/', $filePath), '.'), '/'), self::$data['files']);
	}

	public function outfit($outfit, $addons, $head, $body, $legs, $feet, $mount, $direction = 3, $animation = 1) {
		if($mount == 0 || $mount >= 65535)
		{
			// old mount system
			$mountId = ($mount & 0xFFFF);
			$mountState = (($mount & 0xFFFF0000) != 0) ? 2 : 1;
		}
		elseif($mount < 300)
		{
			// tfs 1.x mount system
			$mountId = self::$mountsTFS[$mount];
			$mountState = 2;
		}
		else
		{
			$mountId = $mount;
			$mountState = 2;
		}

		$image_outfit = imagecreatefrompng(self::$outfitPath . $outfit . '/'.$animation.'_' . $mountState . '_1_'.$direction.'.png');
		if (file_exists(self::$outfitPath . $outfit . '/'.$animation.'_' . $mountState . '_1_'.$direction.'_template.png')) {
			$image_template = imagecreatefrompng(self::$outfitPath . $outfit . '/'.$animation.'_' . $mountState . '_1_'.$direction.'_template.png');
		} else {
			$image_template = imagecreatetruecolor(imagesx($image_outfit), imagesy($image_outfit));
			$bgcolor = imagecolorallocate($image_template, self::$transparentBackgroundColor[0], self::$transparentBackgroundColor[1], self::$transparentBackgroundColor[2]);
			imagecolortransparent($image_template, $bgcolor);

			imagealphablending($image_template, false);
			imagesavealpha($image_template, true);
		}

		if ($addons == 1 || $addons == 3) {
			$image_first = imagecreatefrompng(self::$outfitPath . $outfit . '/'.$animation.'_' . $mountState . '_2_'.$direction.'.png');
			$this->alphaOverlay($image_outfit, $image_first, 64, 64);
			imagedestroy($image_first);
			if (self::file_exists(self::$outfitPath . $outfit . '/'.$animation.'_' . $mountState . '_2_'.$direction.'_template.png'))
			{
				$image_first_template = imagecreatefrompng(self::$outfitPath . $outfit . '/'.$animation.'_' . $mountState . '_2_'.$direction.'_template.png');
				$this->alphaOverlay($image_template, $image_first_template, 64, 64);
				imagedestroy($image_first_template);
			}
		}
		if ($addons == 2 || $addons == 3) {
			$image_second = imagecreatefrompng(self::$outfitPath . $outfit . '/'.$animation.'_' . $mountState . '_3_'.$direction.'.png');
			$this->alphaOverlay($image_outfit, $image_second, 64, 64);
			imagedestroy($image_second);
			if (self::file_exists(self::$outfitPath . $outfit . '/'.$animation.'_' . $mountState . '_3_'.$direction.'_template.png'))
			{
				$image_second_template = imagecreatefrompng(self::$outfitPath . $outfit . '/'.$animation.'_' . $mountState . '_3_'.$direction.'_template.png');
				$this->alphaOverlay($image_template, $image_second_template, 64, 64);
				imagedestroy($image_second_template);
			}
		}

		$this->colorize($image_template, $image_outfit, $head, $body, $legs, $feet);
		$mountAnimationFrame = max(1,(self::$data['mountFramesNumber'] % $animation));

		if ($mountState == 2 && self::file_exists(self::$outfitPath . $mountId . '/'.$mountAnimationFrame.'_1_1_'.$direction.'.png')) {
			$mount = imagecreatefrompng(self::$outfitPath . $mountId . '/'.$mountAnimationFrame.'_1_1_'.$direction.'.png');
			$this->alphaOverlay($mount, $image_outfit, 64, 64);
			imagedestroy($image_outfit);
			$image_outfit = $mount;
		}
		
		$width = imagesx($image_outfit);
		$height = imagesy($image_outfit);
		$image_outfitT = imagecreatetruecolor($width, $height);
		imagefill($image_outfitT, 0, 0, $bgcolor = imagecolorallocate($image_outfitT, self::$transparentBackgroundColor[0], self::$transparentBackgroundColor[1], self::$transparentBackgroundColor[2]));
		imagecopyresampled($image_outfitT, $image_outfit, 0, 0, 0, 0, $width, $height, $width, $height);
		imagecolortransparent($image_outfitT, $bgcolor);
		
		imagealphablending($image_outfitT, false);
		imagesavealpha($image_outfitT, true);
		imagedestroy($image_outfit);
		if (isset($image_template)) {
			imagedestroy($image_template);
		}
		return $image_outfitT;
	}

	protected function colorizePixel($_color, &$_r, &$_g, &$_b) {
		if ($_color < count(self::$outfitColors))
			$value = self::$outfitColors[$_color];
		else
			$value = 0;
		$ro = ($value & 0xFF0000) >> 16; // rgb outfit
		$go = ($value & 0xFF00) >> 8;
		$bo = ($value & 0xFF);
		$_r = (int) ($_r * ($ro / 255));
		$_g = (int) ($_g * ($go / 255));
		$_b = (int) ($_b * ($bo / 255));
	}

	protected function colorize(&$_image_template, &$_image_outfit, $_head, $_body, $_legs, $_feet) {
		for ($i = 0; $i < imagesy($_image_template); $i++) {
			for ($j = 0; $j < imagesx($_image_template); $j++) {
				$templatepixel = imagecolorat($_image_template, $j, $i);
				$outfit = imagecolorat($_image_outfit, $j, $i);

				if ($templatepixel == $outfit)
					continue;

				$rt = ($templatepixel >> 16) & 0xFF;
				$gt = ($templatepixel >> 8) & 0xFF;
				$bt = $templatepixel & 0xFF;
				$ro = ($outfit >> 16) & 0xFF;
				$go = ($outfit >> 8) & 0xFF;
				$bo = $outfit & 0xFF;

				if ($rt && $gt && !$bt) { // yellow == head
					$this->colorizePixel($_head, $ro, $go, $bo);
				} else if ($rt && !$gt && !$bt) { // red == body
					$this->colorizePixel($_body, $ro, $go, $bo);
				} else if (!$rt && $gt && !$bt) { // green == legs
					$this->colorizePixel($_legs, $ro, $go, $bo);
				} else if (!$rt && !$gt && $bt) { // blue == feet
					$this->colorizePixel($_feet, $ro, $go, $bo);
				} else {
					continue; // if nothing changed, skip the change of pixel
				}

				imagesetpixel($_image_outfit, $j, $i, imagecolorallocate($_image_outfit, $ro, $go, $bo));
			}
		}
	}

	protected function alphaOverlay(&$destImg, &$overlayImg, $imgW, $imgH) {
		for ($y = 0; $y < $imgH; $y++) {
			for ($x = 0; $x < $imgW; $x++) {
				$ovrARGB = imagecolorat($overlayImg, $x, $y);
				$ovrA = ($ovrARGB >> 24) << 1;
				$ovrR = $ovrARGB >> 16 & 0xFF;
				$ovrG = $ovrARGB >> 8 & 0xFF;
				$ovrB = $ovrARGB & 0xFF;

				$change = false;
				if ($ovrA == 0) {
					$dstR = $ovrR;
					$dstG = $ovrG;
					$dstB = $ovrB;
					$change = true;
				} elseif ($ovrA < 254) {
					$dstARGB = imagecolorat($destImg, $x, $y);
					$dstR = $dstARGB >> 16 & 0xFF;
					$dstG = $dstARGB >> 8 & 0xFF;
					$dstB = $dstARGB & 0xFF;

					$dstR = (($ovrR * (0xFF - $ovrA)) >> 8) + (($dstR * $ovrA) >> 8);
					$dstG = (($ovrG * (0xFF - $ovrA)) >> 8) + (($dstG * $ovrA) >> 8);
					$dstB = (($ovrB * (0xFF - $ovrA)) >> 8) + (($dstB * $ovrA) >> 8);
					$change = true;
				}
				if ($change) {
					$dstRGB = imagecolorallocatealpha($destImg, $dstR, $dstG, $dstB, 0);
					imagesetpixel($destImg, $x, $y, $dstRGB);
				}
			}
		}
		return $destImg;
	}
}
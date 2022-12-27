<?php
/*
Animated PNG Creator
Version: 1.6.2
Licence: GNU Lesser General Public License
http://www.gnu.org/licenses/lgpl.html

Feedback, bug report, feature request: apng@zoznam.sk
*/

class ApngCreator {
    /*
    The array containing the animation frames and it's properties.
    Data structure:
    $images[i] : array(
        IMAGE => a GD resource of an image,
        DELAY => the delay fraction before displaying the frame (in seconds) : array(
            [0] => numerator,
            [1] => denominator
        ),
        DISPOSE => specifies how the output buffer should be changed at the end of the delay (before rendering the next frame)
        BLEND => specifies whether the frame is to be alpha blended into the current output buffer content, or whether it should completely replace its region in the output buffer
    )
    */
    protected $gd_data = null;
    protected $images = array();
    // Contains the width and the height of the image, respectively the biggest dimensions in the animation.
    protected $image_data = array();
    public $save_alpha = true;
    public $save_time = false;
    // Defines the play count for the animation. Value 0 (zero) means infinite playing.
    public $play_count = 0;

    public $background_color = array(255, 255, 255, 127);
    public $transparent_color = false;

    // The PNG signature
    const SIGNATURE = "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A";
    // Format strings for the pack() and unpack() functions representing some APNG chunk datas.
    // To understant this formats please read the APNG specification.
    const IHDR_data = "NNCCCCC";
    const acTL_data = "NN";
    const fcTL_data = "NNNNNnncc";
    const tIME = "nccccc";

    // The version of the class.
    const VERSION = "1.6.2";

    function APNG_Creator() {
        $this->gd_data = gd_info();
    }

    /*
    Returns IDAT chunk's data fields.
    */
    protected function get_png_idat_data($img) {
        ob_start();
        imagepng($img, null);
        $data = ob_get_contents();
        $idat_data = "";
        $chunk_data = "";
        $idat_offset = 0;
        ob_end_clean();
        // There can be more IDAT chunks!!!
        do {
            $idat_offset = strpos($data, "IDAT", $idat_offset);
            if ($idat_offset === false) return $idat_data;
            $chunk_data = substr($data, $idat_offset - 4);
            $chunk = unpack("Nlength", $chunk_data);
            $chunk_data = substr($chunk_data, 8, $chunk['length']);
            $idat_data .= $chunk_data;
            $idat_offset += 4;
        } while ($idat_offset !== false);
        return $idat_data;
    }

    /*
    $name : the name of the chunk (for example IDAT, fdAT, tEXt, ...)
    $data : the data fields of the chunk
    Returns a complete chunk, in the standard format:
    Length (4 bytes) - Name (4 bytes) - Data (length bytes) - CRC (4 bytes)
    */
    protected function complete_chunk($name, $data) {
        $name_data = $name . $data;
        return (pack("N", strlen($data)) . $name_data . pack("N", crc32($name_data)));
    }

    /*
    Calculates the x and y offsets of a frame regarding to the buffer (see documentation).
    The values are returned in an array.
    */
    protected function calculate_position($image, $position = "MIDDLE_CENTER") {
        $x = imagesx($image);
        $y = imagesy($image);
        if (!(is_array($position))) {
            switch ($position) {
                case "TOP_LEFT":
                    $position = array(0, 0);
                    break;
                case "TOP_CENTER":
                    $position = array(($this->image_data['WIDTH'] - $x) / 2, 0);
                    break;
                case "TOP_RIGHT":
                    $position = array($this->image_data['WIDTH'] - $x, 0);
                    break;
                case "BOTTOM_LEFT":
                    $position = array(0, $this->image_data['HEIGHT'] - $y);
                    break;
                case "BOTTOM_CENTER":
                    $position = array(($this->image_data['WIDTH'] - $x) / 2, $this->image_data['HEIGHT'] - $y);
                    break;
                case "BOTTOM_RIGHT":
                    $position = array($this->image_data['WIDTH'] - $x, $this->image_data['HEIGHT'] - $y);
                    break;
                case "MIDDLE_LEFT":
                    $position = array(0, ($this->image_data['HEIGHT'] - $y) / 2);
                    break;
                case "MIDDLE_RIGHT":
                    $position = array($this->image_data['WIDTH'] - $x, ($this->image_data['HEIGHT'] - $y) / 2);
                    break;
                case "MIDDLE_CENTER":
                default:
                    $position = array(($this->image_data['WIDTH'] - $x) / 2, ($this->image_data['HEIGHT'] - $y) / 2);
            }
        }
        if ($position[0] + $x > $this->image_data['WIDTH']) $position[0] = $this->image_data['WIDTH'] - $x;
        if ($position[0] < 0) $position[0] = 0;
        if ($position[1] + $y > $this->image_data['HEIGHT']) $position[1] = $this->image_data['HEIGHT'] - $y;
        if ($position[1] < 0) $position[1] = 0;
        $position[0] = intval($position[0]);
        $position[1] = intval($position[1]);
        return $position;
    }

    public function destroy_images() {
        foreach ($this->images as $frame) {
            imagedestroy($frame['IMAGE']);
        }
    }

    public function add_image($img, $position = "MIDDLE_CENTER", $delay = 1000, $dispose_op = 0, $blend_op = 0, $part_of_anim = true) {
        $width = imagesx($img);
        $height = imagesy($img);
        if (!($width > 0 && $height > 0)) return false;
        if (!(is_array($delay))) {
            $delay = array(
                intval($delay),
                1000
            );
        }
        $dispose_options = array("APNG_DISPOSE_OP_NONE", "APNG_DISPOSE_OP_BACKGROUND", "APNG_DISPOSE_OP_PREVIOUS");
        $blend_options = array("APNG_BLEND_OP_SOURCE", "APNG_BLEND_OP_OVER");
        if (is_string($dispose_op)) $dispose_op = array_search($dispose_op, $dispose_options);
        if (is_string($blend_op)) $blend_op = array_search($blend_op, $blend_options);
        $is_default_image = (count($this->images) === 0);
        $this->images[] = array(
            "IMAGE" => $img,
            "DELAY" => $delay,
            "DISPOSE" => intval($dispose_op) % 3,
            "BLEND" => intval($blend_op) % 2,
            "POSITION" => $position,
            "PART_OF_ANIM" => (!($is_default_image && (! $part_of_anim)))
        );
        if (!isset($this->image_data['WIDTH']) || $width > $this->image_data['WIDTH']) $this->image_data['WIDTH'] = $width;
        if (!isset($this->image_data['HEIGHT']) || $height > $this->image_data['HEIGHT']) $this->image_data['HEIGHT'] = $height;
        return true;
    }

    public function getAPNG() {
        $fileContent = '';
        $out = "";
        $out .= self::SIGNATURE;
        // IHDR
        $out .= $this->complete_chunk("IHDR", pack(self::IHDR_data, $this->image_data['WIDTH'], $this->image_data['HEIGHT'], 8, ($this->save_alpha ? 6 : 2), 0, 0, 0));
        // Saving time data
        if ($this->save_time) {
            $out .= $this->complete_chunk("tEXt", "Creation Time" . chr(0) . date("D, d M Y H:i:s O"));
        }
        // tRNS - transparent color
        if ($this->transparent_color && !($this->save_alpha)) {
            $out .= $this->complete_chunk("tRNS", pack("nnn", $this->transparent_color[0], $this->transparent_color[1], $this->transparent_color[2]));
        }
        // acTL
        $out .= $this->complete_chunk("acTL", pack(self::acTL_data, count($this->images), abs(intval($this->play_count))));
        $fileContent .= $out;
        $sequence_number = 0;
        $is_default_image = true;
        foreach ($this->images as $frame) {
            $image = $frame['IMAGE'];
            $x = imagesx($image);
            $y = imagesy($image);
            $position = $this->calculate_position($image, $frame['POSITION']);
            $destroy_image = false;
            $is_tc = imageistruecolor($image);
            /*
            According to the APNG specification the default image can't be positioned via the fcTL
            x_offset and y_offset properties. So the script in case of the default image
            creates a new resized frame, fills it with the specified background (default color is fully
            transparent - if the save_alpha option is set to true) and copyes the frame to it's position.
            */
            $align_needed = ($is_default_image && ($x < $this->image_data['WIDTH'] || $y < $this->image_data['HEIGHT']));
            if ((! $is_tc) || $align_needed) {
                if ($align_needed) {
                    $i2x = $this->image_data['WIDTH'];
                    $i2y = $this->image_data['HEIGHT'];
                    $i2_offsx = ($this->image_data['WIDTH'] - $x) / 2;
                    $i2_offsy = ($this->image_data['HEIGHT'] - $y) / 2;
                    $position = array(0, 0);
                } else {
                    $i2x = $x;
                    $i2y = $y;
                    $i2_offsx = 0;
                    $i2_offsy = 0;
                }
                $image2 = imagecreatetruecolor($i2x, $i2y);
                $bckg = imagecolorallocatealpha($image2, $this->background_color[0], $this->background_color[1], $this->background_color[2], $this->background_color[3]);
                imagefill($image2, 0, 0, $bckg);
                imagecopy($image2, $image, $i2_offsx, $i2_offsy, 0, 0, $x, $y);
                $image = $image2;
                $x = $i2x;
                $y = $i2y;
                $destroy_image = true;
            }
            imagesavealpha($image, !(!($this->save_alpha)));
            $out = "";
            // fcTL
            if ($frame['PART_OF_ANIM']) {
                $out .= $this->complete_chunk("fcTL", pack(self::fcTL_data, $sequence_number, $x, $y, $position[0], $position[1], $frame['DELAY'][0], $frame['DELAY'][1], $frame['DISPOSE'], $frame['BLEND']));
                $sequence_number++;
            }
            // IDAT, fdAT
            if ($is_default_image) {
                $out .= $this->complete_chunk("IDAT", $this->get_png_idat_data($image));
            } else {
                $out .= $this->complete_chunk("fdAT", pack("N", $sequence_number) . $this->get_png_idat_data($image));
                $sequence_number++;
            }
            $fileContent .= $out;
            if ($destroy_image) imagedestroy($image);
            $is_default_image = false;
        }
        $IEND = $this->complete_chunk("IEND", "");
        $fileContent .= $IEND;

        return $fileContent;
    }
}

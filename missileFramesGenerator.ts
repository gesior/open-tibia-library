import {DatManager} from "./modules/datFile/datManager";
import {OtbManager} from "./modules/otbFile/otbManager";
import {SpriteManager} from "./modules/sprFile/spriteManager";
import {ImageGenerator} from "./modules/imageGenerator/imageGenerator";
import {DatThingCategory, GameFeature} from "./modules/constants/const";
import {WebsiteImageGeneratorBase} from "./websiteImageGeneratorBase";

class MissileFramesGenerator extends WebsiteImageGeneratorBase {
    private forceEnableExtendedSpritesCheckbox: HTMLInputElement;
    private enableTransparencyCheckbox: HTMLInputElement;

    init() {
        this.otbRequired = false;
        super.init();
        this.forceEnableExtendedSpritesCheckbox = <HTMLInputElement>document.getElementById('forceEnableExtendedSprites');
        this.enableTransparencyCheckbox = <HTMLInputElement>document.getElementById('enableTransparency');
    }

    afterSetClientVersion() {
        if (this.forceEnableExtendedSpritesCheckbox.checked) {
            this.client.enableFeature(GameFeature.GameSpritesU32);
        }
        if (this.enableTransparencyCheckbox.checked) {
            this.client.enableFeature(GameFeature.GameSpritesAlphaChannel);
        }
    }

    startImageGenerator(imageGenerator: ImageGenerator, otbManager: OtbManager, datManager: DatManager, spriteManager: SpriteManager, zip) {
        this.generateMissileImage(imageGenerator, datManager, zip, 0);
    }

    generateMissileImage(imageGenerator: ImageGenerator, datManager: DatManager, zip, missileId: number) {
        const self = this;
        this.progressValue(missileId, datManager.getCategory(DatThingCategory.ThingCategoryMissile).length);
        if (missileId > datManager.getCategory(DatThingCategory.ThingCategoryMissile).length) {
            this.progressText('Packing images to ZIP file, please wait (it may take a while)');
            zip.generateAsync({type: "blob"}).then(function (blob: Blob) {
                console.log('zip size', blob.size);
                self.progressText('ZIP generated, it should start download now.');
                self.downloadBlob('missiles.zip', blob);
            });
            return;
        }

        let missileThingType = this.datManager.getMissile(missileId);
        if (!missileThingType) {
            console.log('dat ID not found in dat file', missileId);
            setTimeout(function () {
                self.generateMissileImage(imageGenerator, datManager, zip, missileId + 1);
            }, 1);
            return;
        }

        const missileSprites = imageGenerator.generateMissileImagesById(missileId);
        if (!missileSprites || missileSprites.length == 0) {
            setTimeout(function () {
                self.generateMissileImage(imageGenerator, datManager, zip, missileId + 1);
            }, 1);
            return;
        }

        const firstMissileSprite = missileSprites[0];
        const canvas = <HTMLCanvasElement>document.createElement('canvas');
        canvas.width = firstMissileSprite.getWidth() * missileSprites.length;
        canvas.height = firstMissileSprite.getHeight();
        document.getElementsByTagName('body')[0].appendChild(canvas);
        const ctx = canvas.getContext("2d");

        for (let animationFrame = 0; animationFrame < missileSprites.length; animationFrame++) {
            const palette = ctx.getImageData(firstMissileSprite.getWidth() * animationFrame, 0, firstMissileSprite.getWidth(), firstMissileSprite.getHeight());
            const missileSprite = missileSprites[animationFrame];
            palette.data.set(new Uint8ClampedArray(missileSprite.getPixels().m_buffer.buffer));
            ctx.putImageData(palette, firstMissileSprite.getWidth() * animationFrame, 0);
        }

        const callback = function (blob) {
            canvas.remove();
            zip.file('missiles/' + missileId + '_' + missileSprites.length + '.png', blob);
            setTimeout(function () {
                self.generateMissileImage(imageGenerator, datManager, zip, missileId + 1);
            }, 1);

        };
        canvas.toBlob(callback);
    }
}

const missileFramesGenerator = new MissileFramesGenerator();
missileFramesGenerator.init();

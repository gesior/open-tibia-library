import {DatManager} from "./modules/datFile/datManager";
import {OtbManager} from "./modules/otbFile/otbManager";
import {SpriteManager} from "./modules/sprFile/spriteManager";
import {ImageGenerator} from "./modules/imageGenerator/imageGenerator";
import {DatThingCategory, GameFeature} from "./modules/constants/const";
import {WebsiteImageGeneratorBase} from "./websiteImageGeneratorBase";

class EffectFramesGenerator extends WebsiteImageGeneratorBase {
    private forceEnableExtendedSpritesCheckbox: HTMLInputElement;

    init() {
        this.otbRequired = false;
        super.init();
        this.forceEnableExtendedSpritesCheckbox = <HTMLInputElement>document.getElementById('forceEnableExtendedSprites');
    }

    afterSetClientVersion() {
        if (this.forceEnableExtendedSpritesCheckbox.checked) {
            this.client.enableFeature(GameFeature.GameSpritesU32);
        }
    }

    startImageGenerator(imageGenerator: ImageGenerator, otbManager: OtbManager, datManager: DatManager, spriteManager: SpriteManager, zip) {
        this.generateEffectImage(imageGenerator, datManager, zip, 0);
    }

    generateEffectImage(imageGenerator: ImageGenerator, datManager: DatManager, zip, effectId: number) {
        const self = this;
        this.progressValue(effectId, datManager.getCategory(DatThingCategory.ThingCategoryEffect).length);
        if (effectId > datManager.getCategory(DatThingCategory.ThingCategoryEffect).length) {
            this.progressText('Packing images to ZIP file, please wait (it may take a while)');
            zip.generateAsync({type: "blob"}).then(function (blob: Blob) {
                console.log('zip size', blob.size);
                self.progressText('ZIP generated, it should start download now.');
                self.downloadBlob('effects.zip', blob);
            });
            return;
        }

        let effectThingType = this.datManager.getEffect(effectId);
        if (!effectThingType) {
            console.log('dat ID not found in dat file', effectId);
            setTimeout(function () {
                self.generateEffectImage(imageGenerator, datManager, zip, effectId + 1);
            }, 1);
            return;
        }

        const effectSprites = imageGenerator.generateEffectImagesById(effectId);
        if (!effectSprites || effectSprites.length == 0) {
            setTimeout(function () {
                self.generateEffectImage(imageGenerator, datManager, zip, effectId + 1);
            }, 1);
            return;
        }

        const firstEffectSprite = effectSprites[0];
        const canvas = <HTMLCanvasElement>document.createElement('canvas');
        canvas.width = firstEffectSprite.getWidth() * effectSprites.length;
        canvas.height = firstEffectSprite.getHeight();
        document.getElementsByTagName('body')[0].appendChild(canvas);
        const ctx = canvas.getContext("2d");

        for (let animationFrame = 0; animationFrame < effectSprites.length; animationFrame++) {
            const palette = ctx.getImageData(firstEffectSprite.getWidth() * animationFrame, 0, firstEffectSprite.getWidth(), firstEffectSprite.getHeight());
            const effectSprite = effectSprites[animationFrame];
            palette.data.set(new Uint8ClampedArray(effectSprite.getPixels().m_buffer.buffer));
            ctx.putImageData(palette, firstEffectSprite.getWidth() * animationFrame, 0);
        }

        const callback = function (blob) {
            canvas.remove();
            zip.file('effects/' + effectId + '_' + effectSprites.length + '.png', blob);
            setTimeout(function () {
                self.generateEffectImage(imageGenerator, datManager, zip, effectId + 1);
            }, 1);

        };
        canvas.toBlob(callback);
    }
}

const effectFramesGenerator = new EffectFramesGenerator();
effectFramesGenerator.init();

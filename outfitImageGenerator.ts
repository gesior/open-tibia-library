import {DatManager} from "./modules/datFile/datManager";
import {OtbManager} from "./modules/otbFile/otbManager";
import {SpriteManager} from "./modules/sprFile/spriteManager";
import {ImageGenerator} from "./modules/imageGenerator/imageGenerator";
import {DatThingCategory, FrameGroupType, GameFeature} from "./modules/constants/const";
import {WebsiteImageGeneratorBase} from "./websiteImageGeneratorBase";
import {OutfitImagePhpGeneratorCode} from "./outfitImagePhpGeneratorCode";

class OutfitImageGenerator extends WebsiteImageGeneratorBase {
    private idleAnimationCheckbox: HTMLInputElement;
    private forceEnableExtendedSpritesCheckbox: HTMLInputElement;
    private enableTransparencyCheckbox: HTMLInputElement;

    private idleAnimation = true;

    init() {
        this.otbRequired = false;
        super.init();
        this.idleAnimationCheckbox = <HTMLInputElement>document.getElementById('idleAnimation');
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
        this.idleAnimation = this.idleAnimationCheckbox.checked;
        this.generateOutfitImage(imageGenerator, otbManager, datManager, zip, 0);
    }

    generateOutfitImage(imageGenerator: ImageGenerator, otbManager: OtbManager, datManager: DatManager, zip, outfitId: number) {
        const self = this;
        this.progressValue(outfitId, datManager.getCategory(DatThingCategory.ThingCategoryCreature).length);
        if (outfitId > datManager.getCategory(DatThingCategory.ThingCategoryCreature).length) {
            this.progressText('Packing images to ZIP file, please wait (it may take a while)');

            const outfitImagePhpGeneratorCode = new OutfitImagePhpGeneratorCode();
            outfitImagePhpGeneratorCode.addFilesToZip(zip);

            zip.generateAsync({type: "blob"}).then(function (blob: Blob) {
                console.log('zip size', blob.size);
                self.progressText('ZIP generated, it should start download now.');
                self.downloadBlob('outfits.zip', blob);
            });
            return;
        }

        let outfitSprites;
        if (this.idleAnimation) {
            outfitSprites = imageGenerator.generateOutfitAnimationImages(outfitId, FrameGroupType.FrameGroupIdle);
        }
        if (!outfitSprites || outfitSprites.length == 0) {
            outfitSprites = imageGenerator.generateOutfitAnimationImages(outfitId, FrameGroupType.FrameGroupMoving);
        }
        if (!outfitSprites || outfitSprites.length == 0) {
            setTimeout(function () {
                self.generateOutfitImage(imageGenerator, otbManager, datManager, zip, outfitId + 1);
            }, 1);
            return;
        }

        let spritesToProcess = outfitSprites.length;
        for (let outfitSprite of outfitSprites) {
            const canvas = <HTMLCanvasElement>document.createElement('canvas');
            canvas.width = outfitSprite.sprite.getWidth();
            canvas.height = outfitSprite.sprite.getHeight();
            document.getElementsByTagName('body')[0].appendChild(canvas);
            const ctx = canvas.getContext("2d");
            const palette = ctx.getImageData(0, 0, outfitSprite.sprite.getWidth(), outfitSprite.sprite.getHeight());
            palette.data.set(new Uint8ClampedArray(outfitSprite.sprite.getPixels().m_buffer.buffer));
            ctx.putImageData(palette, 0, 0);
            if (self.imageFormat == 'png') {
                const callback = function (blob) {
                    canvas.remove();
                    zip.file(outfitSprite.file + '.png', blob);
                    spritesToProcess--;
                    if (spritesToProcess == 0) {
                        setTimeout(function () {
                            self.generateOutfitImage(imageGenerator, otbManager, datManager, zip, outfitId + 1);
                        }, 1);
                    }
                };
                canvas.toBlob(callback);
            }
        }

    }
}

const outfitImageGenerator = new OutfitImageGenerator();
outfitImageGenerator.init();

import {DatManager} from "./modules/datFile/datManager";
import {OtbManager} from "./modules/otbFile/otbManager";
import {SpriteManager} from "./modules/sprFile/spriteManager";
import {ImageGenerator} from "./modules/imageGenerator/imageGenerator";
import {GameFeature} from "./modules/constants/const";
import {WebsiteImageGeneratorBase} from "./websiteImageGeneratorBase";

class ItemImageGenerator extends WebsiteImageGeneratorBase {
    private onlyPickupableCheckbox: HTMLInputElement;
    private forceEnableExtendedSpritesCheckbox: HTMLInputElement;

    private onlyPickupable = true;

    init() {
        super.init();
        this.onlyPickupableCheckbox = <HTMLInputElement>document.getElementById('onlyPickupable');
        this.forceEnableExtendedSpritesCheckbox = <HTMLInputElement>document.getElementById('forceEnableExtendedSprites');
    }

    afterSetClientVersion() {
        if (this.forceEnableExtendedSpritesCheckbox.checked) {
            this.client.enableFeature(GameFeature.GameSpritesU32);
        }
    }

    startImageGenerator(imageGenerator: ImageGenerator, otbManager: OtbManager, datManager: DatManager, spriteManager: SpriteManager, zip) {
        this.onlyPickupable = this.onlyPickupableCheckbox.checked;
        this.generateItemImage(imageGenerator, zip, 0);
    }

    generateItemImage(imageGenerator: ImageGenerator, zip, serverId: number) {
        const self = this;
        this.progressValue(serverId, this.otbManager.getLastId());
        if (serverId > this.otbManager.getLastId()) {
            this.progressText('Packing images to ZIP file, please wait (it may take a while)');
            zip.generateAsync({type: "blob"}).then(function (blob: Blob) {
                console.log('zip size', blob.size);
                self.progressText('ZIP generated, it should start download now.');
                self.downloadBlob('items.zip', blob);
            });
            return;
        }

        if (!this.otbManager.isValidOtbId(serverId)) {
            setTimeout(function () {
                self.generateItemImage(imageGenerator, zip, serverId + 1);
            }, 1);
            return;
        }

        const clientItemId = this.otbManager.getItem(serverId).getClientId();
        if (!clientItemId) {
            console.log('otb ID not mapped to any dat ID', serverId);
            setTimeout(function () {
                self.generateItemImage(imageGenerator, zip, serverId + 1);
            }, 1);
            return;
        }
        let itemThingType = this.datManager.getItem(clientItemId);
        if (!itemThingType) {
            console.log('dat ID not found in dat file', serverId, clientItemId);
            setTimeout(function () {
                self.generateItemImage(imageGenerator, zip, serverId + 1);
            }, 1);
            return;
        }
        if (this.onlyPickupable && !itemThingType.isPickupable()) {
            console.log('skip not pickupable', serverId);
            setTimeout(function () {
                self.generateItemImage(imageGenerator, zip, serverId + 1);
            }, 1);
            return;
        }

        const itemSprites = imageGenerator.generateItemImagesByServerId(serverId);
        if (!itemSprites || itemSprites.length == 0) {
            setTimeout(function () {
                self.generateItemImage(imageGenerator, zip, serverId + 1);
            }, 1);
            return;
        }

        const firstItemSprite = itemSprites[0];
        const canvas = <HTMLCanvasElement>document.createElement('canvas');
        canvas.width = firstItemSprite.getWidth() * itemSprites.length;
        canvas.height = firstItemSprite.getHeight();
        document.getElementsByTagName('body')[0].appendChild(canvas);
        const ctx = canvas.getContext("2d");

        for (let animationFrame = 0; animationFrame < itemSprites.length; animationFrame++) {
            const palette = ctx.getImageData(firstItemSprite.getWidth() * animationFrame, 0, firstItemSprite.getWidth(), firstItemSprite.getHeight());
            const itemSprite = itemSprites[animationFrame];
            palette.data.set(new Uint8ClampedArray(itemSprite.getPixels().m_buffer.buffer));
            ctx.putImageData(palette, firstItemSprite.getWidth() * animationFrame, 0);
        }

        const callback = function (blob) {
            canvas.remove();
            zip.file('items/' + serverId + '_' + itemSprites.length + '.png', blob);
            setTimeout(function () {
                self.generateItemImage(imageGenerator, zip, serverId + 1);
            }, 1);

        };
        canvas.toBlob(callback);
    }
}

const itemImageGenerator = new ItemImageGenerator();
itemImageGenerator.init();

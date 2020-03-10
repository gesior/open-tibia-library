import {Client} from "./modules/client";
import {DatManager} from "./modules/datFile/datManager";
import {OtbManager} from "./modules/otbFile/otbManager";
import {SpriteManager} from "./modules/sprFile/spriteManager";
import {InputFile} from "./modules/fileHandlers/inputFile";
import {ImageGenerator} from "./modules/imageGenerator/imageGenerator";

declare var JSZip, GIF;

class ItemImageGenerator {
    private clientVersionInput: HTMLInputElement;
    private sprPicker: HTMLInputElement;
    private datPicker: HTMLInputElement;
    private otbPicker: HTMLInputElement;
    private loadFilesButton: HTMLButtonElement;
    private generateImagesButton: HTMLButtonElement;

    private imageFormat = 'png';

    private client: Client;
    private spriteManager: SpriteManager;
    private datManager: DatManager;
    private otbManager: OtbManager;

    init() {
        this.clientVersionInput = <HTMLInputElement>document.getElementById('clientversion');
        this.sprPicker = <HTMLInputElement>document.getElementById('spr');
        this.datPicker = <HTMLInputElement>document.getElementById('dat');
        this.otbPicker = <HTMLInputElement>document.getElementById('otb');
        this.loadFilesButton = <HTMLButtonElement>document.getElementById('loadFiles');
        this.generateImagesButton = <HTMLButtonElement>document.getElementById('generateImages');

        const self = this;
        this.loadFilesButton.onclick = function () {
            self.loadFiles();
        };
        this.generateImagesButton.onclick = function () {
            if (!self.spriteManager || !self.datManager || !self.otbManager) {
                self.progressText('Cannot generate images. First ');
                return;
            }
            const imageGenerator = new ImageGenerator(self.datManager, self.spriteManager, self.otbManager);
            const zip = new JSZip();
            self.generateItemImage(imageGenerator, self.otbManager, self.datManager, zip, 0);
        };
    }

    loadFiles() {
        let clientVersion = parseInt(this.clientVersionInput.value);
        this.progressText('Loading client version ' + clientVersion);
        this.client = new Client();
        this.client.setClientVersion(clientVersion);
        this.progressText('Loading SPR file');
        const self = this;
        setTimeout(function () {
            self.loadSpr()
        }, 10);
    }

    loadSpr() {
        if (this.sprPicker.files.length > 0) {
            this.spriteManager = new SpriteManager(this.client);
            const file = this.sprPicker.files[0];
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            const self = this;
            reader.onload = function (event: any) {
                const sprLoaded = self.spriteManager.loadSpr(new InputFile(new DataView(event.target.result)));
                if (sprLoaded) {
                    self.progressText('Loading DAT file');
                    setTimeout(function () {
                        self.loadDat()
                    }, 10);
                } else {
                    self.spriteManager = null;
                    self.progressText('ERROR: Failed to load SPR file');
                }
            }
        } else {
            this.progressText('ERROR: Please select SPR file');
        }
    }

    loadDat() {
        if (this.datPicker.files.length > 0) {
            this.datManager = new DatManager(this.client);
            const file = this.datPicker.files[0];
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            const self = this;
            reader.onload = function (event: any) {
                const datLoaded = self.datManager.loadDat(new InputFile(new DataView(event.target.result)));
                if (datLoaded) {
                    self.progressText('Loading OTB file');
                    setTimeout(function () {
                        self.loadOtb()
                    }, 10);
                } else {
                    self.datManager = null;
                    self.progressText('ERROR: Failed to load DAT file');
                }
            }
        } else {
            this.progressText('ERROR: Please select DAT file');
        }
    }

    loadOtb() {
        if (this.otbPicker.files.length > 0) {
            this.otbManager = new OtbManager(this.client);
            const file = this.otbPicker.files[0];
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            const self = this;
            reader.onload = function (event: any) {
                const otbLoaded = self.otbManager.loadOtb(new InputFile(new DataView(event.target.result)));
                if (otbLoaded) {
                    self.progressText('Data loaded. You can click "Generate images" now.');
                } else {
                    self.otbManager = null;
                    self.progressText('ERROR: Failed to load OTB file');
                }
            }
        } else {
            this.progressText('ERROR: Please select OTB file');
        }
    }

    generateItemImage(imageGenerator: ImageGenerator, otbManager: OtbManager, datManager: DatManager, zip, serverId: number) {
        const self = this;
        this.progressValue(serverId, otbManager.getLastId());
        if (serverId > otbManager.getLastId()) {
            this.progressText('Packing images to ZIP file, please wait (it may take a while)');
            zip.generateAsync({type: "blob"}).then(function (blob: Blob) {
                console.log('zip size', blob.size);
                self.progressText('ZIP generated, it should start download now.');
                self.downloadBlob('items.zip', blob);
            });
            return;
        }

        if (!otbManager.isValidOtbId(serverId)) {
            setTimeout(function () {
                self.generateItemImage(imageGenerator, otbManager, datManager, zip, serverId + 1);
            }, 1);
            return;
        }

        const clientItemId = otbManager.getItem(serverId).getClientId();
        if (!clientItemId) {
            console.log('otb ID not mapped to any dat ID', serverId);
            setTimeout(function () {
                self.generateItemImage(imageGenerator, otbManager, datManager, zip, serverId + 1);
            }, 1);
            return;
        }
        let itemThingType = datManager.getItem(clientItemId);
        if (!itemThingType) {
            console.log('dat ID not found in dat file', serverId, clientItemId);
            setTimeout(function () {
                self.generateItemImage(imageGenerator, otbManager, datManager, zip, serverId + 1);
            }, 1);
            return;
        }
        if (!itemThingType.isPickupable()) {
            console.log('skip not pickupable', serverId);
            setTimeout(function () {
                self.generateItemImage(imageGenerator, otbManager, datManager, zip, serverId + 1);
            }, 1);
            return;
        }

        const itemSprite = imageGenerator.generateItemImageByServerId(serverId);
        if (!itemSprite) {
            setTimeout(function () {
                self.generateItemImage(imageGenerator, otbManager, datManager, zip, serverId + 1);
            }, 1);
            return;
        }

        const canvas = <HTMLCanvasElement>document.createElement('canvas');
        canvas.width = itemSprite.getWidth();
        canvas.height = itemSprite.getHeight();
        document.getElementsByTagName('body')[0].appendChild(canvas);
        const ctx = canvas.getContext("2d");
        const palette = ctx.getImageData(0, 0, itemSprite.getWidth(), itemSprite.getHeight());
        palette.data.set(new Uint8ClampedArray(itemSprite.getPixels().m_buffer.buffer));
        ctx.putImageData(palette, 0, 0);

        if (self.imageFormat == 'png') {
            const callback = function (blob) {
                canvas.remove();
                zip.file(serverId + '.png', blob);
                setTimeout(function () {
                    self.generateItemImage(imageGenerator, otbManager, datManager, zip, serverId + 1);
                }, 1);

            };
            canvas.toBlob(callback);
        } else {
            const gif = new GIF({
                workers: 1,
                quality: 10,
                width: itemSprite.getWidth(),
                height: itemSprite.getHeight(),
                workerScript: './node_modules/gif.js/dist/gif.worker.js',
                transparent: 'rgba(0,0,0,0)'
            });

            gif.addFrame(canvas, {copy: true});
            canvas.remove();

            gif.on('finished', function (blob) {
                zip.file(serverId + '.gif', blob);
                setTimeout(function () {
                    self.generateItemImage(imageGenerator, otbManager, datManager, zip, serverId + 1);
                }, 1);

            });

            gif.render();
        }
    }

    downloadBlob(filename: string, blob: Blob) {
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    progressValue(done: number, todo: number) {
        let text = done + '/' + todo;
        this.progressText(text);
    }

    progressText(text: string) {
        document.getElementById('progressBar').innerText = text;
    }
}

const itemImageGenerator = new ItemImageGenerator();
itemImageGenerator.init();
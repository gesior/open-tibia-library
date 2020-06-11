import {Client} from "./modules/client";
import {DatManager} from "./modules/datFile/datManager";
import {OtbManager} from "./modules/otbFile/otbManager";
import {SpriteManager} from "./modules/sprFile/spriteManager";
import {InputFile} from "./modules/fileHandlers/inputFile";
import {ImageGenerator} from "./modules/imageGenerator/imageGenerator";

let JSZip = require('jszip');

export class WebsiteImageGeneratorBase {
    protected clientVersionInput: HTMLInputElement;
    protected sprPicker: HTMLInputElement;
    protected datPicker: HTMLInputElement;
    protected otbPicker: HTMLInputElement;
    protected loadFilesButton: HTMLButtonElement;
    protected generateImagesButton: HTMLButtonElement;

    protected imageFormat = 'png';

    protected client: Client;
    protected spriteManager: SpriteManager;
    protected datManager: DatManager;
    protected otbManager: OtbManager;

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
                self.progressText('Cannot generate images. First .spr, .dat and .otb files must be loaded.');
                return;
            }
            const imageGenerator = new ImageGenerator(self.datManager, self.spriteManager, self.otbManager);
            const zip = new JSZip();
            self.startImageGenerator(imageGenerator, self.otbManager, self.datManager, self.spriteManager, zip);
        };
    }

    afterSetClientVersion() {
    }

    startImageGenerator(imageGenerator: ImageGenerator, otbManager: OtbManager, datManager: DatManager, spriteManager: SpriteManager, zip) {
        throw new Error("Method not implemented.");
    }

    loadFiles() {
        let clientVersion = parseInt(this.clientVersionInput.value);
        this.progressText('Loading client version ' + clientVersion);
        this.client = new Client();
        this.client.setClientVersion(clientVersion);
        this.afterSetClientVersion();
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

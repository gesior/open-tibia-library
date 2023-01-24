import {OtbManager} from "./modules/otbFile/otbManager";
import {InputFile} from "./modules/fileHandlers/inputFile";
import {Client} from "./modules/client";

/**
 * Simple items.otb file editor example. Edit OTB file using TypeScript code!
 * All it does is:
 * - load .otb file
 * - remove items with Client ID (Tibia.dat ID) higher than 5090
 * - save new .otb file
 *
 * All logic is in function 'processOtbFile'
 */

class OtbEditor {
    protected clientVersionInput: HTMLInputElement;
    protected otbPicker: HTMLInputElement;
    protected loadFileButton: HTMLButtonElement;
    protected generateFileButton: HTMLButtonElement;

    protected otbManager: OtbManager;
    protected client: Client;

    init() {
        this.clientVersionInput = <HTMLInputElement>document.getElementById('clientversion');
        this.otbPicker = <HTMLInputElement>document.getElementById('otb');
        this.loadFileButton = <HTMLButtonElement>document.getElementById('loadFile');
        this.generateFileButton = <HTMLButtonElement>document.getElementById('generateFile');
        const self = this;
        this.loadFileButton.onclick = function () {
            self.loadFiles();
        };
        this.generateFileButton.onclick = function () {
            if (!self.otbManager) {
                self.progressText('Cannot generate. Load file first.');
                return;
            }

            self.processOtbFile();

            let otbFile = self.otbManager.saveOtb();
            self.downloadBlob('items.otb', new Blob(new Array(otbFile.getUint8Array())));
        };
    }

    processOtbFile() {
        for (let serverItemId = 0; serverItemId <= this.otbManager.getLastId(); serverItemId++) {
            if (this.otbManager.isValidOtbId(serverItemId)) {
                let item = this.otbManager.getItem(serverItemId)
                if (item.getClientId() > 5090) {
                    console.log('removing item from .otb, server ID', item.getServerId(), 'client ID', item.getClientId());
                    this.otbManager.removeItemType(item)
                }
            }
        }
    }

    loadFiles() {
        let clientVersion = parseInt(this.clientVersionInput.value);
        this.progressText('Loading client version ' + clientVersion);
        this.client = new Client();
        this.client.setClientVersion(clientVersion);
        this.progressText('Loading OTB file');
        const self = this;
        setTimeout(function () {
            self.loadOtb()
        }, 10);
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
                    self.progressText('Data loaded. You can click "Generate processed file" now.');
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

    progressText(text: string) {
        document.getElementById('progressBar').innerText = text;
    }

}

const otbEditor = new OtbEditor();
otbEditor.init();

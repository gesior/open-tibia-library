import {Client} from "./modules/client";
import {DatManager} from "./modules/datFile/datManager";
import {OtbManager} from "./modules/otbFile/otbManager";
import {SpriteManager} from "./modules/sprFile/spriteManager";
import {Sprite} from "./modules/sprFile/sprite";
import {InputFile} from "./modules/fileHandlers/inputFile";
import {ImageGenerator} from "./modules/imageGenerator/imageGenerator";
import {Size} from "./modules/structures/size";
import {Point} from "./modules/structures/point";
import {FrameGroupType} from "./modules/constants/const";

const canvas = <HTMLCanvasElement>document.getElementById('view');
const ctx = canvas.getContext("2d");

function drawImage(sprite: Sprite, x, y) {
    const palette = ctx.getImageData(x, y, sprite.getWidth(), sprite.getHeight());
    palette.data.set(new Uint8ClampedArray(sprite.getPixels().m_buffer.buffer));
    ctx.putImageData(palette, x, y);
}

async function testGenerateAllItemImages() {
    const client = new Client();
    client.setClientVersion(1076);

    const serverUrl = 'http://127.0.0.1/1076/';

    const datManager = new DatManager(client);
    await datManager.loadDatFromUrl(serverUrl + 'Tibia.dat').then(datLoaded => {
        console.log('loaded dat', datLoaded)
    });

    const otbManager = new OtbManager(client);
    await otbManager.loadOtbFromUrl(serverUrl + 'items.otb').then(otbLoaded => {
        console.log('loaded otb', otbLoaded)
    });

    const spriteManager = new SpriteManager(client);
    await spriteManager.loadSprFromUrl(serverUrl + 'Tibia.spr').then(sprLoaded => {
        console.log('loaded spr', sprLoaded)
    });

}
async function testGenerateAllDat() {
    const serverUrl = 'http://127.0.0.1/otsfiles/';

    // for (let clientVersion of [710, 713, 721, 723, 724, 726, 727, 730, 740, 741, 750, 760, 770, 772, 780, 781, 790, 792, 800, 811, 820, 821, 822, 830, 831, 840, 841, 842, 850, 852, 853, 854, 855, 856, 857, 860, 861, 862, 870, 871, 900, 910, 920, 931, 940, 941, 942, 943, 944, 946, 952, 954, 960, 970, 971, 980, 981, 1010, 1020, 1035, 1036, 1037, 1038, 1041, 1050, 1055, 1057, 1059, 1061, 1063, 1064, 1070, 1071, 1073, 1075, 1076, 1077, 1078, 1079, 1080, 1081, 1082, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1099]) {
    for (let clientVersion of [760, 770, 772, 780, 781, 790, 792, 800, 811, 820, 821, 822, 830, 831, 840, 841, 842, 850, 852, 853, 854, 855, 856, 857, 860, 861, 862, 870, 871, 900, 910, 920, 931, 940, 941, 942, 943, 944, 946, 952, 954, 960, 970, 971, 980, 981, 1010, 1020, 1035, 1036, 1037, 1038, 1041, 1050, 1055, 1057, 1059, 1061, 1063, 1064, 1070, 1071, 1073, 1075, 1076, 1077, 1078, 1079, 1080, 1081, 1082, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1099]) {
    // for (let clientVersion of [760, 792, 800, 811, 852, 857, 860, 960, 970, 1055, 1057, 1076, 1077, 1099]) {
        const client = new Client();
        client.setClientVersion(clientVersion);

        console.log('cv:', clientVersion);
        const datManager = new DatManager(client);
        await datManager.loadDatFromUrl(serverUrl + clientVersion + '/Tibia.dat').then(datLoaded => {
            console.log('loaded dat', datLoaded, clientVersion)
        });

        let otbFile = datManager.saveDat();
        let a = document.createElement('a');
        let url = window.URL.createObjectURL(new Blob(new Array(otbFile.getUint8Array())));
        a.href = url;
        a.download = 'Tibia' + clientVersion + '.dat';
        console.log('dw:', a.download, otbFile.tell());
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }
}

async function testLoadFromUrlsAndDrawImage() {
    const client = new Client();
    client.setClientVersion(1076);

    const serverUrl = 'http://127.0.0.1/1076/';

    const datManager = new DatManager(client);
    await datManager.loadDatFromUrl(serverUrl + 'Tibia.dat').then(datLoaded => {
        console.log('loaded dat', datLoaded)
    });

    const otbManager = new OtbManager(client);
    await otbManager.loadOtbFromUrl(serverUrl + 'items.otb').then(otbLoaded => {
        console.log('loaded otb', otbLoaded)
    });

    const spriteManager = new SpriteManager(client);
    await spriteManager.loadSprFromUrl(serverUrl + 'Tibia.spr').then(sprLoaded => {
        console.log('loaded spr', sprLoaded)
    });

    // get client ID of item 2400 (magic sword in items.xml)
    let magicSwordClientId = otbManager.getItem(2400).getClientId();
    // get data from '.dat' about that item
    let magicSwordThingType = datManager.getItem(magicSwordClientId);
    // get first sprite [image] of that item
    let firstMagicSwordSprite = magicSwordThingType.getFrameGroup(FrameGroupType.FrameGroupIdle).getSprite(0);
    // get image from .spr file
    let firstImagePixelsData = spriteManager.getSprite(firstMagicSwordSprite);
    // draw image in webbrowser with Canvas on position 0, 0
    drawImage(firstImagePixelsData, 0, 0);

    const itemid = 2400;
    const imageGenerator = new ImageGenerator(datManager, spriteManager, otbManager);
    const itemSprite = imageGenerator.generateItemImageByServerId(itemid);

    drawImage(itemSprite, 32, 0);
    const sprite = new Sprite(new Size(64, 64));
    sprite.blit(new Point(32, 32), firstImagePixelsData);
    drawImage(sprite, 0, 0);

    // export to global scope for debuging
    window['d'] = {
        client: client,
        datManager: datManager,
        otbManager: otbManager,
        spriteManager: spriteManager
    };


    // let otbFile = otbManager.saveOtb();
    // let a = document.createElement('a');
    // let url = window.URL.createObjectURL(new Blob(new Array(otbFile.getUint8Array())));
    // a.href = url;
    // a.download = 'items.otb';
    // a.click();
    // window.URL.revokeObjectURL(url);
    // a.remove();

    // console.log('Generated dat file', datManager.saveDat());
    // console.log('Generated otb file', otbManager.saveOtb());
    // console.log('Generated spr file', spriteManager.saveSpr());
    console.log('All data loaded. You can access it by variable "d".')
}

async function testFilePicker() {
    const clientVersionInput = <HTMLInputElement>document.getElementById('clientversion');
    const sprPicker = <HTMLInputElement>document.getElementById('spr');
    const datPicker = <HTMLInputElement>document.getElementById('dat');
    const otbPicker = <HTMLInputElement>document.getElementById('otb');
    const itemIdInput = <HTMLInputElement>document.getElementById('itemid');

    let client: Client;
    let sprManager: SpriteManager;
    let datManager: DatManager;
    let otbManager: OtbManager;

    let sprLoaded = false;
    let datLoaded = false;
    let otbLoaded = false;

    function updateItemView(itemid) {
        console.log(sprLoaded, datLoaded, otbLoaded, client, itemid, sprManager, datManager, otbManager);
        if (sprLoaded && datLoaded && otbLoaded) {
            try {
                let magicSwordClientId = otbManager.getItem(itemid).getClientId();
                let magicSwordThingType = datManager.getItem(magicSwordClientId);
                let firstMagicSwordSprite = magicSwordThingType.getFrameGroup(FrameGroupType.FrameGroupIdle).getSprite(0);
                let firstImagePixelsData = sprManager.getSprite(firstMagicSwordSprite);
                drawImage(firstImagePixelsData, 0, 0);

            } catch (e) {
                console.error(e);
            }
        }
    }

    clientVersionInput.onchange = function (event) {
        let clientVersion = parseInt(clientVersionInput.value);
        client = new Client();
        client.setClientVersion(clientVersion);
        sprPicker.onchange(null);
        datPicker.onchange(null);
        otbPicker.onchange(null);
        updateItemView(parseInt(itemIdInput.value));
    };

    sprPicker.onchange = function (event) {
        if (sprPicker.files.length > 0) {
            sprLoaded = false;
            sprManager = new SpriteManager(client);
            const file = sprPicker.files[0];
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = function (event: any) {
                sprLoaded = sprManager.loadSpr(new InputFile(new DataView(event.target.result)));
            }
        }
    };

    datPicker.onchange = function (event) {
        if (datPicker.files.length > 0) {
            datLoaded = false;
            datManager = new DatManager(client);
            const file = datPicker.files[0];
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = function (event: any) {
                datLoaded = datManager.loadDat(new InputFile(new DataView(event.target.result)));
            }
        }
    };

    otbPicker.onchange = function (event) {
        if (otbPicker.files.length > 0) {
            otbLoaded = false;
            otbManager = new OtbManager(client);
            const file = otbPicker.files[0];
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = function (event: any) {
                otbLoaded = otbManager.loadOtb(new InputFile(new DataView(event.target.result)));
            }
        }
    };

    itemIdInput.onchange = function (event) {
        updateItemView(parseInt(itemIdInput.value));
    };
}

// testGenerateAllItemImages();
// testLoadFromUrlsAndDrawImage();
testGenerateAllDat();
// testFilePicker();
/*
download OTB:

otbFile = otbManager.saveOtb();
a = document.createElement('a');
url = window.URL.createObjectURL(new Blob(new Array(otbFile.getUint8Array())));
a.href = url;
a.download = 'items.otb';
a.click();
window.URL.revokeObjectURL(url);
a.remove();
 */

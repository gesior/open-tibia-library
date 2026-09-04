import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import {Client} from "./modules/client";
import {DatManager} from "./modules/datFile/datManager";
import {InputFile} from "./modules/fileHandlers/inputFile";

function sha1Hex(buf: Uint8Array): string {
    return crypto.createHash("sha1").update(buf).digest("hex");
}

function folderToVersion(folderName: string): number {
    const match = folderName.match(/^(\d+)/);
    if (!match) {
        return NaN;
    }
    const version = parseInt(match[1], 10);
    // CipSoft shipped Tibia 11 as a second client labeled "10.00"; those DAT files
    // are larger than 10.10 and follow the 11.00 format, not protocol 10.00.
    if (folderName === "1000" || version === 1000) {
        return 1100;
    }
    return version;
}

function listDatFolders(dataDir: string): string[] {
    if (!fs.existsSync(dataDir)) {
        throw new Error("Data directory not found: " + dataDir);
    }
    const names = fs.readdirSync(dataDir).filter(function (name) {
        return fs.existsSync(path.join(dataDir, name, "Tibia.dat"));
    });
    names.sort(function (a, b) {
        const va = folderToVersion(a);
        const vb = folderToVersion(b);
        if (va !== vb) {
            return va - vb;
        }
        return a.localeCompare(b);
    });
    return names;
}

function roundtripOne(dataDir: string, folderName: string): boolean {
    const version = folderToVersion(folderName);
    const datPath = path.join(dataDir, folderName, "Tibia.dat");
    const originalBuf = fs.readFileSync(datPath);
    const original = new Uint8Array(originalBuf.buffer, originalBuf.byteOffset, originalBuf.byteLength);

    const client = new Client();
    client.setClientVersion(version);
    const datManager = new DatManager(client);
    const loaded = datManager.loadDat(InputFile.fromUint8Array(original));

    if (!loaded) {
        console.log("FAIL  " + folderName + "  client=" + version + "  loadDat failed");
        return false;
    }

    const saved = datManager.saveDat().getUint8Array();
    const origSha1 = sha1Hex(original);
    const savedSha1 = sha1Hex(saved);
    if (origSha1 !== savedSha1) {
        console.log("FAIL  " + folderName + "  client=" + version);
        return false;
    }

    console.log("PASS  " + folderName + "  client=" + version + "  sha1=" + origSha1);
    return true;
}

function main() {
    const dataDir = path.join(process.cwd(), "data", "dat_and_spr");
    const folders = listDatFolders(dataDir);

    if (folders.length === 0) {
        console.error("No Tibia.dat files found in " + dataDir);
        process.exit(1);
    }

    let failed = 0;
    let passed = 0;

    for (let i = 0; i < folders.length; i++) {
        if (roundtripOne(dataDir, folders[i])) {
            passed++;
        } else {
            failed++;
        }
    }

    console.log("");
    console.log("Passed: " + passed + "  Failed: " + failed + "  Total: " + (passed + failed));
    if (failed > 0) {
        process.exit(1);
    }
}

main();

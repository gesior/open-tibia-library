# Open Tibia Library

Library to read and write DAT, SPR and OTB files used by OTS and OTClient. Written in TypeScript.

Works in Node and in the browser. The library accepts and returns bytes (`Uint8Array` / `DataView`). Loading files from disk or from a file picker is done by the caller.

Browser tools that use this library (item/outfit image generators, OTB editor) live in a separate project: [open-tibia-tools](https://github.com/gesior/open-tibia-tools).

The unscoped npm package `open-tibia-library` is an unofficial copy published by someone else. Install this scoped package instead.

## Install

From npm:

```
npm install @gesior/open-tibia-library
```

The published package includes compiled `dist/` (`main` / `types` point there).

## Node (command line)

```js
const fs = require("fs");
const {Client, DatManager, InputFile} = require("@gesior/open-tibia-library");

const bytes = new Uint8Array(fs.readFileSync("Tibia.dat"));
const client = new Client();
client.setClientVersion(860);

const datManager = new DatManager(client);
if (!datManager.loadDat(InputFile.fromUint8Array(bytes))) {
    throw new Error("Failed to load DAT");
}

const saved = datManager.saveDat().getUint8Array();
fs.writeFileSync("Tibia-saved.dat", Buffer.from(saved));
```

`InputFile.fromUint8Array` uses `byteOffset` / `byteLength`, so it works with a Node `Buffer`.

## Browser

```js
import {Client, DatManager, InputFile} from "@gesior/open-tibia-library";

const file = document.getElementById("dat").files[0];
const reader = new FileReader();
reader.onload = function (event) {
    const client = new Client();
    client.setClientVersion(860);
    const datManager = new DatManager(client);
    datManager.loadDat(InputFile.fromUint8Array(new Uint8Array(event.target.result)));
};
reader.readAsArrayBuffer(file);
```

The same `loadDat` / `loadSpr` / `loadOtb` and `saveDat` / `saveSpr` / `saveOtb` API is used in both environments.

## DAT roundtrip test

With client files in `data/dat_and_spr/<version>/Tibia.dat`:

```
npm run test:dat-roundtrip
```

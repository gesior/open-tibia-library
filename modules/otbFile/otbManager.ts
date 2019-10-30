import {Log} from "../log";
import {InputFile} from "../fileHandlers/inputFile";
import {g_resources} from "../resources";
import {OtbItemType} from "./otbItemType";
import {Client} from "../client";
import {OutputFile} from "../fileHandlers/outputFile";
import {OutputBinaryTree} from "../fileHandlers/outputBinaryTree";

export class OtbManager {
    private m_loaded = false;
    private m_lastId = 99;
    private m_itemTypes: OtbItemType[] = [];
    private m_reverseItemTypes: OtbItemType[] = [];
    private m_otbMajorVersion: number = 0;
    private m_otbMinorVersion: number = 0;
    private m_otbBuildVersion: number = 0;
    private m_otbDescription: string = '';

    constructor(public m_client: Client) {
    }

    getItem(id: number) {
        return this.m_itemTypes[id];
    }

    getItemByClientId(id: number) {
        return this.m_reverseItemTypes[id];
    }

    isValidOtbId(id: number): boolean {
        return this.m_itemTypes[id] !== undefined;
    }

    getLastId() {
        return this.m_lastId;
    }

    setLastId(value: number) {
        this.m_lastId = value;
    }

    increaseLastId() {
        this.setLastId(this.getLastId() + 1);
    }

    getMajorVersion() {
        return this.m_otbMajorVersion;
    }

    setMajorVersion(version: number) {
        this.m_otbMajorVersion = version;
    }

    getMinorVersion() {
        return this.m_otbMajorVersion;
    }

    setMinorVersion(version: number) {
        this.m_otbMajorVersion = version;
    }

    getBuildVersion() {
        return this.m_otbBuildVersion;
    }

    setBuildVersion(version: number) {
        this.m_otbBuildVersion = version;
    }

    getDescription() {
        return this.m_otbDescription;
    }

    /**
     * Set description to 128 ASCII characters.
     * Format required by OTBI.
     * @param description
     */
    setDescription(description: string) {
        let newDescription = '';
        for (let i = 0; i < description.length, newDescription.length < 128; i++) {
            newDescription += String.fromCharCode(description.charCodeAt(i) % 256);
        }

        while (newDescription.length < 128) {
            newDescription += String.fromCharCode(0);
        }
        this.m_otbDescription = newDescription;
    }

    async loadOtbFromUrl(url: string): Promise<boolean> {
        let fin: InputFile = await g_resources.openUrl(url);
        return this.loadOtb(fin);
    }

    loadOtb(fin: InputFile): boolean {
        if (this.m_loaded) {
            throw new Error("OtbManager can load OTB only once");
        }
        this.m_loaded = true;
        try {
            let signature = fin.getU32();
            if (signature != 0)
                throw new Error("invalid otb file 1, " + signature);

            let root = fin.getBinaryTree();
            root.skip(1);

            signature = root.getU32();
            if (signature != 0)
                throw new Error("invalid otb file 2, " + signature);

            let rootAttr = root.getU8();
            if (rootAttr == 0x01) { // OTB_ROOT_ATTR_VERSION
                let size = root.getU16();
                if (size != 4 + 4 + 4 + 128)
                    throw new Error("invalid otb root attr version size");

                this.m_otbMajorVersion = root.getU32();
                this.m_otbMinorVersion = root.getU32();
                this.m_otbBuildVersion = root.getU32();
                this.m_otbDescription = root.getString(128);
            }

            for (let node of root.getChildren()) {
                let itemType = new OtbItemType();
                itemType.unserialize(node, this);
                this.addItemType(itemType);
            }

            return true;
        } catch (e) {
            Log.error("Failed to load (OTB file): %s", e);
            return false;
        }
    }

    saveOtb(): OutputFile {
        const fout = new OutputFile();
        fout.addU32(0);
        let root = new OutputBinaryTree(fout);
        root.addU32(0); // signature

        root.addU8(1); // OTB_ROOT_ATTR_VERSION

        root.addU16(4 + 4 + 4 + 128); // size

        root.addU32(this.m_otbMajorVersion);
        root.addU32(this.m_otbMinorVersion);
        root.addU32(this.m_otbBuildVersion);
        root.addString(this.m_otbDescription, 128); // build version

        for (let otbItemType of this.m_itemTypes) {
            if (otbItemType) {
                root.startNode(-1);
                otbItemType.serialize(root, this);
                root.endNode();
            }
        }
        root.endNode();

        return fout;
    }

    addItemType(itemType: OtbItemType) {
        this.m_itemTypes[itemType.getServerId()] = itemType;
        this.m_reverseItemTypes[itemType.getClientId()] = itemType;
    }
}

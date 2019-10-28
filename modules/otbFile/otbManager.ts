import {Log} from "../log";
import {InputFile} from "../fileHandlers/inputFile";
import {g_resources} from "../resources";
import {OtbItemType} from "./otbItemType";
import {Client} from "../client";

export class OtbManager {
    m_itemTypes: OtbItemType[] = [];
    m_reverseItemTypes: OtbItemType[] = [];
    m_otbLoaded: boolean = false;
    m_otbMajorVersion: number = 0;
    m_otbMinorVersion: number = 0;

    constructor(public m_client: Client) {
    }
/*
    getThingType(id: number, category: ThingCategory): ThingType {
        if (category >= ThingCategory.ThingLastCategory || id >= this.m_thingTypes[category].length) {
            Log.error("invalid thing type client id %d in category %d", id, category);
        }
        return this.m_thingTypes[category][id];
    }

    rawGetThingType(id: number, category: ThingCategory): any {
        return this.getThingType(id, category);
    }
*/
    isValidOtbId(id: number): boolean {
        return true;
    }

    getMajorVersion(): any {
        throw this.m_otbMajorVersion;
    }
    getMinorVersion(): any {
        throw this.m_otbMajorVersion;
    }

    async loadOtbFromUrl(url: string): Promise<boolean> {
        let fin: InputFile = await g_resources.openUrl(url);
        return this.loadOtb(fin);
    }

    loadOtb(fin: InputFile): boolean {
        try {
            let signature = fin.getU32();
            if(signature != 0)
                throw new Error("invalid otb file 1, " + signature);

            let root = fin.getBinaryTree();
            root.skip(1);

            signature = root.getU32();
            if(signature != 0)
                throw new Error("invalid otb file 2, " + signature);

            let rootAttr = root.getU8();
            if(rootAttr == 0x01) { // OTB_ROOT_ATTR_VERSION
                let size = root.getU16();
                if(size != 4 + 4 + 4 + 128)
                    throw new Error("invalid otb root attr version size");

                this.m_otbMajorVersion = root.getU32();
                this.m_otbMinorVersion = root.getU32();
                root.skip(4); // buildNumber
                root.skip(128); // description
            }

            for(let node of root.getChildren()) {
                let itemType = new OtbItemType();
                itemType.unserialize(node, this);
                this.addItemType(itemType);
            }

            this.m_otbLoaded = true;
            return true;
        } catch(e) {
            Log.error("Failed to load (OTB file): %s", e);
            return false;
        }
    }

    addItemType(itemType: OtbItemType) {
        this.m_itemTypes[itemType.getServerId()] = itemType;
        this.m_reverseItemTypes[itemType.getClientId()] = itemType;
    }
}

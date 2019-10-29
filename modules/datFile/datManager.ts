import {DatThingType} from "./datThingType";
import {DatThingAttr, DatThingCategory} from "../constants/const";
import {Log} from "../log";
import {InputFile} from "../fileHandlers/inputFile";
import {g_resources} from "../resources";
import {OutputFile} from "../fileHandlers/outputFile";
import {Client} from "../client";
import {sortObjectByKey} from "../constants/helpers";

export class DatManager {
    private static m_nullThingType = new DatThingType();
    private readonly m_thingTypes: DatThingType[][] = [];
    private m_datSignature: number = 0;
    private m_contentRevision: number = 0;

    constructor(public m_client: Client) {
        for (let i = DatThingCategory.ThingCategoryItem; i < DatThingCategory.ThingLastCategory; ++i) {
            this.m_thingTypes[i] = [];
        }
    }

    getThingType(id: number, category: DatThingCategory): DatThingType {
        if (category >= DatThingCategory.ThingLastCategory || id >= this.m_thingTypes[category].length) {
            Log.error("invalid thing type client id %d in category %d", id, category);
            return DatManager.m_nullThingType;
        }
        return this.m_thingTypes[category][id];
    }

    getThingTypes() {
        return this.m_thingTypes;
    }

    getCategory(category: DatThingCategory) {
        return this.m_thingTypes[category];
    }

    getItem(id: number) {
        return this.getThingType(id, DatThingCategory.ThingCategoryItem);
    }

    getOutfit(id: number) {
        return this.getThingType(id, DatThingCategory.ThingCategoryCreature);
    }

    getEffect(id: number) {
        return this.getThingType(id, DatThingCategory.ThingCategoryEffect);
    }

    getMissile(id: number) {
        return this.getThingType(id, DatThingCategory.ThingCategoryMissile);
    }

    isValidDatId(id: number, category: DatThingCategory): boolean {
        return true;
    }

    getNullThingType(): DatThingType {
        return DatManager.m_nullThingType;
    }

    getDatSignature() {
        throw this.m_datSignature;
    }

    getContentRevision() {
        throw this.m_contentRevision;
    }

    async loadDatFromUrl(url: string): Promise<boolean> {
        let fin: InputFile = await g_resources.openUrl(url);
        return this.loadDat(fin);
    }

    loadDat(fin: InputFile): boolean {
        this.m_datSignature = 0;
        this.m_contentRevision = 0;
        try {
            this.m_datSignature = fin.getU32();
            this.m_contentRevision = this.m_datSignature & 0xFFFF;

            for (let category = DatThingCategory.ThingCategoryItem; category < DatThingCategory.ThingLastCategory; ++category) {
                let count = fin.getU16() + 1;
                this.m_thingTypes[category] = [];
                for (let thingCount = 0; thingCount < count; ++thingCount) {
                    this.m_thingTypes[category][thingCount] = DatManager.m_nullThingType;
                }
            }

            const clientTranslationArray = this.getClientTranslationArray();
            for (let category = 0; category < DatThingCategory.ThingLastCategory; ++category) {
                let firstId = 1;
                if (category == DatThingCategory.ThingCategoryItem)
                    firstId = 100;
                for (let id = firstId; id < this.m_thingTypes[category].length; ++id) {
                    let type = new DatThingType();
                    type.unserialize(id, category, fin, this.m_client, clientTranslationArray);
                    this.m_thingTypes[category][id] = type;
                }
            }

            return true;
        } catch (e) {
            Log.error("Failed to read dat: %s'", e);
            return false;
        }
    }

    saveDat(): OutputFile {
        const fin = new OutputFile();
        fin.addU32(this.m_datSignature);

        for (let category = 0; category < DatThingCategory.ThingLastCategory; ++category) {
            fin.addU16(this.m_thingTypes[category].length - 1);
        }

        const clientTranslationArray = this.getClientTranslationArray();

        for (let category = 0; category < DatThingCategory.ThingLastCategory; ++category) {
            let firstId = 1;
            if (category == DatThingCategory.ThingCategoryItem)
                firstId = 100;

            for (let id = firstId; id < this.m_thingTypes[category].length; ++id)
                this.m_thingTypes[category][id].serialize(fin, this.m_client, clientTranslationArray);
        }
        return fin;
    }

    getClientTranslationArray(): number[] {
        let clientAttributesTranslator = {};
        for (let thingAttr = 0; thingAttr < DatThingAttr.ThingLastAttr; ++thingAttr) {
            if (DatThingAttr[thingAttr] === undefined) {
                continue;
            }
            let clientDatAttribute = thingAttr;
            if (this.m_client.getClientVersion() >= 1000) {
                /* In 10.10+ all attributes from 16 and up were
                 * incremented by 1 to make space for 16 as
                 * "No Movement Animation" flag.
                 */
                if (thingAttr == DatThingAttr.ThingAttrNoMoveAnimation)
                    clientDatAttribute = 16;
                else if (thingAttr >= DatThingAttr.ThingAttrPickupable)
                    clientDatAttribute += 1;
            } else if (this.m_client.getClientVersion() >= 860) {
                /* Default attribute values follow
                 * the format of 8.6-9.86.
                 * Therefore no changes here.
                 */
            } else if (this.m_client.getClientVersion() >= 780) {
                /* In 7.80-8.54 all attributes from 8 and higher were
                 * incremented by 1 to make space for 8 as
                 * "Item Charges" flag.
                 */
                if (thingAttr == DatThingAttr.ThingAttrChargeable)
                    clientDatAttribute = DatThingAttr.ThingAttrWritable;
                else if (thingAttr >= DatThingAttr.ThingAttrWritable)
                    clientDatAttribute += 1;
            } else if (this.m_client.getClientVersion() >= 755) {
                /* In 7.55-7.72 attributes 23 is "Floor Change". */
                if (thingAttr == DatThingAttr.ThingAttrFloorChange)
                    clientDatAttribute = 23
            } else if (this.m_client.getClientVersion() >= 740) {
                /* In 7.4-7.5 attribute "Ground Border" did not exist
                 * attributes 1-15 have to be adjusted.
                 * Several other changes in the format.
                 */

                if (thingAttr > 1 && thingAttr <= 16)
                    thingAttr -= 1;
                else if (thingAttr == DatThingAttr.ThingAttrLight)
                    thingAttr = 16;
                else if (thingAttr == DatThingAttr.ThingAttrFloorChange)
                    thingAttr = 17;
                else if (thingAttr == DatThingAttr.ThingAttrFullGround)
                    thingAttr = 18;
                else if (thingAttr == DatThingAttr.ThingAttrElevation)
                    thingAttr = 19;
                else if (thingAttr == DatThingAttr.ThingAttrDisplacement)
                    thingAttr = 20;
                else if (thingAttr == DatThingAttr.ThingAttrMinimapColor)
                    thingAttr = 22;
                else if (thingAttr == DatThingAttr.ThingAttrRotateable)
                    thingAttr = 23;
                else if (thingAttr == DatThingAttr.ThingAttrLyingCorpse)
                    thingAttr = 24;
                else if (thingAttr == DatThingAttr.ThingAttrHangable)
                    thingAttr = 25;
                else if (thingAttr == DatThingAttr.ThingAttrHookSouth)
                    thingAttr = 26;
                else if (thingAttr == DatThingAttr.ThingAttrHookEast)
                    thingAttr = 27;
                else if (thingAttr == DatThingAttr.ThingAttrAnimateAlways)
                    thingAttr = 28;

                /* "Multi Use" and "Force Use" are swapped */
                if (thingAttr == DatThingAttr.ThingAttrMultiUse)
                    clientDatAttribute = DatThingAttr.ThingAttrForceUse;
                else if (thingAttr == DatThingAttr.ThingAttrForceUse)
                    clientDatAttribute = DatThingAttr.ThingAttrMultiUse;
            }
            clientAttributesTranslator[clientDatAttribute] = thingAttr;
        }

        return sortObjectByKey(clientAttributesTranslator);
    }

}

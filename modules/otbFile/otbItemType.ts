import {OtbItemCategory, OtbItemTypeAttr} from "../constants/const";
import {BinaryTree} from "../fileHandlers/binaryTree";
import {Light} from "../structures/light";
import {OtbManager} from "./otbManager";

export class OtbItemType {
    static lastId = 99;
    m_null = true;
    m_attribs = [];
    m_category = OtbItemCategory.ItemCategoryInvalid;

    unserialize(node: BinaryTree, m_otbManager: OtbManager) {
        this.m_null = false;
        this.m_category = node.getU8();

        node.getU32(); // flags

        while (node.canRead()) {
            let attr = node.getU8();
            if (attr == 0 || attr == 0xFF)
                break;

            let len = node.getU16();
            switch (attr) {
                case OtbItemTypeAttr.ItemTypeAttrServerId: {
                    let serverId = node.getU16();
                    if (m_otbManager.m_client.getClientVersion() < 960) {
                        if (serverId > 20000 && serverId < 20100) {
                            serverId -= 20000;
                        } else if (OtbItemType.lastId > 99 && OtbItemType.lastId != serverId - 1) {
                            while (OtbItemType.lastId != serverId - 1) {
                                let tmp = new OtbItemType();
                                tmp.setServerId(OtbItemType.lastId++);
                                m_otbManager.addItemType(tmp);
                            }
                        }
                    } else {
                        if (serverId > 30000 && serverId < 30100) {
                            serverId -= 30000;
                        } else if (OtbItemType.lastId > 99 && OtbItemType.lastId != serverId - 1) {
                            while (OtbItemType.lastId != serverId - 1) {
                                let tmp = new OtbItemType();
                                tmp.setServerId(OtbItemType.lastId++);
                                m_otbManager.addItemType(tmp);
                            }
                        }
                    }
                    this.setServerId(serverId);
                    OtbItemType.lastId = serverId;
                    break;
                }
                case OtbItemTypeAttr.ItemTypeAttrClientId:
                    this.setClientId(node.getU16());
                    break;
                case OtbItemTypeAttr.ItemTypeAttrName:
                    this.setName(node.getString(len));
                    break;
                case OtbItemTypeAttr.ItemTypeAttrWritable:
                    this.setWritable(true);
                    break;
                case OtbItemTypeAttr.ItemTypeAttrSpeed:
                    this.m_attribs[OtbItemTypeAttr.ItemTypeAttrSpeed] = node.getU16();
                    break;
                case OtbItemTypeAttr.ItemTypeAttrLight2:
                    this.m_attribs[OtbItemTypeAttr.ItemTypeAttrLight2] = new Light(node.getU16(), node.getU16());
                    break;
                case OtbItemTypeAttr.ItemTypeAttrTopOrder:
                    //1: borders
                    //2: ladders, signs, splashes
                    //3: doors etc
                    //4: creatures
                    this.m_attribs[OtbItemTypeAttr.ItemTypeAttrTopOrder] = node.getU8();
                    break;
                case OtbItemTypeAttr.ItemTypeAttrWareId:
                    this.m_attribs[OtbItemTypeAttr.ItemTypeAttrWareId] = node.getU16();
                    break;
                default:
                    node.skip(len); // skip attribute
                    break;
            }
        }
    }

    serialize(node: BinaryTree, m_otbManager: OtbManager) {
        this.m_null = false;
        this.m_category = node.getU8();

        node.getU32(); // flags

        while (node.canRead()) {
            let attr = node.getU8();
            if (attr == 0 || attr == 0xFF)
                break;

            let len = node.getU16();
            switch (attr) {
                case OtbItemTypeAttr.ItemTypeAttrServerId: {
                    let serverId = node.getU16();
                    if (m_otbManager.m_client.getClientVersion() < 960) {
                        if (serverId > 20000 && serverId < 20100) {
                            serverId -= 20000;
                        } else if (OtbItemType.lastId > 99 && OtbItemType.lastId != serverId - 1) {
                            while (OtbItemType.lastId != serverId - 1) {
                                let tmp = new OtbItemType();
                                tmp.setServerId(OtbItemType.lastId++);
                                m_otbManager.addItemType(tmp);
                            }
                        }
                    } else {
                        if (serverId > 30000 && serverId < 30100) {
                            serverId -= 30000;
                        } else if (OtbItemType.lastId > 99 && OtbItemType.lastId != serverId - 1) {
                            while (OtbItemType.lastId != serverId - 1) {
                                let tmp = new OtbItemType();
                                tmp.setServerId(OtbItemType.lastId++);
                                m_otbManager.addItemType(tmp);
                            }
                        }
                    }
                    this.setServerId(serverId);
                    OtbItemType.lastId = serverId;
                    break;
                }
                case OtbItemTypeAttr.ItemTypeAttrClientId:
                    this.setClientId(node.getU16());
                    break;
                case OtbItemTypeAttr.ItemTypeAttrName:
                    this.setName(node.getString(len));
                    break;
                case OtbItemTypeAttr.ItemTypeAttrWritable:
                    this.setWritable(true);
                    break;
                case OtbItemTypeAttr.ItemTypeAttrSpeed:
                    this.m_attribs[OtbItemTypeAttr.ItemTypeAttrSpeed] = node.getU16();
                    break;
                case OtbItemTypeAttr.ItemTypeAttrLight2:
                    this.m_attribs[OtbItemTypeAttr.ItemTypeAttrLight2] = new Light(node.getU16(), node.getU16());
                    break;
                case OtbItemTypeAttr.ItemTypeAttrTopOrder:
                    //1: borders
                    //2: ladders, signs, splashes
                    //3: doors etc
                    //4: creatures
                    this.m_attribs[OtbItemTypeAttr.ItemTypeAttrTopOrder] = node.getU8();
                    break;
                case OtbItemTypeAttr.ItemTypeAttrWareId:
                    this.m_attribs[OtbItemTypeAttr.ItemTypeAttrWareId] = node.getU16();
                    break;
                default:
                    node.skip(len); // skip attribute
                    break;
            }
        }
    }

    setServerId(serverId: number) {
        this.m_attribs[OtbItemTypeAttr.ItemTypeAttrServerId] = serverId;
    }

    getServerId(): number {
        return this.m_attribs[OtbItemTypeAttr.ItemTypeAttrServerId];
    }

    setClientId(clientId: number) {
        this.m_attribs[OtbItemTypeAttr.ItemTypeAttrClientId] = clientId;
    }

    getClientId(): number {
        return this.m_attribs[OtbItemTypeAttr.ItemTypeAttrClientId];
    }

    setCategory(category: OtbItemCategory) {
        this.m_category = category;
    }

    getCategory(): OtbItemCategory {
        return this.m_category;
    }

    setName(name: string) {
        this.m_attribs[OtbItemTypeAttr.ItemTypeAttrName] = name;
    }

    getName(): string {
        return this.m_attribs[OtbItemTypeAttr.ItemTypeAttrName];
    }

    setDesc(desc: string) {
        this.m_attribs[OtbItemTypeAttr.ItemTypeAttrDesc] = desc;
    }

    getDesc(): string {
        return this.m_attribs[OtbItemTypeAttr.ItemTypeAttrDesc];
    }

    isNull() {
        return this.m_null;
    }

    setWritable(value: boolean) {
        this.m_attribs[OtbItemTypeAttr.ItemTypeAttrWritable] = value;
    }

    isWritable(): boolean {
        return this.m_attribs[OtbItemTypeAttr.ItemTypeAttrWritable];
    }

}

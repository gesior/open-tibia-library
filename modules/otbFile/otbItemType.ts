import {OtbItemCategory, OtbItemFlags, OtbItemTypeAttr} from "../constants/const";
import {BinaryTree} from "../fileHandlers/binaryTree";
import {Light} from "../structures/light";
import {OtbManager} from "./otbManager";
import {OutputBinaryTree} from "../fileHandlers/outputBinaryTree";
import {OtbItemTypeAttributes} from "./otbItemTypeAttributes";

export class OtbItemType {
    m_null = true;
    m_category = OtbItemCategory.ItemCategoryInvalid;
    m_flags = 0;
    m_attribs = new OtbItemTypeAttributes();

    serialize(node: OutputBinaryTree, m_otbManager: OtbManager) {
        node.addU8(this.m_category);
        node.addU32(this.m_flags);

        for (let attrString in this.m_attribs.attribs) {
            const attr = parseInt(attrString);
            node.addU8(attr);

            switch (attr) {
                case OtbItemTypeAttr.ItemTypeAttrServerId: {
                    let serverId = this.m_attribs.get(attr);
                    if (m_otbManager.m_client.getClientVersion() < 960) {
                        if (serverId > 20000 && serverId < 20100) {
                            serverId += 20000;
                        }
                    } else {
                        if (serverId > 30000 && serverId < 30100) {
                            serverId += 30000;
                        }
                    }

                    node.addU16(2);
                    node.addU16(serverId);
                    break;
                }
                case OtbItemTypeAttr.ItemTypeAttrClientId:
                    node.addU16(2);
                    node.addU16(this.m_attribs.get(attr));
                    break;
                case OtbItemTypeAttr.ItemTypeAttrName:
                    node.addString(this.m_attribs.get(attr));
                    break;
                case OtbItemTypeAttr.ItemTypeAttrSpeed:
                    node.addU16(2);
                    node.addU16(this.m_attribs.get(attr));
                    break;
                case OtbItemTypeAttr.ItemTypeAttrWritable:
                    node.addU16(1);
                    node.addU8(this.m_attribs.get(attr));
                    break;
                case OtbItemTypeAttr.ItemTypeAttrSpriteHash:
                    node.addString(this.m_attribs.get(attr));
                    break;
                case OtbItemTypeAttr.ItemTypeAttrMinimapColor:
                    node.addU16(2);
                    node.addU16(this.m_attribs.get(attr));
                    break;
                case OtbItemTypeAttr.ItemTypeAttr07:
                    node.addU16(2);
                    node.addU16(this.m_attribs.get(attr));
                    break;
                case OtbItemTypeAttr.ItemTypeAttr08:
                    node.addU16(2);
                    node.addU16(this.m_attribs.get(attr));
                    break;
                case OtbItemTypeAttr.ItemTypeAttrLight2:
                    node.addU16(4);
                    const light: Light = this.m_attribs.get(attr);
                    node.addU16(light.intensity);
                    node.addU16(light.color);
                    break;
                case OtbItemTypeAttr.ItemTypeAttrTopOrder:
                    //1: borders
                    //2: ladders, signs, splashes
                    //3: doors etc
                    //4: creatures
                    node.addU16(1);
                    node.addU8(this.m_attribs.get(attr));
                    break;
                case OtbItemTypeAttr.ItemTypeAttrWareId:
                    node.addU16(2);
                    node.addU16(this.m_attribs.get(attr));
                    break;
                default:
                    node.addString(this.m_attribs.get(attr));
            }
        }
    }

    unserialize(node: BinaryTree, m_otbManager: OtbManager) {
        this.m_null = false;
        this.m_category = node.getU8();

        this.m_flags = node.getU32();

        while (node.canRead()) {
            let attr = node.getU8();
            if (attr == 0 || attr == 0xFF) {
                break;
            }

            let len = node.getU16();
            switch (attr) {
                case OtbItemTypeAttr.ItemTypeAttrServerId: {
                    let serverId = node.getU16();
                    if (m_otbManager.m_client.getClientVersion() < 960) {
                        if (serverId > 20000 && serverId < 20100) {
                            serverId -= 20000;
                        } else if (m_otbManager.m_lastId > 99 && m_otbManager.m_lastId != serverId - 1) {
                            while (m_otbManager.m_lastId != serverId - 1) {
                                let tmp = new OtbItemType();
                                tmp.setServerId(m_otbManager.m_lastId++);
                                m_otbManager.addItemType(tmp);
                            }
                        }
                    } else {
                        if (serverId > 30000 && serverId < 30100) {
                            serverId -= 30000;
                        } else if (m_otbManager.m_lastId > 99 && m_otbManager.m_lastId != serverId - 1) {
                            while (m_otbManager.m_lastId != serverId - 1) {
                                let tmp = new OtbItemType();
                                tmp.setServerId(m_otbManager.m_lastId++);
                                m_otbManager.addItemType(tmp);
                            }
                        }
                    }
                    this.setServerId(serverId);
                    m_otbManager.m_lastId = serverId;
                    break;
                }
                case OtbItemTypeAttr.ItemTypeAttrClientId:
                    this.setClientId(node.getU16());
                    break;
                case OtbItemTypeAttr.ItemTypeAttrName:
                    this.setName(node.getString(len));
                    break;
                case OtbItemTypeAttr.ItemTypeAttrSpeed:
                    this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttrSpeed, node.getU16());
                    break;
                case OtbItemTypeAttr.ItemTypeAttrWritable:
                    this.setWritable(true);
                    break;
                case OtbItemTypeAttr.ItemTypeAttrSpriteHash:
                    this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttrSpriteHash, node.getString(len));
                    break;
                case OtbItemTypeAttr.ItemTypeAttrMinimapColor:
                    this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttrMinimapColor, node.getU16());
                    break;
                case OtbItemTypeAttr.ItemTypeAttr07:
                    this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttr07, node.getU16());
                    break;
                case OtbItemTypeAttr.ItemTypeAttr08:
                    this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttr08, node.getU16());
                    break;
                case OtbItemTypeAttr.ItemTypeAttrLight2:
                    this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttrLight2, new Light(node.getU16(), node.getU16()));
                    break;
                case OtbItemTypeAttr.ItemTypeAttrTopOrder:
                    //1: borders
                    //2: ladders, signs, splashes
                    //3: doors etc
                    //4: creatures
                    this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttrTopOrder, node.getU8());
                    break;
                case OtbItemTypeAttr.ItemTypeAttrWareId:
                    this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttrWareId, node.getU16());
                    break;
                default:
                    this.m_attribs.set(attr, node.getString(len));
                    break;
            }
        }
    }

    isNull() {
        return this.m_null;
    }

    setCategory(category: OtbItemCategory) {
        this.m_category = category;
    }

    getCategory(): OtbItemCategory {
        return this.m_category;
    }

    setFlags(flags: number) {
        this.m_flags = flags;
    }

    getFlags(): number {
        return this.m_flags;
    }

    hasFlag(flag: OtbItemFlags): boolean {
        return (this.m_flags & flag) == flag;
    }

    setFlag(flag: OtbItemFlags, value: boolean) {
        if (value) {
            this.m_flags |= flag;
        } else {
            this.m_flags &= ~flag;
        }
    }

    setServerId(serverId: number) {
        this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttrServerId, serverId);
    }

    getServerId(): number {
        return this.m_attribs.get(OtbItemTypeAttr.ItemTypeAttrServerId);
    }

    setClientId(clientId: number) {
        this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttrClientId, clientId);
    }

    getClientId(): number {
        return this.m_attribs.get(OtbItemTypeAttr.ItemTypeAttrClientId);
    }

    setName(name: string) {
        this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttrName, name);
    }

    getName(): string {
        return this.m_attribs.get(OtbItemTypeAttr.ItemTypeAttrName);
    }

    setDescription(description: string) {
        this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttrDesc, description);
    }

    getDescription(): string {
        return this.m_attribs.get(OtbItemTypeAttr.ItemTypeAttrDesc);
    }

    setWritable(value: boolean) {
        this.m_attribs.set(OtbItemTypeAttr.ItemTypeAttrWritable, value);
    }

    isWritable(): boolean {
        return this.m_attribs.get(OtbItemTypeAttr.ItemTypeAttrWritable);
    }

    getAttributes(): OtbItemTypeAttributes {
        return this.m_attribs;
    }

    setAttributes(otbItemTypeAttributes: OtbItemTypeAttributes) {
        this.m_attribs = otbItemTypeAttributes;
    }

}

import {OtbItemTypeAttr} from "../constants/const";

export class OtbItemTypeAttributes {
    public attribs = {};

    has(attr: OtbItemTypeAttr) {
        return this.attribs.hasOwnProperty(attr.toString());
    }

    get(attr: OtbItemTypeAttr) {
        return this.attribs[attr];
    }

    set(attr: OtbItemTypeAttr, value: any) {
        this.attribs[attr] = value;
    }

    remove(attr: OtbItemTypeAttr) {
        delete this.attribs[attr];
    }

}
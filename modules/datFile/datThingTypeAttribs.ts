import {DatThingAttr} from "../constants/const";

export class DatThingTypeAttribs {
    public attribs = {};

    has(attr: DatThingAttr) {
        return this.attribs.hasOwnProperty(attr.toString());
    }

    get(attr: DatThingAttr) {
        return this.attribs[attr];
    }

    set(attr: DatThingAttr, value: any) {
        this.attribs[attr] = value;
    }

    remove(attr: DatThingAttr) {
        delete this.attribs[attr];
    }

}
import {DatThingCategory} from "../constants/const";
import {Color} from "./color";

export class Outfit {
    public static HSI_SI_VALUES = 7;
    public static HSI_H_STEPS = 19;

    m_category: DatThingCategory;
    m_id: number;
    m_auxId: number;
    m_head: number;
    m_body: number;
    m_legs: number;
    m_feet: number;
    m_addons: number;
    m_mount: number;
    m_headColor: Color;
    m_bodyColor: Color;
    m_legsColor: Color;
    m_feetColor: Color;

    constructor() {
        this.m_category = DatThingCategory.ThingCategoryCreature;
        this.m_id = 128;
        this.m_auxId = 0;
        this.resetClothes();
    }

    getId() {
        return this.m_id;
    }

    getAuxId() {
        return this.m_auxId;
    }

    getHead() {
        return this.m_head;
    }

    getBody() {
        return this.m_body;
    }

    getLegs() {
        return this.m_legs;
    }

    getFeet() {
        return this.m_feet;
    }

    getAddons() {
        return this.m_addons;
    }

    getMount() {
        return this.m_mount;
    }

    getCategory(): DatThingCategory {
        return this.m_category;
    }

    setId(id: number) {
        this.m_id = id;
    }

    setAuxId(id: number) {
        this.m_auxId = id;
    }

    setHead(head: number) {
        this.m_head = head;
        this.m_headColor = Outfit.getColor(head);
    }

    setBody(body: number) {
        this.m_body = body;
        this.m_bodyColor = Outfit.getColor(body);
    }

    setLegs(legs: number) {
        this.m_legs = legs;
        this.m_legsColor = Outfit.getColor(legs);
    }

    setFeet(feet: number) {
        this.m_feet = feet;
        this.m_feetColor = Outfit.getColor(feet);
    }

    setAddons(addons: number) {
        this.m_addons = addons;
    }

    setMount(mount: number): any {
        this.m_mount = mount;
    }

    setCategory(category: DatThingCategory) {
        this.m_category = category;
    }

    resetClothes() {
        this.setHead(0);
        this.setBody(0);
        this.setLegs(0);
        this.setFeet(0);
        this.setMount(0);
    }

    static getColor(color: number): Color {
        if (color >= Outfit.HSI_H_STEPS * Outfit.HSI_SI_VALUES)
            color = 0;

        var loc1 = 0, loc2 = 0, loc3 = 0;
        if (color % Outfit.HSI_H_STEPS != 0) {
            loc1 = color % Outfit.HSI_H_STEPS / 18.0;
            loc2 = 1;
            loc3 = 1;

            switch (Math.floor(color / Outfit.HSI_H_STEPS)) {
                case 0:
                    loc2 = 0.25;
                    loc3 = 1.00;
                    break;
                case 1:
                    loc2 = 0.25;
                    loc3 = 0.75;
                    break;
                case 2:
                    loc2 = 0.50;
                    loc3 = 0.75;
                    break;
                case 3:
                    loc2 = 0.667;
                    loc3 = 0.75;
                    break;
                case 4:
                    loc2 = 1.00;
                    loc3 = 1.00;
                    break;
                case 5:
                    loc2 = 1.00;
                    loc3 = 0.75;
                    break;
                case 6:
                    loc2 = 1.00;
                    loc3 = 0.50;
                    break;
            }
        }
        else {
            loc1 = 0;
            loc2 = 0;
            loc3 = 1 - color / Outfit.HSI_H_STEPS / Outfit.HSI_SI_VALUES;
        }

        if (loc3 == 0)
            return new Color(0, 0, 0);

        if (loc2 == 0) {
            var loc7 = Math.floor(loc3 * 255);
            return new Color(loc7, loc7, loc7);
        }

        var red = 0, green = 0, blue = 0;

        if (loc1 < 1.0 / 6.0) {
            red = loc3;
            blue = loc3 * (1 - loc2);
            green = blue + (loc3 - blue) * 6 * loc1;
        }
        else if (loc1 < 2.0 / 6.0) {
            green = loc3;
            blue = loc3 * (1 - loc2);
            red = green - (loc3 - blue) * (6 * loc1 - 1);
        }
        else if (loc1 < 3.0 / 6.0) {
            green = loc3;
            red = loc3 * (1 - loc2);
            blue = red + (loc3 - red) * (6 * loc1 - 2);
        }
        else if (loc1 < 4.0 / 6.0) {
            blue = loc3;
            red = loc3 * (1 - loc2);
            green = blue - (loc3 - red) * (6 * loc1 - 3);
        }
        else if (loc1 < 5.0 / 6.0) {
            blue = loc3;
            green = loc3 * (1 - loc2);
            red = green + (loc3 - green) * (6 * loc1 - 4);
        }
        else {
            red = loc3;
            green = loc3 * (1 - loc2);
            blue = red - (loc3 - green) * (6 * loc1 - 5);
        }
        return new Color(Math.floor(red * 255), Math.floor(green * 255), Math.floor(blue * 255));
    }
}

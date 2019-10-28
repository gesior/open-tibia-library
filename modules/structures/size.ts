import {Point} from "./point";

export class Size {
    constructor(public wd = -1, public ht = -1) {
    }

    equals(otherSize) {
        return this.wd == otherSize.wd && this.ht == otherSize.ht;
    }

    clone() {
        return new Size(this.wd, this.ht);
    }

    add(size) {
        return new Size(this.wd + size.wd, this.ht + size.ht);
    }

    sub(size) {
        return new Size(this.wd - size.wd, this.ht - size.ht);
    }

    mul(ratio) {
        return new Size(this.wd * ratio, this.ht * ratio);
    }

    isNull() {
        return this.wd == 0 && this.ht == 0;
    }

    isEmpty() {
        return this.wd < 1 || this.ht < 1;
    }

    isValid() {
        return this.wd >= 0 && this.ht >= 0;
    }

    width() {
        return this.wd;
    }

    height() {
        return this.ht;
    }

    resize(w, h) {
        this.wd = w;
        this.ht = h;
    }

    setWidth(w) {
        this.wd = w;
    }

    setHeight(h) {
        this.ht = h;
    }

    ratio() {
        return this.wd / this.ht;
    }

    area() {
        return this.wd * this.ht;
    }

    toPoint() {
        return new Point(this.wd, this.ht);
    }
}
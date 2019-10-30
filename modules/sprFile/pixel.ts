
export class Pixel {
    static readonly BYTES_PER_PIXEL = 4;
    constructor(private _r: number, private _g: number, private _b: number , private _a: number) {
    }

    isTransparent() {
        return this._r == 0 && this._g == 0 && this._b == 0 && this._a == 0;
    }

    get r(): number {
        return this._r;
    }

    set r(value: number) {
        this._r = value;
    }

    get g(): number {
        return this._g;
    }

    set g(value: number) {
        this._g = value;
    }

    get b(): number {
        return this._b;
    }

    set b(value: number) {
        this._b = value;
    }

    get a(): number {
        return this._a;
    }

    set a(value: number) {
        this._a = value;
    }

}
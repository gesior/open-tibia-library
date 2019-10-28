export class Color {
    public static readonly alpha = 0x00000000;
    public static readonly white = 0xffffffff;
    public static readonly red = 0xff0000ff;
    public static readonly green = 0xff00ff00;
    public static readonly blue = 0xffff0000;
    public static readonly yellow = 0xff00ffff;

    m_r: number;
    m_g: number;
    m_b: number;
    m_a: number;

    //Color() : m_r(1.0f), m_g(1.0f), m_b(1.0f), m_a(1.0f) { }
    //Color(uint32 rgba) { setRGBA(rgba); }
    constructor(...args: any[]) {
        if (args.length == 0) {
            this.m_r = 1;
            this.m_g = 1;
            this.m_b = 1;
            this.m_a = 1;
            return;
        } else if (args.length == 1) {
            if (typeof(args[0]) == 'number') {
                this.setRGBA(args[0]);
                return;
            }
        } else if (args.length == 3) {
            if (typeof(args[0]) == 'number' && typeof(args[1]) == 'number' && typeof(args[2]) == 'number') {
                let r = args[0] / 255;
                let g = args[1] / 255;
                let b = args[2] / 255;
                this.m_r = r;
                this.m_g = g;
                this.m_b = b;
                this.m_a = 1;
                return;
            }
        }
        throw new Error('Unhandled constructor');
    }

    equals(otherColor: Color): boolean {
        return this.m_r == otherColor.m_r && this.m_g == otherColor.m_g &&
            this.m_b == otherColor.m_b && this.m_a == otherColor.m_a;
    }

    clone(): Color {
        let color = new Color();
        color.m_r = this.m_r;
        color.m_g = this.m_g;
        color.m_b = this.m_b;
        color.m_a = this.m_a;
        return color;
    }

    a(): number {
        return this.m_a * 255.0;
    }

    b(): number {
        return this.m_b * 255.0;
    }

    g(): number {
        return this.m_g * 255.0;
    }

    r(): number {
        return this.m_r * 255.0;
    }

    aF(): number {
        return this.m_a;
    }

    bF(): number {
        return this.m_b;
    }

    gF(): number {
        return this.m_g;
    }

    rF(): number {
        return this.m_r;
    }

    rgba(): number {
        return this.a() | this.b() << 8 | this.g() << 16 | this.r() << 24;
    }


    setRGBA(r: number, g: number = -1, b: number = -1, a: number = 255) {
        if (g == -1) { // r is rgba
            let rgba = r;
            this.setRGBA((rgba >> 0) & 0xff, (rgba >> 8) & 0xff, (rgba >> 16) & 0xff, (rgba >> 24) & 0xff)
        } else {
            this.m_r = r / 255;
            this.m_g = g / 255;
            this.m_b = b / 255;
            this.m_a = a / 255;
        }
    }

    static from8bit(color: number): any {
        if (color >= 216 || color <= 0)
            return new Color(0, 0, 0);

        let r = parseInt((color / 36).toString()) % 6 * 51;
        let g = parseInt((color / 6).toString()) % 6 * 51;
        let b = color % 6 * 51;
        return new Color(r, g, b);
    }
}

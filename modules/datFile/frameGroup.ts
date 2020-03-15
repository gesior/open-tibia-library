import {InputFile} from "../fileHandlers/inputFile";
import {OutputFile} from "../fileHandlers/outputFile";
import {Animator} from "./animator";
import {Size} from "../structures/size";

export class FrameGroup {
    m_size: Size = new Size();
    m_animator: Animator = null;
    m_animationPhases: number = 0;
    m_exactSize: number = 0;
    m_realSize: number = 0;
    m_numPatternX: number = 0;
    m_numPatternY: number = 0;
    m_numPatternZ: number = 0;
    m_layers: number = 0;
    m_spritesIndex: number[] = [];

    getSize(): Size {
        return this.m_size;
    }

    getWidth(): number {
        return this.m_size.width();
    }

    getHeight(): number {
        return this.m_size.height();
    }

    getRealSize(): number {
        return this.m_realSize;
    }

    getLayers(): number {
        return this.m_layers;
    }

    getNumPatternX(): number {
        return this.m_numPatternX;
    }

    getNumPatternY(): number {
        return this.m_numPatternY;
    }

    getNumPatternZ(): number {
        return this.m_numPatternZ;
    }

    getAnimationPhases(): number {
        return this.m_animationPhases;
    }

    getAnimator(): Animator {
        return this.m_animator;
    }

    getSprites(): number[] {
        return this.m_spritesIndex;
    }

    getSprite(index: number): number {
        return this.m_spritesIndex[index];
    }

    getSpriteIndex(w: number, h: number, l: number, x: number, y: number, z: number, a: number): number {
        let index =
            ((((((a % this.m_animationPhases)
                * this.m_numPatternZ + z)
                * this.m_numPatternY + y)
                * this.m_numPatternX + x)
                * this.m_layers + l)
                * this.m_size.height() + h)
            * this.m_size.width() + w;
        if (!(index < this.m_spritesIndex.length)) {
            throw new Error('index < this.m_spritesIndex.length');
        }
        return index;
    }

    getTextureIndex(l: number, x: number, y: number, z: number) {
        return ((l * this.m_numPatternZ + z)
            * this.m_numPatternY + y)
            * this.m_numPatternX + x;
    }

}

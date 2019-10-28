import {InputFile} from "../fileHandlers/inputFile";
import {OutputFile} from "../fileHandlers/outputFile";

export class Animator {
    m_animationPhases = 0;
    m_startPhase = 0;
    m_loopCount = 0;
    m_async = false;
    m_phaseDurations = [];

    unserialize(animationPhases: number, fin: InputFile) {
        this.m_animationPhases = animationPhases;
        this.m_async = fin.getU8() == 0;
        this.m_loopCount = fin.get32();
        this.m_startPhase = fin.get8();

        for (let i = 0; i < this.m_animationPhases; ++i) {
            let minimum = fin.getU32();
            let maximum = fin.getU32();
            this.m_phaseDurations.push([minimum, maximum]);
        }
    }

    serialize(fin: OutputFile) {
        fin.addU8(this.m_async ? 0 : 1);
        fin.add32(this.m_loopCount);
        fin.add8(this.m_startPhase);

        for(const phase of this.m_phaseDurations) {
            fin.addU32(phase[0]);
            fin.addU32(phase[1]);
        }
    }
}

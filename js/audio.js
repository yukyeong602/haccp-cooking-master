// Web Audio API 기반 무음원 사운드 효과음 엔진
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.init();
    }

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        } catch (e) {
            console.warn("Web Audio API not supported", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    // 정답 딩동댕 화음 (C5 -> E5 -> G5 -> C6)
    playCorrect() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.35);
        });
    }

    // 오답 부저음 (방송 퀴즈쇼 스타일 강력한 2단 부저: 삐-익! 삐-익!)
    playWrong() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        // 2회 연속 부저 펄스 (1차: 0~0.18초, 2차: 0.22~0.52초)
        const bursts = [
            { start: now, duration: 0.18 },
            { start: now + 0.22, duration: 0.30 }
        ];

        bursts.forEach(burst => {
            // 주파수 간섭(비트 현상)을 일으켜 거친 전자 부저 음색 생성 (130Hz + 138Hz + 65Hz 서브)
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const oscSub = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(130, burst.start);

            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(138, burst.start);

            oscSub.type = 'square';
            oscSub.frequency.setValueAtTime(65, burst.start);

            // 어택과 릴리즈 엔벨로프
            gain.gain.setValueAtTime(0, burst.start);
            gain.gain.linearRampToValueAtTime(0.28, burst.start + 0.02);
            gain.gain.setValueAtTime(0.25, burst.start + burst.duration - 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, burst.start + burst.duration);

            osc1.connect(gain);
            osc2.connect(gain);
            oscSub.connect(gain);
            gain.connect(this.ctx.destination);

            osc1.start(burst.start);
            osc1.stop(burst.start + burst.duration);
            osc2.start(burst.start);
            osc2.stop(burst.start + burst.duration);
            oscSub.start(burst.start);
            oscSub.stop(burst.start + burst.duration);
        });
    }

    // 클릭 / 팝 소리
    playPop() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // 카트에 쏙 담기는 소리
    playCartDrop() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // 최종 승리 팡파레
    playFanfare() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [
            { f: 523.25, d: 0.12, t: 0 },
            { f: 523.25, d: 0.12, t: 0.14 },
            { f: 523.25, d: 0.12, t: 0.28 },
            { f: 659.25, d: 0.35, t: 0.42 },
            { f: 783.99, d: 0.25, t: 0.8 },
            { f: 1046.50, d: 0.6, t: 1.05 }
        ];

        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, now + n.t);

            gain.gain.setValueAtTime(0, now + n.t);
            gain.gain.linearRampToValueAtTime(0.3, now + n.t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + n.t);
            osc.stop(now + n.t + n.d);
        });
    }
}

window.soundEngine = new SoundEngine();

/**
 * Ambient Sound Synthesizer using the Web Audio API.
 * Provides client-side procedural generation of focus sounds (white/pink/brown noise,
 * rain, ocean waves, stream, binaural beats, lofi pad) with zero network requests,
 * zero external MP3 dependencies, and 100% offline support.
 */

export type AmbientSoundId =
  | 'white-noise'
  | 'pink-noise'
  | 'brown-noise'
  | 'rain-soft'
  | 'rain-thunder'
  | 'forest'
  | 'ocean-waves'
  | 'river-stream'
  | 'cafe-ambient'
  | 'library'
  | 'focus-binaural'
  | 'lofi-beats';

export const SYNTHESIZED_TRACK_IDS: AmbientSoundId[] = [
  'white-noise',
  'pink-noise',
  'brown-noise',
  'rain-soft',
  'rain-thunder',
  'forest',
  'ocean-waves',
  'river-stream',
  'cafe-ambient',
  'library',
  'focus-binaural',
  'lofi-beats',
];

export function isSynthesizable(id: string): id is AmbientSoundId {
  return SYNTHESIZED_TRACK_IDS.includes(id as AmbientSoundId);
}

interface ActiveGraph {
  sources: (AudioBufferSourceNode | OscillatorNode)[];
  filters: BiquadFilterNode[];
  lfos: OscillatorNode[];
  gainNodes: GainNode[];
  cleanup: () => void;
}

export class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeGraph: ActiveGraph | null = null;
  private currentTrackId: AmbientSoundId | null = null;
  private currentVolume = 0.5; // 0 to 1

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtx) return null;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    return this.ctx;
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    );
  }

  public getCurrentTrack(): AmbientSoundId | null {
    return this.currentTrackId;
  }

  public isPlaying(): boolean {
    return this.activeGraph !== null;
  }

  public setVolume(volume0to100: number): void {
    const vol = Math.max(0, Math.min(100, volume0to100)) / 100;
    this.currentVolume = vol;

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(vol, now + 0.05);
    }
  }

  public async play(trackId: AmbientSoundId, crossfadeMs = 1200): Promise<void> {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) {
      throw new Error('Web Audio API not supported in this browser');
    }

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // If changing track or restarting, smoothly fade out current sound
    if (this.activeGraph) {
      await this.stop(crossfadeMs / 2);
    }

    this.currentTrackId = trackId;

    // Create the procedural sound graph for this track
    const graph = this.buildSoundGraph(ctx, trackId);
    this.activeGraph = graph;

    // Smooth fade in
    const now = ctx.currentTime;
    const fadeDuration = crossfadeMs / 1000;
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(this.currentVolume, now + fadeDuration);
  }

  public async stop(fadeMs = 800): Promise<void> {
    if (!this.activeGraph || !this.ctx || !this.masterGain) {
      this.activeGraph = null;
      this.currentTrackId = null;
      return;
    }

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const fadeDuration = Math.max(0.05, fadeMs / 1000);

    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + fadeDuration);

    const graphToClean = this.activeGraph;
    this.activeGraph = null;
    this.currentTrackId = null;

    return new Promise<void>((resolve) => {
      window.setTimeout(() => {
        try {
          graphToClean.cleanup();
        } catch {
          // Ignore cleanup errors
        }
        resolve();
      }, fadeMs + 50);
    });
  }

  // =========================================================================
  // Sound Graph Builders
  // =========================================================================

  private buildSoundGraph(ctx: AudioContext, trackId: AmbientSoundId): ActiveGraph {
    switch (trackId) {
      case 'white-noise':
        return this.createWhiteNoise(ctx);
      case 'pink-noise':
        return this.createPinkNoise(ctx);
      case 'brown-noise':
        return this.createBrownNoise(ctx);
      case 'rain-soft':
        return this.createRain(ctx, false);
      case 'rain-thunder':
        return this.createRain(ctx, true);
      case 'ocean-waves':
        return this.createOceanWaves(ctx);
      case 'river-stream':
        return this.createRiverStream(ctx);
      case 'forest':
        return this.createForest(ctx);
      case 'cafe-ambient':
        return this.createCafe(ctx);
      case 'library':
        return this.createLibrary(ctx);
      case 'focus-binaural':
        return this.createBinauralBeats(ctx);
      case 'lofi-beats':
        return this.createLofiBeats(ctx);
      default:
        return this.createPinkNoise(ctx);
    }
  }

  /**
   * Generates a 5-second seamless stereo audio buffer using a channel generator function.
   */
  private createStereoBuffer(
    ctx: AudioContext,
    durationSec: number,
    generateChannel: (data: Float32Array, sampleRate: number) => void,
  ): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const frameCount = sampleRate * durationSec;
    const buffer = ctx.createBuffer(2, frameCount, sampleRate);

    generateChannel(buffer.getChannelData(0), sampleRate);
    generateChannel(buffer.getChannelData(1), sampleRate);

    return buffer;
  }

  private createWhiteNoise(ctx: AudioContext): ActiveGraph {
    const buffer = this.createStereoBuffer(ctx, 4, (data) => {
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
    });

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = 0.35;

    source.connect(gain);
    gain.connect(this.masterGain!);
    source.start();

    return {
      sources: [source],
      filters: [],
      lfos: [],
      gainNodes: [gain],
      cleanup: () => {
        source.stop();
        source.disconnect();
        gain.disconnect();
      },
    };
  }

  private createPinkNoise(ctx: AudioContext): ActiveGraph {
    const buffer = this.createStereoBuffer(ctx, 5, (data) => {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
        b6 = white * 0.115926;
      }
    });

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = 0.55;

    source.connect(gain);
    gain.connect(this.masterGain!);
    source.start();

    return {
      sources: [source],
      filters: [],
      lfos: [],
      gainNodes: [gain],
      cleanup: () => {
        source.stop();
        source.disconnect();
        gain.disconnect();
      },
    };
  }

  private createBrownNoise(ctx: AudioContext): ActiveGraph {
    const buffer = this.createStereoBuffer(ctx, 5, (data) => {
      let lastOut = 0.0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 2.8; // Gain compensation
      }
    });

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = 0.65;

    source.connect(gain);
    gain.connect(this.masterGain!);
    source.start();

    return {
      sources: [source],
      filters: [],
      lfos: [],
      gainNodes: [gain],
      cleanup: () => {
        source.stop();
        source.disconnect();
        gain.disconnect();
      },
    };
  }

  private createRain(ctx: AudioContext, withThunder = false): ActiveGraph {
    // Rain bed: pink noise with lowpass filter
    const rainBuffer = this.createStereoBuffer(ctx, 5, (data) => {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }
    });

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.value = 1200;
    rainFilter.Q.value = 0.6;

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.6;

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.masterGain!);
    rainSource.start();

    const sources: (AudioBufferSourceNode | OscillatorNode)[] = [rainSource];
    const filters: BiquadFilterNode[] = [rainFilter];
    const gainNodes: GainNode[] = [rainGain];
    const lfos: OscillatorNode[] = [];

    // Optional thunder: low rumble oscillation
    if (withThunder) {
      const thunderBuffer = this.createStereoBuffer(ctx, 6, (data) => {
        let lastOut = 0.0;
        for (let i = 0; i < data.length; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.015 * white) / 1.015;
          lastOut = data[i];
          data[i] *= 3.5;
        }
      });

      const thunderSource = ctx.createBufferSource();
      thunderSource.buffer = thunderBuffer;
      thunderSource.loop = true;

      const thunderFilter = ctx.createBiquadFilter();
      thunderFilter.type = 'lowpass';
      thunderFilter.frequency.value = 140;
      thunderFilter.Q.value = 2.5;

      const thunderGain = ctx.createGain();
      thunderGain.gain.value = 0.45;

      thunderSource.connect(thunderFilter);
      thunderFilter.connect(thunderGain);
      thunderGain.connect(this.masterGain!);
      thunderSource.start();

      sources.push(thunderSource);
      filters.push(thunderFilter);
      gainNodes.push(thunderGain);
    }

    return {
      sources,
      filters,
      lfos,
      gainNodes,
      cleanup: () => {
        sources.forEach((s) => {
          try {
            s.stop();
            s.disconnect();
          } catch {
            // ignore
          }
        });
        filters.forEach((f) => f.disconnect());
        gainNodes.forEach((g) => g.disconnect());
      },
    };
  }

  private createOceanWaves(ctx: AudioContext): ActiveGraph {
    // Ocean surf: brown noise modulated by slow LFO sine
    const buffer = this.createStereoBuffer(ctx, 8, (data) => {
      let lastOut = 0.0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.0;
      }
    });

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter sweeps from 180Hz to 600Hz
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 380;
    filter.Q.value = 1.0;

    // Wave swell gain modulated by LFO
    const waveGain = ctx.createGain();
    waveGain.gain.value = 0.4;

    // LFO at ~0.11 Hz (~9 seconds wave period)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.11;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.28;

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    source.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain!);

    source.start();
    lfo.start();

    return {
      sources: [source],
      filters: [filter],
      lfos: [lfo],
      gainNodes: [waveGain, lfoGain],
      cleanup: () => {
        try {
          source.stop();
          source.disconnect();
          lfo.stop();
          lfo.disconnect();
        } catch {
          // ignore
        }
        filter.disconnect();
        waveGain.disconnect();
        lfoGain.disconnect();
      },
    };
  }

  private createRiverStream(ctx: AudioContext): ActiveGraph {
    const buffer = this.createStereoBuffer(ctx, 5, (data) => {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }
    });

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Bandpass water stream
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1100;
    bandpass.Q.value = 1.3;

    const gain = ctx.createGain();
    gain.gain.value = 0.6;

    // Gentle ripple LFO
    const rippleLfo = ctx.createOscillator();
    rippleLfo.type = 'sine';
    rippleLfo.frequency.value = 0.55;

    const rippleGain = ctx.createGain();
    rippleGain.gain.value = 0.12;

    rippleLfo.connect(rippleGain);
    rippleGain.connect(gain.gain);

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain!);

    source.start();
    rippleLfo.start();

    return {
      sources: [source],
      filters: [bandpass],
      lfos: [rippleLfo],
      gainNodes: [gain, rippleGain],
      cleanup: () => {
        try {
          source.stop();
          source.disconnect();
          rippleLfo.stop();
          rippleLfo.disconnect();
        } catch {
          // ignore
        }
        bandpass.disconnect();
        gain.disconnect();
        rippleGain.disconnect();
      },
    };
  }

  private createForest(ctx: AudioContext): ActiveGraph {
    // Gentle foliage breeze
    const buffer = this.createStereoBuffer(ctx, 6, (data) => {
      let lastOut = 0.0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.01 * white) / 1.01;
        lastOut = data[i];
        data[i] *= 2.0;
      }
    });

    const breeze = ctx.createBufferSource();
    breeze.buffer = buffer;
    breeze.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 650;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.value = 0.5;

    breeze.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    breeze.start();

    return {
      sources: [breeze],
      filters: [filter],
      lfos: [],
      gainNodes: [gain],
      cleanup: () => {
        try {
          breeze.stop();
          breeze.disconnect();
        } catch {
          // ignore
        }
        filter.disconnect();
        gain.disconnect();
      },
    };
  }

  private createCafe(ctx: AudioContext): ActiveGraph {
    // Warm room murmur bandpass
    const buffer = this.createStereoBuffer(ctx, 6, (data) => {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }
    });

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 650;
    bandpass.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.value = 0.45;

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain!);
    source.start();

    return {
      sources: [source],
      filters: [bandpass],
      lfos: [],
      gainNodes: [gain],
      cleanup: () => {
        try {
          source.stop();
          source.disconnect();
        } catch {
          // ignore
        }
        bandpass.disconnect();
        gain.disconnect();
      },
    };
  }

  private createLibrary(ctx: AudioContext): ActiveGraph {
    // Ultra soft lowpass brown noise, feeling of deep calm silence
    const buffer = this.createStereoBuffer(ctx, 5, (data) => {
      let lastOut = 0.0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.012 * white) / 1.012;
        lastOut = data[i];
        data[i] *= 2.2;
      }
    });

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 260;
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.value = 0.35;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    source.start();

    return {
      sources: [source],
      filters: [filter],
      lfos: [],
      gainNodes: [gain],
      cleanup: () => {
        try {
          source.stop();
          source.disconnect();
        } catch {
          // ignore
        }
        filter.disconnect();
        gain.disconnect();
      },
    };
  }

  private createBinauralBeats(ctx: AudioContext): ActiveGraph {
    // Beta beat (14 Hz differential) for concentration and focus:
    // Left ear: 216 Hz, Right ear: 230 Hz
    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.value = 216;

    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.value = 230;

    // Stereo routing using ChannelMerger
    const merger = ctx.createChannelMerger(2);
    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();
    leftGain.gain.value = 0.22;
    rightGain.gain.value = 0.22;

    oscLeft.connect(leftGain);
    oscRight.connect(rightGain);

    leftGain.connect(merger, 0, 0); // left channel
    rightGain.connect(merger, 0, 1); // right channel

    // Subtle pink noise bed to make listening pleasant
    const bedBuffer = this.createStereoBuffer(ctx, 4, (data) => {
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.05;
      }
    });

    const bedSource = ctx.createBufferSource();
    bedSource.buffer = bedBuffer;
    bedSource.loop = true;

    const bedGain = ctx.createGain();
    bedGain.gain.value = 0.15;

    bedSource.connect(bedGain);

    merger.connect(this.masterGain!);
    bedGain.connect(this.masterGain!);

    oscLeft.start();
    oscRight.start();
    bedSource.start();

    return {
      sources: [oscLeft, oscRight, bedSource],
      filters: [],
      lfos: [],
      gainNodes: [leftGain, rightGain, bedGain],
      cleanup: () => {
        try {
          oscLeft.stop();
          oscLeft.disconnect();
          oscRight.stop();
          oscRight.disconnect();
          bedSource.stop();
          bedSource.disconnect();
        } catch {
          // ignore
        }
        leftGain.disconnect();
        rightGain.disconnect();
        bedGain.disconnect();
        merger.disconnect();
      },
    };
  }

  private createLofiBeats(ctx: AudioContext): ActiveGraph {
    // Mellow chord progression drone + vinyl crackle
    // D minor 9th pad: D3 (146.8 Hz), F3 (174.6 Hz), A3 (220.0 Hz), C4 (261.6 Hz), E4 (329.6 Hz)
    const freqs = [146.83, 174.61, 220.0, 261.63, 329.63];
    const oscillators: OscillatorNode[] = [];
    const oscGains: GainNode[] = [];

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 420;
    padFilter.Q.value = 1.2;

    const padMasterGain = ctx.createGain();
    padMasterGain.gain.value = 0.22;

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const g = ctx.createGain();
      g.gain.value = 0.18;

      osc.connect(g);
      g.connect(padFilter);
      osc.start();

      oscillators.push(osc);
      oscGains.push(g);
    });

    padFilter.connect(padMasterGain);
    padMasterGain.connect(this.masterGain!);

    // Vinyl crackle generator
    const crackleBuffer = this.createStereoBuffer(ctx, 4, (data) => {
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.25 : 0;
      }
    });

    const crackleSource = ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;

    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.3;

    crackleSource.connect(crackleGain);
    crackleGain.connect(this.masterGain!);
    crackleSource.start();

    return {
      sources: [...oscillators, crackleSource],
      filters: [padFilter],
      lfos: [],
      gainNodes: [...oscGains, padMasterGain, crackleGain],
      cleanup: () => {
        oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // ignore
          }
        });
        try {
          crackleSource.stop();
          crackleSource.disconnect();
        } catch {
          // ignore
        }
        oscGains.forEach((g) => g.disconnect());
        padFilter.disconnect();
        padMasterGain.disconnect();
        crackleGain.disconnect();
      },
    };
  }
}

// Global shared singleton instance for client-side playback
let synthInstance: AmbientSynthesizer | null = null;

export function getAmbientSynthesizer(): AmbientSynthesizer {
  if (!synthInstance) {
    synthInstance = new AmbientSynthesizer();
  }
  return synthInstance;
}

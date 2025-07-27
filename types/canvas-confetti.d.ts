declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: Array<'square' | 'circle'>;
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  interface confetti {
    (options?: Options): Promise<null> | null;
    reset(): void;
  }

  const confetti: confetti;
  export default confetti;
}
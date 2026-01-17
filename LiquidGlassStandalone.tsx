'use client';

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { motion, type MotionValue, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from 'motion/react';

/* ----------------------------- tiny utilities ---------------------------- */

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function isMotionValue<T = any>(v: unknown): v is MotionValue<T> {
  return !!v && typeof v === 'object' && typeof (v as any).get === 'function';
}

export function getValueOrMotion<T>(value: T | MotionValue<T>): T {
  return isMotionValue<T>(value) ? value.get() : value;
}

/* -------------------------- browser canvas shims ------------------------- */
/** Browser-safe replacement for Node's `canvas` package */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  return canvas;
}

/** Browser-safe ImageData creation */
export function createImageData(width: number, height: number): ImageData {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));

  // Prefer native ImageData when available
  if (typeof ImageData !== 'undefined') {
    try {
      return new ImageData(w, h);
    } catch {
      // fall through
    }
  }
  // Fallback via 2D context
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Failed to create ImageData (no 2D context)');
  return ctx.createImageData(w, h);
}

function imageDataToUrl(imageData: ImageData): string {
  const canvas = createCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

/* ------------------------------ liquid math ------------------------------ */

export type SurfaceFnDef = {
  title: string;
  fn: (x: number) => number;
};

export const CONVEX_CIRCLE: SurfaceFnDef = {
  title: 'Convex Circle',
  fn: (x) => Math.sqrt(1 - (1 - x) ** 2),
};

export const CONVEX: SurfaceFnDef = {
  title: 'Convex Squircle',
  fn: (x) => Math.pow(1 - Math.pow(1 - x, 4), 1 / 4),
};

export const CONCAVE: SurfaceFnDef = {
  title: 'Concave',
  fn: (x) => 1 - CONVEX_CIRCLE.fn(x),
};

export const LIP: SurfaceFnDef = {
  title: 'Lip',
  fn: (x) => {
    const convex = CONVEX.fn(x * 2);
    const concave = CONCAVE.fn(x) + 0.1;
    const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
    return convex * (1 - smootherstep) + concave * smootherstep;
  },
};

export const WAVE: SurfaceFnDef = {
  title: 'Wave',
  fn: (x) => {
    const base = Math.pow(x, 0.5);
    const wave = Math.sin(x * Math.PI * 3) * 0.1;
    return Math.max(0, Math.min(1, base + wave));
  },
};

export const STEPPED: SurfaceFnDef = {
  title: 'Stepped',
  fn: (x) => {
    const steps = 4;
    const stepSize = 1 / steps;
    const stepIndex = Math.floor(x / stepSize);
    const stepProgress = (x % stepSize) / stepSize;
    const stepHeight = stepIndex / (steps - 1);
    const smoothing = Math.pow(stepProgress, 3) * (stepProgress * (stepProgress * 6 - 15) + 10);
    return stepHeight + smoothing * (1 / (steps - 1));
  },
};

export const ELASTIC: SurfaceFnDef = {
  title: 'Elastic',
  fn: (x) => {
    if (x === 0) return 0;
    if (x === 1) return 1;
    const p = 0.3;
    const s = p / 4;
    return Math.pow(2, -10 * x) * Math.sin(((x - s) * (2 * Math.PI)) / p) + 1;
  },
};

export const BUBBLE: SurfaceFnDef = {
  title: 'Bubble',
  fn: (x) => {
    const center = 0.6;
    const width = 0.4;
    const height = 1.2;
    const distance = Math.abs(x - center) / width;
    if (distance > 1) return 0;
    const bubble = Math.sqrt(1 - distance * distance) * height;
    const base = Math.pow(x, 2);
    return Math.max(0, Math.min(1, Math.max(base, bubble)));
  },
};

export const fns: SurfaceFnDef[] = [CONVEX_CIRCLE, CONVEX, CONCAVE, LIP, WAVE, STEPPED, ELASTIC, BUBBLE];

function calculateRefractionProfile(
  glassThickness = 200,
  bezelWidth = 50,
  bezelHeightFn: (x: number) => number = (x) => x,
  refractiveIndex = 1.5,
  samples = 128
): number[] {
  const eta = 1 / refractiveIndex;

  // Simplified refraction for vertical incident ray [0, 1]
  function refract(normalX: number, normalY: number): [number, number] | null {
    const dot = normalY;
    const k = 1 - eta * eta * (1 - dot * dot);
    if (k < 0) return null; // total internal reflection
    const kSqrt = Math.sqrt(k);
    return [-(eta * dot + kSqrt) * normalX, eta - (eta * dot + kSqrt) * normalY];
  }

  return Array.from({ length: samples }, (_, i) => {
    const x = i / samples;
    const y = bezelHeightFn(x);

    const dx = x < 1 ? 0.0001 : -0.0001;
    const y2 = bezelHeightFn(x + dx);
    const derivative = (y2 - y) / dx;
    const magnitude = Math.sqrt(derivative * derivative + 1);
    const normal: [number, number] = [-derivative / magnitude, -1 / magnitude];

    const refracted = refract(normal[0], normal[1]);
    if (!refracted) return 0;

    const remainingHeightOnBezel = y * bezelWidth;
    const remainingHeight = remainingHeightOnBezel + glassThickness;
    return refracted[0] * (remainingHeight / refracted[1]);
  });
}

function generateDisplacementImageData(
  canvasWidth: number,
  canvasHeight: number,
  objectWidth: number,
  objectHeight: number,
  radius: number,
  bezelWidth: number,
  maximumDisplacement: number,
  refractionProfile: number[],
  dpr?: number
) {
  const devicePixelRatio = dpr ?? (typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1);

  const bufferWidth = Math.max(1, Math.floor(canvasWidth * devicePixelRatio));
  const bufferHeight = Math.max(1, Math.floor(canvasHeight * devicePixelRatio));
  const imageData = createImageData(bufferWidth, bufferHeight);

  // Neutral displacement (R=128, G=128) in ABGR for Uint32 fill
  const neutral = 0xff008080;
  new Uint32Array(imageData.data.buffer).fill(neutral);

  const radius_ = radius * devicePixelRatio;
  const bezel = bezelWidth * devicePixelRatio;

  const radiusSquared = radius_ ** 2;
  const radiusPlusOneSquared = (radius_ + 1) ** 2;
  const radiusMinusBezelSquared = (radius_ - bezel) ** 2;

  const objectWidth_ = objectWidth * devicePixelRatio;
  const objectHeight_ = objectHeight * devicePixelRatio;
  const widthBetweenRadiuses = objectWidth_ - radius_ * 2;
  const heightBetweenRadiuses = objectHeight_ - radius_ * 2;

  const objectX = (bufferWidth - objectWidth_) / 2;
  const objectY = (bufferHeight - objectHeight_) / 2;

  for (let y1 = 0; y1 < objectHeight_; y1++) {
    for (let x1 = 0; x1 < objectWidth_; x1++) {
      const idx = ((objectY + y1) * bufferWidth + objectX + x1) * 4;

      const isOnLeftSide = x1 < radius_;
      const isOnRightSide = x1 >= objectWidth_ - radius_;
      const isOnTopSide = y1 < radius_;
      const isOnBottomSide = y1 >= objectHeight_ - radius_;

      const x = isOnLeftSide ? x1 - radius_ : isOnRightSide ? x1 - radius_ - widthBetweenRadiuses : 0;
      const y = isOnTopSide ? y1 - radius_ : isOnBottomSide ? y1 - radius_ - heightBetweenRadiuses : 0;

      const distanceToCenterSquared = x * x + y * y;

      const isInBezel =
        distanceToCenterSquared <= radiusPlusOneSquared &&
        distanceToCenterSquared >= radiusMinusBezelSquared;

      if (isInBezel) {
        const opacity =
          distanceToCenterSquared < radiusSquared
            ? 1
            : 1 -
              (Math.sqrt(distanceToCenterSquared) - Math.sqrt(radiusSquared)) /
                (Math.sqrt(radiusPlusOneSquared) - Math.sqrt(radiusSquared));

        const distanceFromCenter = Math.sqrt(distanceToCenterSquared);
        const distanceFromSide = radius_ - distanceFromCenter;

        const cos = x / distanceFromCenter;
        const sin = y / distanceFromCenter;

        const bezelIndex = ((distanceFromSide / bezel) * refractionProfile.length) | 0;
        const distance = refractionProfile[bezelIndex] ?? 0;

        const dX = (-cos * distance) / maximumDisplacement;
        const dY = (-sin * distance) / maximumDisplacement;

        imageData.data[idx] = 128 + dX * 127 * opacity; // R
        imageData.data[idx + 1] = 128 + dY * 127 * opacity; // G
        imageData.data[idx + 2] = 0; // B
        imageData.data[idx + 3] = 255; // A
      }
    }
  }

  return imageData;
}

export const getDisplacementData = ({
  glassThickness = 200,
  bezelWidth = 50,
  bezelHeightFn = (x: number) => x,
  refractiveIndex = 1.5,
  samples = 128,
  canvasWidth,
  canvasHeight,
  objectWidth,
  objectHeight,
  radius,
  dpr,
}: {
  glassThickness?: number;
  bezelWidth?: number;
  bezelHeightFn?: (x: number) => number;
  refractiveIndex?: number;
  samples?: number;
  canvasWidth: number;
  canvasHeight: number;
  objectWidth: number;
  objectHeight: number;
  radius: number;
  dpr?: number;
}) => {
  const refractionProfile = calculateRefractionProfile(
    glassThickness,
    bezelWidth,
    bezelHeightFn,
    refractiveIndex,
    samples
  );

  const maximumDisplacement = Math.max(...refractionProfile.map((v) => Math.abs(v)), 1e-6);

  const displacementMap = generateDisplacementImageData(
    canvasWidth,
    canvasHeight,
    objectWidth,
    objectHeight,
    radius,
    bezelWidth,
    maximumDisplacement,
    refractionProfile,
    dpr
  );

  return { displacementMap, maximumDisplacement };
};

export function calculateRefractionSpecular(
  objectWidth: number,
  objectHeight: number,
  radius: number,
  bezelWidth: number,
  specularAngle = Math.PI / 3,
  dpr?: number
) {
  const devicePixelRatio = dpr ?? (typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1);

  const bufferWidth = Math.max(1, Math.floor(objectWidth * devicePixelRatio));
  const bufferHeight = Math.max(1, Math.floor(objectHeight * devicePixelRatio));
  const imageData = createImageData(bufferWidth, bufferHeight);

  const radius_ = radius * devicePixelRatio;
  const bezel_ = bezelWidth * devicePixelRatio;

  const specular_vector = [Math.cos(specularAngle), Math.sin(specularAngle)];

  // transparent
  const neutral = 0x00000000;
  new Uint32Array(imageData.data.buffer).fill(neutral);

  const radiusSquared = radius_ ** 2;
  const radiusPlusOneSquared = (radius_ + devicePixelRatio) ** 2;
  const radiusMinusBezelSquared = (radius_ - bezel_) ** 2;

  const widthBetweenRadiuses = bufferWidth - radius_ * 2;
  const heightBetweenRadiuses = bufferHeight - radius_ * 2;

  for (let y1 = 0; y1 < bufferHeight; y1++) {
    for (let x1 = 0; x1 < bufferWidth; x1++) {
      const idx = (y1 * bufferWidth + x1) * 4;

      const isOnLeftSide = x1 < radius_;
      const isOnRightSide = x1 >= bufferWidth - radius_;
      const isOnTopSide = y1 < radius_;
      const isOnBottomSide = y1 >= bufferHeight - radius_;

      const x = isOnLeftSide ? x1 - radius_ : isOnRightSide ? x1 - radius_ - widthBetweenRadiuses : 0;
      const y = isOnTopSide ? y1 - radius_ : isOnBottomSide ? y1 - radius_ - heightBetweenRadiuses : 0;

      const distanceToCenterSquared = x * x + y * y;

      const isInBezel =
        distanceToCenterSquared <= radiusPlusOneSquared &&
        distanceToCenterSquared >= radiusMinusBezelSquared;

      if (isInBezel) {
        const distanceFromCenter = Math.sqrt(distanceToCenterSquared);
        const distanceFromSide = radius_ - distanceFromCenter;

        const opacity =
          distanceToCenterSquared < radiusSquared
            ? 1
            : 1 -
              (distanceFromCenter - Math.sqrt(radiusSquared)) /
                (Math.sqrt(radiusPlusOneSquared) - Math.sqrt(radiusSquared));

        const cos = x / distanceFromCenter;
        const sin = -y / distanceFromCenter;

        const dotProduct = Math.abs(cos * specular_vector[0]! + sin * specular_vector[1]!);

        const coefficient = dotProduct * Math.sqrt(1 - (1 - distanceFromSide / (1 * devicePixelRatio)) ** 2);

        const color = 255 * coefficient;
        const finalOpacity = color * coefficient * opacity;

        imageData.data[idx] = color;
        imageData.data[idx + 1] = color;
        imageData.data[idx + 2] = color;
        imageData.data[idx + 3] = finalOpacity;
      }
    }
  }

  return imageData;
}

/* ------------------------ size observation + radius ---------------------- */

const getBorderRadius = (element: HTMLElement, rect: DOMRect): number => {
  const computedStyle = getComputedStyle(element);
  const rawRadius = computedStyle.borderRadius;

  if (!rawRadius || rawRadius === '0px') return 0;

  const parsedRadius = parseFloat(rawRadius);
  if (Number.isNaN(parsedRadius)) return 0;

  // Handle scientific notation or very large values (rounded-full)
  if (parsedRadius > 9999 || rawRadius.includes('e+') || rawRadius.includes('E+')) {
    return Math.min(rect.width, rect.height) / 2;
  }

  return parsedRadius;
};

const useMotionSizeObservers = <T extends HTMLElement = HTMLDivElement>(
  containerRef: React.RefObject<T | null>,
  disabled: boolean = false
) => {
  const width = useSpring(1, { stiffness: 200, damping: 40 });
  const height = useSpring(1, { stiffness: 200, damping: 40 });
  const borderRadius = useSpring(0, { stiffness: 200, damping: 40 });

  const isUpdating = useRef(false);

  const updateDimensions = () => {
    if (!containerRef.current || disabled || isUpdating.current) return;

    isUpdating.current = true;

    const rect = containerRef.current.getBoundingClientRect();
    const borderRadiusValue = getBorderRadius(containerRef.current, rect);

    const newWidth = Math.max(rect.width, 1);
    const newHeight = Math.max(rect.height, 1);
    const newRadius = Math.max(borderRadiusValue, 0);

    if (Math.abs(width.get() - newWidth) > 0.5) width.set(newWidth);
    if (Math.abs(height.get() - newHeight) > 0.5) height.set(newHeight);
    if (Math.abs(borderRadius.get() - newRadius) > 0.5) borderRadius.set(newRadius);

    window.setTimeout(() => {
      isUpdating.current = false;
    }, 16);
  };

  useLayoutEffect(() => {
    if (!containerRef.current || disabled) return;

    const resizeObserver = new ResizeObserver(() => updateDimensions());
    resizeObserver.observe(containerRef.current);
    updateDimensions();

    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  useEffect(() => {
    if (!containerRef.current || disabled) return;

    let timeoutId: number | undefined;

    const mutationObserver = new MutationObserver(() => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(updateDimensions, 100);
    });

    mutationObserver.observe(containerRef.current, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      mutationObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  return { width, height, borderRadius };
};

/* ------------------------------- LiquidFilter ---------------------------- */

export type LiquidFilterProps = {
  id: string;
  filterOnly?: boolean;
  scaleRatio?: MotionValue<number>;
  canvasWidth?: number | MotionValue<number>;
  canvasHeight?: number | MotionValue<number>;
  width: number | MotionValue<number>;
  height: number | MotionValue<number>;
  radius: number | MotionValue<number>;
  /** SVG Gauss blur */
  blur?: number | MotionValue<number>;
  /** Glass thickness (bigger = stronger translations) */
  glassThickness?: number | MotionValue<number>;
  /** Width of curved edge */
  bezelWidth?: number | MotionValue<number>;
  /** Snell’s law refractive index */
  refractiveIndex?: number | MotionValue<number>;
  /** Opacity of border highlight */
  specularOpacity?: number | MotionValue<number>;
  /** Saturation multiplier */
  specularSaturation?: number | MotionValue<number>;
  dpr?: number | MotionValue<number>;
  /** Edge profile */
  bezelHeightFn?: (x: number) => number;
};

export const LiquidFilter: React.FC<LiquidFilterProps> = ({
  id,
  filterOnly = false,
  canvasWidth,
  canvasHeight,
  width,
  height,
  radius,
  blur = 0.2,
  glassThickness = 40,
  bezelWidth: bezelWidthProp = 20,
  refractiveIndex = 1.5,
  scaleRatio,
  specularOpacity = 1,
  specularSaturation = 4,
  bezelHeightFn = CONVEX.fn,
  dpr,
}) => {
  // Render only on client to avoid SSR/client mismatch due to generated data URLs
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const displacementData = useTransform(() => {
    const canvasW = canvasWidth ? getValueOrMotion(canvasWidth) : getValueOrMotion(width);
    const canvasH = canvasHeight ? getValueOrMotion(canvasHeight) : getValueOrMotion(height);
    const devicePixelRatio = dpr ? getValueOrMotion(dpr) : 1;

    const clampedBezelWidth = Math.max(
      Math.min(getValueOrMotion(bezelWidthProp), 2 * getValueOrMotion(radius) - 1),
      0
    );

    return getDisplacementData({
      glassThickness: getValueOrMotion(glassThickness),
      bezelWidth: clampedBezelWidth,
      bezelHeightFn,
      refractiveIndex: getValueOrMotion(refractiveIndex),
      canvasWidth: canvasW,
      canvasHeight: canvasH,
      objectWidth: getValueOrMotion(width),
      objectHeight: getValueOrMotion(height),
      radius: getValueOrMotion(radius),
      dpr: devicePixelRatio,
    });
  });

  const specularLayer = useTransform(() => {
    const devicePixelRatio = dpr ? getValueOrMotion(dpr) : 1;
    // NOTE: hard-coded 50 (same as your pasted code) — feel free to expose if needed
    return calculateRefractionSpecular(
      getValueOrMotion(width),
      getValueOrMotion(height),
      getValueOrMotion(radius),
      50,
      undefined,
      devicePixelRatio
    );
  });

  const displacementMapDataUrl = useTransform(() => imageDataToUrl(displacementData.get().displacementMap));
  const specularLayerDataUrl = useTransform(() => imageDataToUrl(specularLayer.get()));
  const scale = useTransform(() => displacementData.get().maximumDisplacement * (scaleRatio?.get() ?? 1));

  const blurMV = useTransform(() => getValueOrMotion(blur));
  const specSatMV = useTransform(() => String(getValueOrMotion(specularSaturation)));
  const specOpMV = useTransform(() => getValueOrMotion(specularOpacity));

  const wMV = useTransform(() => (canvasWidth ? getValueOrMotion(canvasWidth) : getValueOrMotion(width)));
  const hMV = useTransform(() => (canvasHeight ? getValueOrMotion(canvasHeight) : getValueOrMotion(height)));

  const content = (
    <filter id={id}>
      <motion.feGaussianBlur in="SourceGraphic" stdDeviation={blurMV} result="blurred_source" />

      <motion.feImage href={displacementMapDataUrl} x={0} y={0} width={wMV} height={hMV} result="displacement_map" />

      <motion.feDisplacementMap
        in="blurred_source"
        in2="displacement_map"
        scale={scale}
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />

      <motion.feColorMatrix in="displaced" type="saturate" values={specSatMV as any} result="displaced_saturated" />

      <motion.feImage href={specularLayerDataUrl} x={0} y={0} width={wMV} height={hMV} result="specular_layer" />

      <feComposite in="displaced_saturated" in2="specular_layer" operator="in" result="specular_saturated" />

      <feComponentTransfer in="specular_layer" result="specular_faded">
        <motion.feFuncA type="linear" slope={specOpMV} />
      </feComponentTransfer>

      <motion.feBlend in="specular_saturated" in2="displaced" mode="normal" result="withSaturation" />
      <motion.feBlend in="specular_faded" in2="withSaturation" mode="normal" />
    </filter>
  );

  if (!isMounted) return null;

  return filterOnly ? (
    content
  ) : (
    <svg colorInterpolationFilters="sRGB" style={{ display: 'none' }}>
      <defs>{content}</defs>
    </svg>
  );
};

/* --------------------------- LiquidGlass public API ---------------------- */

export interface LiquidGlassProps<T extends HTMLElement = HTMLDivElement>
  extends Pick<
    LiquidFilterProps,
    | 'glassThickness'
    | 'bezelWidth'
    | 'blur'
    | 'bezelHeightFn'
    | 'refractiveIndex'
    | 'specularOpacity'
    | 'specularSaturation'
    | 'dpr'
  > {
  targetRef?: React.RefObject<T | null>;
  width?: MotionValue<number>;
  height?: MotionValue<number>;
  borderRadius?: MotionValue<number>;
}

export const useLiquidSurface = <T extends HTMLElement = HTMLDivElement>({
  targetRef,
  width: widthProp,
  height: heightProp,
  borderRadius: borderRadiusProp,
  ...props
}: LiquidGlassProps<T>) => {
  const filterId = `glass-${useId()}`;
  const rawRef = useRef<T>(null);
  const ref = targetRef ?? rawRef;

  const usePropValues = !!(widthProp && heightProp && borderRadiusProp);
  const { width: observedWidth, height: observedHeight, borderRadius: observedRadius } = useMotionSizeObservers(
    ref,
    Boolean(usePropValues)
  );

  const finalWidth = (usePropValues ? widthProp : observedWidth)!;
  const finalHeight = (usePropValues ? heightProp : observedHeight)!;
  const finalRadius = (usePropValues ? borderRadiusProp : observedRadius)!;

  const Filter = () => <LiquidFilter id={filterId} width={finalWidth} height={finalHeight} radius={finalRadius} {...props} />;

  const filterStyles: React.CSSProperties = {
    backdropFilter: `url(#${filterId})`,
    WebkitBackdropFilter: `url(#${filterId})`,
  };

  return { filterId, filterStyles, ref, Filter };
};

export const LiquidGlass: React.FC<LiquidGlassProps & HTMLMotionProps<'div'>> = ({
  children,
  glassThickness,
  bezelWidth,
  blur,
  bezelHeightFn,
  refractiveIndex,
  specularOpacity,
  specularSaturation,
  dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  targetRef,
  width,
  height,
  borderRadius,
  ...props
}) => {
  const { filterStyles, filterId, Filter, ref } = useLiquidSurface({
    glassThickness,
    bezelWidth,
    blur,
    bezelHeightFn,
    refractiveIndex,
    specularOpacity,
    specularSaturation,
    dpr,
    targetRef,
    width,
    height,
    borderRadius,
  });

  useEffect(() => {
    if (targetRef?.current) {
      targetRef.current.style.backdropFilter = `url(#${filterId})`;
      (targetRef.current.style as any).WebkitBackdropFilter = `url(#${filterId})`;
    }
  }, [filterId, targetRef]);

  return (
    <>
      <Filter />
      {!targetRef && (
        <LiquidDiv
          {...props}
          style={{
            ...props.style,
            ...filterStyles,
          }}
          filterId={filterId}
          ref={ref as any}
        >
          {children}
        </LiquidDiv>
      )}
    </>
  );
};

const LiquidDiv = React.forwardRef<HTMLDivElement, { filterId: string } & HTMLMotionProps<'div'>>(
  ({ children, filterId, className, ...props }, ref) => {
    const isLiquidSupported = useMotionValue(false);

    const supportsSVGFilters = useCallback(() => {
      const ua = navigator.userAgent;
      const isWebkit = /Safari/.test(ua) && !/Chrome/.test(ua);
      const isFirefox = /Firefox/.test(ua);

      if (isWebkit || isFirefox) return false;

      const div = document.createElement('div');
      div.style.backdropFilter = `url(#${filterId})`;
      return div.style.backdropFilter !== '';
    }, [filterId]);

    useEffect(() => {
      const ok = supportsSVGFilters();
      if (ok && typeof document !== 'undefined') isLiquidSupported.set(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <motion.div
        ref={ref}
        {...props}
        className={cn('bg-white/5', isLiquidSupported.get() ? '' : 'border', className)}
        style={{
          boxShadow: '0 3px 14px rgba(0,0,0,0.1)',
          ...props.style,
          ...(isLiquidSupported.get()
            ? {}
            : {
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }),
        }}
      >
        {children}
      </motion.div>
    );
  }
);
LiquidDiv.displayName = 'LiquidDiv';

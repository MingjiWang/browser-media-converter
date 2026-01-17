import { createCanvas, createImageData } from "canvas";
import type { Plugin } from "vite";

import { CONCAVE, CONVEX, CONVEX_CIRCLE, LIP } from "../src/lib/surfaceEquations";

// Inline displacement map calculation for Node.js (with canvas)
function calculateDisplacementMapNode(
    glassThickness: number = 200,
    bezelWidth: number = 50,
    bezelHeightFn: (x: number) => number = (x) => x,
    refractiveIndex: number = 1.5,
    samples: number = 128
): number[] {
    const eta = 1 / refractiveIndex;

    function refract(normalX: number, normalY: number): [number, number] | null {
        const dot = normalY;
        const k = 1 - eta * eta * (1 - dot * dot);
        if (k < 0) {
            return null;
        }
        const kSqrt = Math.sqrt(k);
        return [
            -(eta * dot + kSqrt) * normalX,
            eta - (eta * dot + kSqrt) * normalY,
        ];
    }

    return Array.from({ length: samples }, (_, i) => {
        const x = i / samples;
        const y = bezelHeightFn(x);

        const dx = x < 1 ? 0.0001 : -0.0001;
        const y2 = bezelHeightFn(x + dx);
        const derivative = (y2 - y) / dx;
        const magnitude = Math.sqrt(derivative * derivative + 1);
        const normal = [-derivative / magnitude, -1 / magnitude];
        const refracted = refract(normal[0], normal[1]);

        if (!refracted) {
            return 0;
        } else {
            const remainingHeightOnBezel = y * bezelWidth;
            const remainingHeight = remainingHeightOnBezel + glassThickness;
            return refracted[0] * (remainingHeight / refracted[1]);
        }
    });
}

function calculateDisplacementMap2Node(
    canvasWidth: number,
    canvasHeight: number,
    objectWidth: number,
    objectHeight: number,
    radius: number,
    bezelWidth: number,
    maximumDisplacement: number,
    precomputedDisplacementMap: number[] = [],
    dpr: number = 2
) {
    const bufferWidth = canvasWidth * dpr;
    const bufferHeight = canvasHeight * dpr;
    const imageData = createImageData(bufferWidth, bufferHeight);

    const neutral = 0xff008080;
    new Uint32Array(imageData.data.buffer).fill(neutral);

    const radius_ = radius * dpr;
    const bezel = bezelWidth * dpr;

    const radiusSquared = radius_ ** 2;
    const radiusPlusOneSquared = (radius_ + 1) ** 2;
    const radiusMinusBezelSquared = (radius_ - bezel) ** 2;

    const objectWidth_ = objectWidth * dpr;
    const objectHeight_ = objectHeight * dpr;
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

            const x = isOnLeftSide
                ? x1 - radius_
                : isOnRightSide
                    ? x1 - radius_ - widthBetweenRadiuses
                    : 0;

            const y = isOnTopSide
                ? y1 - radius_
                : isOnBottomSide
                    ? y1 - radius_ - heightBetweenRadiuses
                    : 0;

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

                const bezelIndex =
                    ((distanceFromSide / bezel) * precomputedDisplacementMap.length) | 0;
                const distance = precomputedDisplacementMap[bezelIndex] ?? 0;

                const dX = (-cos * distance) / maximumDisplacement;
                const dY = (-sin * distance) / maximumDisplacement;

                imageData.data[idx] = 128 + dX * 127 * opacity;
                imageData.data[idx + 1] = 128 + dY * 127 * opacity;
                imageData.data[idx + 2] = 0;
                imageData.data[idx + 3] = 255;
            }
        }
    }
    return imageData;
}

function calculateRefractionSpecularNode(
    objectWidth: number,
    objectHeight: number,
    radius: number,
    bezelWidth: number,
    specularAngle = Math.PI / 3,
    dpr: number = 2
) {
    const bufferWidth = objectWidth * dpr;
    const bufferHeight = objectHeight * dpr;
    const imageData = createImageData(bufferWidth, bufferHeight);

    const radius_ = radius * dpr;
    const bezel_ = bezelWidth * dpr;

    const specular_vector = [Math.cos(specularAngle), Math.sin(specularAngle)];

    const neutral = 0x00000000;
    new Uint32Array(imageData.data.buffer).fill(neutral);

    const radiusSquared = radius_ ** 2;
    const radiusPlusOneSquared = (radius_ + dpr) ** 2;
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

            const x = isOnLeftSide
                ? x1 - radius_
                : isOnRightSide
                    ? x1 - radius_ - widthBetweenRadiuses
                    : 0;

            const y = isOnTopSide
                ? y1 - radius_
                : isOnBottomSide
                    ? y1 - radius_ - heightBetweenRadiuses
                    : 0;

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

                const dotProduct = Math.abs(
                    cos * specular_vector[0] + sin * specular_vector[1]
                );

                const coefficient =
                    dotProduct *
                    Math.sqrt(1 - (1 - distanceFromSide / (1 * dpr)) ** 2);

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

function calculateMagnifyingDisplacementMapNode(
    width: number,
    height: number,
    dpr: number = 2
) {
    const bufferWidth = width * dpr;
    const bufferHeight = height * dpr;
    const imageData = createImageData(bufferWidth, bufferHeight);

    const centerX = bufferWidth / 2;
    const centerY = bufferHeight / 2;

    for (let y = 0; y < bufferHeight; y++) {
        for (let x = 0; x < bufferWidth; x++) {
            const idx = (y * bufferWidth + x) * 4;

            const dx = (x - centerX) / centerX;
            const dy = (y - centerY) / centerY;

            imageData.data[idx] = 128 + dx * 127;
            imageData.data[idx + 1] = 128 + dy * 127;
            imageData.data[idx + 2] = 0;
            imageData.data[idx + 3] = 255;
        }
    }

    return imageData;
}

/**
 * A custom Vite plugin to generate refraction displacement map assets for Vue.
 */
export default function refractionDisplacementMapPlugin(): Plugin {
    const displacementMapCache = new Map<
        string,
        { buffer: Buffer; maxDisplacement: number }
    >();
    const specularMapCache = new Map<string, Buffer>();
    const magnifyingMapCache = new Map<string, Buffer>();
    const hashToParamsMap = new Map<string, any>();

    function parseParams(id: string): {
        width?: number;
        height?: number;
        radius?: number;
        bezelWidth?: number;
        glassThickness?: number;
        refractiveIndex?: number;
        specularSaturation?: number;
        blur?: number;
        magnify?: boolean;
        bezelType?: "convex_circle" | "convex_squircle" | "concave" | "lip";
    } {
        const url = new URL(id);
        const params: any = {};

        if (url.searchParams.has("width"))
            params.width = parseInt(url.searchParams.get("width")!);
        if (url.searchParams.has("height"))
            params.height = parseInt(url.searchParams.get("height")!);
        if (url.searchParams.has("radius"))
            params.radius = parseInt(url.searchParams.get("radius")!);
        if (url.searchParams.has("bezelWidth"))
            params.bezelWidth = parseInt(url.searchParams.get("bezelWidth")!);
        if (url.searchParams.has("glassThickness"))
            params.glassThickness = parseInt(url.searchParams.get("glassThickness")!);
        if (url.searchParams.has("refractiveIndex"))
            params.refractiveIndex = parseFloat(
                url.searchParams.get("refractiveIndex")!
            );
        if (url.searchParams.has("magnify"))
            params.magnify = url.searchParams.get("magnify") === "true";
        if (url.searchParams.has("bezelType")) {
            const bezelType = url.searchParams.get("bezelType");
            if (
                bezelType === "convex_circle" ||
                bezelType === "convex_squircle" ||
                bezelType === "concave" ||
                bezelType === "lip"
            ) {
                params.bezelType = bezelType;
            }
        }

        return params;
    }

    function getCacheKey(params: any): string {
        return JSON.stringify(params);
    }

    function paramsToHash(params: any): string {
        const str = JSON.stringify(params);
        let hash = 0;
        if (str.length === 0) return hash.toString(36);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        const hashString = Math.abs(hash).toString(36);
        hashToParamsMap.set(hashString, params);
        return hashString;
    }

    function hashToParams(hashString: string): any {
        return hashToParamsMap.get(hashString) || {};
    }

    function generateDisplacementMap(customParams: any = {}): {
        buffer: Buffer;
        maxDisplacement: number;
    } {
        const defaults = {
            height: 150,
            width: 150,
            radius: 75,
            bezelWidth: 40,
            glassThickness: 120,
            refractiveIndex: 1.5,
            bezelType: "convex_squircle",
        };

        const params = { ...defaults, ...customParams };
        const {
            height,
            width,
            radius,
            bezelWidth,
            glassThickness,
            refractiveIndex,
            bezelType,
        } = params;

        let surfaceFn;
        switch (bezelType) {
            case "convex_circle":
                surfaceFn = CONVEX_CIRCLE.fn;
                break;
            case "convex_squircle":
                surfaceFn = CONVEX.fn;
                break;
            case "concave":
                surfaceFn = CONCAVE.fn;
                break;
            case "lip":
                surfaceFn = LIP.fn;
                break;
            default:
                surfaceFn = CONVEX.fn;
        }

        const precomputedMap = calculateDisplacementMapNode(
            glassThickness,
            bezelWidth,
            surfaceFn,
            refractiveIndex
        );

        const maxDisplacement = Math.max(...precomputedMap.map((x) => Math.abs(x)));
        const imageData = calculateDisplacementMap2Node(
            width,
            height,
            width,
            height,
            radius,
            bezelWidth,
            100,
            precomputedMap,
            2
        );

        const canvas = createCanvas(imageData.width, imageData.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get canvas context");
        }
        ctx.putImageData(imageData as any, 0, 0);

        return {
            buffer: canvas.toBuffer("image/png"),
            maxDisplacement,
        };
    }

    function generateSpecularMap(customParams: any = {}): Buffer {
        const defaults = {
            height: 150,
            width: 150,
            radius: 75,
            bezelWidth: 40,
        };

        const params = { ...defaults, ...customParams };
        const { height, width, radius, bezelWidth } = params;

        const imageData = calculateRefractionSpecularNode(
            width,
            height,
            radius,
            bezelWidth,
            undefined,
            2
        );

        const canvas = createCanvas(imageData.width, imageData.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get canvas context");
        }
        ctx.putImageData(imageData as any, 0, 0);
        return canvas.toBuffer("image/png");
    }

    function generateMagnifyingMap(customParams: any = {}): Buffer {
        const defaults = {
            width: 210,
            height: 150,
        };

        const params = { ...defaults, ...customParams };
        const { width, height } = params;

        const imageData = calculateMagnifyingDisplacementMapNode(width, height);

        const canvas = createCanvas(imageData.width, imageData.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get canvas context");
        }
        ctx.putImageData(imageData as any, 0, 0);
        return canvas.toBuffer("image/png");
    }

    return {
        name: "vite-plugin-refraction-displacement-map-vue",

        buildStart() {
            const defaultParams = {};
            const defaultKey = getCacheKey(defaultParams);

            if (!displacementMapCache.has(defaultKey)) {
                displacementMapCache.set(
                    defaultKey,
                    generateDisplacementMap(defaultParams)
                );
            }
            if (!specularMapCache.has(defaultKey)) {
                specularMapCache.set(defaultKey, generateSpecularMap(defaultParams));
            }
        },

        resolveId(id) {
            if (id.startsWith("virtual:refractionDisplacementMap")) {
                return "\0" + id;
            }
            if (id.startsWith("virtual:refractionSpecularMap")) {
                return "\0" + id;
            }
            if (id.startsWith("virtual:magnifying-scale")) {
                return "\0" + id;
            }
            if (id.startsWith("virtual:refractionFilter")) {
                return "\0" + id + ".vue";
            }
        },

        load(id) {
            if (id.startsWith("\0virtual:refractionDisplacementMap")) {
                const params = parseParams(id.replace("\0", ""));
                const cacheKey = getCacheKey(params);

                if (!displacementMapCache.has(cacheKey)) {
                    const result = generateDisplacementMap(params);
                    displacementMapCache.set(cacheKey, result);
                }

                const cachedResult = displacementMapCache.get(cacheKey)!;
                const filenameHash = paramsToHash(params);
                const filename = `displacement-map-${filenameHash}.png`;

                return `export const url = "/assets/${filename}";
export const maxDisplacement = ${cachedResult.maxDisplacement};
export default { url: "/assets/${filename}", maxDisplacement: ${cachedResult.maxDisplacement} };`;
            }
            if (id.startsWith("\0virtual:refractionSpecularMap")) {
                const params = parseParams(id.replace("\0", ""));
                const cacheKey = getCacheKey(params);

                if (!specularMapCache.has(cacheKey)) {
                    const buffer = generateSpecularMap(params);
                    specularMapCache.set(cacheKey, buffer);
                }

                const filenameHash = paramsToHash(params);
                const filename = `specular-map-${filenameHash}.png`;
                return `export default "/assets/${filename}";`;
            }
            if (id.startsWith("\0virtual:magnifying-scale")) {
                const params = parseParams(id.replace("\0", ""));
                const cacheKey = getCacheKey(params);

                if (!magnifyingMapCache.has(cacheKey)) {
                    const buffer = generateMagnifyingMap(params);
                    magnifyingMapCache.set(cacheKey, buffer);
                }

                const filenameHash = paramsToHash(params);
                const filename = `magnifying-map-${filenameHash}.png`;
                return `export default "/assets/${filename}";`;
            }
            if (id.startsWith("\0virtual:refractionFilter")) {
                const params = parseParams(id.replace("\0", "").replace(".vue", ""));
                const displacementCacheKey = getCacheKey(params);
                const specularCacheKey = getCacheKey(params);

                if (!displacementMapCache.has(displacementCacheKey)) {
                    const result = generateDisplacementMap(params);
                    displacementMapCache.set(displacementCacheKey, result);
                }
                if (!specularMapCache.has(specularCacheKey)) {
                    const buffer = generateSpecularMap(params);
                    specularMapCache.set(specularCacheKey, buffer);
                }

                let magnifyingFilename = "";
                if (params.magnify) {
                    const magnifyingParams = {
                        width: params.width,
                        height: params.height,
                    };
                    const magnifyingCacheKey = getCacheKey(magnifyingParams);
                    if (!magnifyingMapCache.has(magnifyingCacheKey)) {
                        const buffer = generateMagnifyingMap(magnifyingParams);
                        magnifyingMapCache.set(magnifyingCacheKey, buffer);
                    }
                    const magnifyingFilenameHash = paramsToHash(magnifyingParams);
                    magnifyingFilename = `magnifying-map-${magnifyingFilenameHash}.png`;
                }

                const cachedResult = displacementMapCache.get(displacementCacheKey)!;
                const filenameHash = paramsToHash(params);
                const displacementFilename = `displacement-map-${filenameHash}.png`;
                const specularFilename = `specular-map-${filenameHash}.png`;

                return `
<script setup lang="ts">
import { computed } from 'vue'

const displacementMapAsset = "/assets/${displacementFilename}"
const specularMapAsset = "/assets/${specularFilename}"
${params.magnify ? `const magnifyingMapAsset = "/assets/${magnifyingFilename}"` : ""}
const maxDisplacement = ${cachedResult.maxDisplacement}

interface Props {
  id: string
  withSvgWrapper?: boolean
  blur?: number
  scaleRatio?: number
  specularOpacity?: number
  specularSaturation?: number
  ${params.magnify ? "magnifyingScale?: number" : ""}
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  withSvgWrapper: true,
  blur: 0.2,
  scaleRatio: 1,
  specularOpacity: 0.4,
  specularSaturation: 4,
  ${params.magnify ? "magnifyingScale: 24," : ""}
  width: ${params.width || 150},
  height: ${params.height || 150}
})

const scale = computed(() => maxDisplacement * props.scaleRatio)
const specularSaturationValue = computed(() => props.specularSaturation.toString())
</script>

<template>
  <svg v-if="withSvgWrapper" color-interpolation-filters="sRGB" style="display: none">
    <defs>
      <filter :id="id">
        ${params.magnify ? `
        <feImage
          :href="magnifyingMapAsset"
          :x="0"
          :y="0"
          :width="width"
          :height="height"
          result="magnifying_displacement_map"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="magnifying_displacement_map"
          :scale="magnifyingScale"
          xChannelSelector="R"
          yChannelSelector="G"
          result="magnified_source"
        />
        ` : ""}
        <feGaussianBlur
          in="${params.magnify ? 'magnified_source' : 'SourceGraphic'}"
          :stdDeviation="blur"
          result="blurred_source"
        />
        <feImage
          :href="displacementMapAsset"
          :x="0"
          :y="0"
          :width="width"
          :height="height"
          result="displacement_map"
        />
        <feDisplacementMap
          in="blurred_source"
          in2="displacement_map"
          :scale="scale"
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />
        <feColorMatrix
          in="displaced"
          type="saturate"
          :values="specularSaturationValue"
          result="displaced_saturated"
        />
        <feImage
          :href="specularMapAsset"
          :x="0"
          :y="0"
          :width="width"
          :height="height"
          result="specular_layer"
        />
        <feComposite
          in="displaced_saturated"
          in2="specular_layer"
          operator="in"
          result="specular_saturated"
        />
        <feComponentTransfer in="specular_layer" result="specular_faded">
          <feFuncA type="linear" :slope="specularOpacity" />
        </feComponentTransfer>
        <feBlend
          in="specular_saturated"
          in2="displaced"
          mode="normal"
          result="withSaturation"
        />
        <feBlend
          in="specular_faded"
          in2="withSaturation"
          mode="normal"
        />
      </filter>
    </defs>
  </svg>
</template>
`;
            }
        },

        generateBundle() {
            for (const [cacheKey, result] of displacementMapCache) {
                let params: any = {};
                try {
                    params = JSON.parse(cacheKey);
                } catch {
                    params = {};
                }
                const filenameHash = paramsToHash(params);
                const filename = `displacement-map-${filenameHash}.png`;
                this.emitFile({
                    type: "asset",
                    fileName: `assets/${filename}`,
                    source: result.buffer,
                });
            }

            for (const [cacheKey, buffer] of specularMapCache) {
                let params: any = {};
                try {
                    params = JSON.parse(cacheKey);
                } catch {
                    params = {};
                }
                const filenameHash = paramsToHash(params);
                const filename = `specular-map-${filenameHash}.png`;
                this.emitFile({
                    type: "asset",
                    fileName: `assets/${filename}`,
                    source: buffer,
                });
            }

            for (const [cacheKey, buffer] of magnifyingMapCache) {
                let params: any = {};
                try {
                    params = JSON.parse(cacheKey);
                } catch {
                    params = {};
                }
                const filenameHash = paramsToHash(params);
                const filename = `magnifying-map-${filenameHash}.png`;
                this.emitFile({
                    type: "asset",
                    fileName: `assets/${filename}`,
                    source: buffer,
                });
            }
        },

        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url?.startsWith("/assets/displacement-map-")) {
                    const hashString = req.url
                        .replace("/assets/displacement-map-", "")
                        .replace(".png", "");
                    const params = hashToParams(hashString);
                    const cacheKey = getCacheKey(params);

                    let result = displacementMapCache.get(cacheKey);
                    if (!result) {
                        result = generateDisplacementMap(params);
                        displacementMapCache.set(cacheKey, result);
                    }

                    res.writeHead(200, {
                        "Content-Type": "image/png",
                        "Cache-Control": "public, max-age=31536000",
                    });
                    res.end(result.buffer);
                    return;
                }

                if (req.url?.startsWith("/assets/specular-map-")) {
                    const hashString = req.url
                        .replace("/assets/specular-map-", "")
                        .replace(".png", "");
                    const params = hashToParams(hashString);
                    const cacheKey = getCacheKey(params);

                    let buffer = specularMapCache.get(cacheKey);
                    if (!buffer) {
                        buffer = generateSpecularMap(params);
                        specularMapCache.set(cacheKey, buffer);
                    }

                    res.writeHead(200, {
                        "Content-Type": "image/png",
                        "Cache-Control": "public, max-age=31536000",
                    });
                    res.end(buffer);
                    return;
                }

                if (req.url?.startsWith("/assets/magnifying-map-")) {
                    const hashString = req.url
                        .replace("/assets/magnifying-map-", "")
                        .replace(".png", "");
                    const params = hashToParams(hashString);
                    const cacheKey = getCacheKey(params);

                    let buffer = magnifyingMapCache.get(cacheKey);
                    if (!buffer) {
                        buffer = generateMagnifyingMap(params);
                        magnifyingMapCache.set(cacheKey, buffer);
                    }

                    res.writeHead(200, {
                        "Content-Type": "image/png",
                        "Cache-Control": "public, max-age=31536000",
                    });
                    res.end(buffer);
                    return;
                }
                next();
            });
        },
    };
}

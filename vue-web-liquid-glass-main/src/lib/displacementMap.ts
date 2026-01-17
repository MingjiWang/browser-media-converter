export function calculateDisplacementMap(
    glassThickness: number = 200,
    bezelWidth: number = 50,
    bezelHeightFn: (x: number) => number = (x) => x,
    refractiveIndex: number = 1.5,
    samples: number = 128
): number[] {
    // Pre-calculate the distance the ray will be deviated
    // given the distance to border (ratio of bezel)
    // and height of the glass
    const eta = 1 / refractiveIndex;

    // Simplified refraction, which only handles fully vertical incident ray [0, 1]
    function refract(normalX: number, normalY: number): [number, number] | null {
        const dot = normalY;
        const k = 1 - eta * eta * (1 - dot * dot);
        if (k < 0) {
            // Total internal reflection
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

        // Calculate derivative in x
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

            // Return displacement (rest of travel on x-axis, depends on remaining height to hit bottom of glass)
            return refracted[0] * (remainingHeight / refracted[1]);
        }
    });
}

export function calculateDisplacementMap2(
    canvasWidth: number,
    canvasHeight: number,
    objectWidth: number,
    objectHeight: number,
    radius: number,
    bezelWidth: number,
    maximumDisplacement: number,
    precomputedDisplacementMap: number[] = [],
    dpr?: number
) {
    const devicePixelRatio = dpr ?? (typeof window !== "undefined" ? window.devicePixelRatio ?? 1 : 1);
    const bufferWidth = Math.floor(canvasWidth * devicePixelRatio);
    const bufferHeight = Math.floor(canvasHeight * devicePixelRatio);

    // Create ImageData - works in browser
    const imageData = new ImageData(bufferWidth, bufferHeight);

    // Fill neutral color using buffer
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

            // Only write non-neutral displacements (when isInBezel)
            if (isInBezel) {
                const opacity =
                    distanceToCenterSquared < radiusSquared
                        ? 1
                        : 1 -
                        (Math.sqrt(distanceToCenterSquared) - Math.sqrt(radiusSquared)) /
                        (Math.sqrt(radiusPlusOneSquared) - Math.sqrt(radiusSquared));

                const distanceFromCenter = Math.sqrt(distanceToCenterSquared);
                const distanceFromSide = radius_ - distanceFromCenter;

                // Viewed from top
                const cos = x / distanceFromCenter;
                const sin = y / distanceFromCenter;

                const bezelIndex =
                    ((distanceFromSide / bezel) * precomputedDisplacementMap.length) | 0;
                const distance = precomputedDisplacementMap[bezelIndex] ?? 0;

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

export type ShapeType = 'circle' | 'squircle' | 'rectangle' | 'pill';

/**
 * Calculate displacement map for various shapes
 * @param shape - 'circle' | 'squircle' | 'rectangle' | 'pill'
 * @param cornerRadius - 0 (sharp) to 1 (fully rounded), controls corner roundness
 * @param squircleExponent - For squircle shape, controls how "square" it is (2 = ellipse, 4+ = squircle)
 */
export function calculateDisplacementMapWithShape(
    canvasWidth: number,
    canvasHeight: number,
    objectWidth: number,
    objectHeight: number,
    bezelWidth: number,
    maximumDisplacement: number,
    precomputedDisplacementMap: number[] = [],
    shape: ShapeType = 'circle',
    cornerRadius: number = 1.0, // 0 = sharp corners, 1 = fully rounded
    squircleExponent: number = 4,
    dpr?: number
) {
    const devicePixelRatio = dpr ?? (typeof window !== "undefined" ? window.devicePixelRatio ?? 1 : 1);
    const bufferWidth = Math.floor(canvasWidth * devicePixelRatio);
    const bufferHeight = Math.floor(canvasHeight * devicePixelRatio);

    const imageData = new ImageData(bufferWidth, bufferHeight);
    const neutral = 0xff008080;
    new Uint32Array(imageData.data.buffer).fill(neutral);

    const objectWidth_ = objectWidth * devicePixelRatio;
    const objectHeight_ = objectHeight * devicePixelRatio;
    const bezel = bezelWidth * devicePixelRatio;

    const objectX = (bufferWidth - objectWidth_) / 2;
    const objectY = (bufferHeight - objectHeight_) / 2;

    // Calculate actual corner radius based on shape and cornerRadius parameter
    const maxCornerRadius = Math.min(objectWidth_, objectHeight_) / 2;
    let actualRadius: number;

    switch (shape) {
        case 'circle':
            // Circle: radius is half of the smaller dimension
            actualRadius = maxCornerRadius;
            break;
        case 'pill':
            // Pill: fully rounded on shorter axis
            actualRadius = Math.min(objectWidth_, objectHeight_) / 2;
            break;
        case 'rectangle':
            // Rectangle: use cornerRadius to interpolate from sharp to rounded
            actualRadius = cornerRadius * maxCornerRadius;
            break;
        case 'squircle':
        default:
            // Squircle: use cornerRadius to control roundness
            actualRadius = cornerRadius * maxCornerRadius;
            break;
    }

    const radius_ = actualRadius;
    const radiusSquared = radius_ ** 2;
    const radiusPlusOneSquared = (radius_ + 1) ** 2;
    const radiusMinusBezelSquared = Math.max(0, (radius_ - bezel) ** 2);

    const widthBetweenRadiuses = Math.max(0, objectWidth_ - radius_ * 2);
    const heightBetweenRadiuses = Math.max(0, objectHeight_ - radius_ * 2);

    // Squircle distance function: |x|^n + |y|^n = r^n
    const squircleDistance = (x: number, y: number, r: number, n: number): number => {
        if (r === 0) return Math.sqrt(x * x + y * y);
        const absX = Math.abs(x) / r;
        const absY = Math.abs(y) / r;
        return Math.pow(Math.pow(absX, n) + Math.pow(absY, n), 1 / n) * r;
    };

    for (let y1 = 0; y1 < objectHeight_; y1++) {
        for (let x1 = 0; x1 < objectWidth_; x1++) {
            const idx = ((objectY + y1) * bufferWidth + objectX + x1) * 4;

            // Determine which corner/edge region we're in
            const isOnLeftSide = x1 < radius_;
            const isOnRightSide = x1 >= objectWidth_ - radius_;
            const isOnTopSide = y1 < radius_;
            const isOnBottomSide = y1 >= objectHeight_ - radius_;

            // Only process corners and edges where bezel applies
            let x = 0, y = 0;
            let distanceToEdge = 0;
            let normalX = 0, normalY = 0;
            let isInBezelRegion = false;

            if ((isOnLeftSide || isOnRightSide) && (isOnTopSide || isOnBottomSide)) {
                // Corner region
                x = isOnLeftSide ? x1 - radius_ : x1 - (objectWidth_ - radius_);
                y = isOnTopSide ? y1 - radius_ : y1 - (objectHeight_ - radius_);

                let distanceFromCornerCenter: number;

                if (shape === 'squircle' && cornerRadius > 0) {
                    distanceFromCornerCenter = squircleDistance(x, y, radius_, squircleExponent);
                } else {
                    distanceFromCornerCenter = Math.sqrt(x * x + y * y);
                }

                distanceToEdge = radius_ - distanceFromCornerCenter;

                if (distanceToEdge >= -1 && distanceToEdge <= bezel) {
                    isInBezelRegion = true;
                    const magnitude = Math.sqrt(x * x + y * y) || 1;
                    normalX = x / magnitude;
                    normalY = y / magnitude;
                }
            } else if (isOnLeftSide || isOnRightSide) {
                // Left or right edge (not corner)
                distanceToEdge = isOnLeftSide ? x1 : (objectWidth_ - 1 - x1);
                if (distanceToEdge <= bezel) {
                    isInBezelRegion = true;
                    normalX = isOnLeftSide ? -1 : 1;
                    normalY = 0;
                }
            } else if (isOnTopSide || isOnBottomSide) {
                // Top or bottom edge (not corner)
                distanceToEdge = isOnTopSide ? y1 : (objectHeight_ - 1 - y1);
                if (distanceToEdge <= bezel) {
                    isInBezelRegion = true;
                    normalX = 0;
                    normalY = isOnTopSide ? -1 : 1;
                }
            }

            if (isInBezelRegion && distanceToEdge >= 0) {
                const opacity = distanceToEdge >= 0 ? 1 : Math.max(0, 1 + distanceToEdge);

                const bezelIndex = Math.min(
                    precomputedDisplacementMap.length - 1,
                    Math.max(0, ((distanceToEdge / bezel) * precomputedDisplacementMap.length) | 0)
                );
                const distance = precomputedDisplacementMap[bezelIndex] ?? 0;

                const dX = (-normalX * distance) / maximumDisplacement;
                const dY = (-normalY * distance) / maximumDisplacement;

                imageData.data[idx] = 128 + dX * 127 * opacity;
                imageData.data[idx + 1] = 128 + dY * 127 * opacity;
                imageData.data[idx + 2] = 0;
                imageData.data[idx + 3] = 255;
            }
        }
    }
    return imageData;
}


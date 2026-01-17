export function calculateMagnifyingDisplacementMap(
    width: number,
    height: number,
    dpr?: number
) {
    const devicePixelRatio = dpr ?? (typeof window !== "undefined" ? window.devicePixelRatio ?? 1 : 1);
    const bufferWidth = Math.floor(width * devicePixelRatio);
    const bufferHeight = Math.floor(height * devicePixelRatio);
    const imageData = new ImageData(bufferWidth, bufferHeight);

    const centerX = bufferWidth / 2;
    const centerY = bufferHeight / 2;

    for (let y = 0; y < bufferHeight; y++) {
        for (let x = 0; x < bufferWidth; x++) {
            const idx = (y * bufferWidth + x) * 4;

            // Calculate normalized displacement toward center
            const dx = (x - centerX) / centerX;
            const dy = (y - centerY) / centerY;

            // Map to 0-255 range (128 = neutral)
            imageData.data[idx] = 128 + dx * 127; // R
            imageData.data[idx + 1] = 128 + dy * 127; // G
            imageData.data[idx + 2] = 0; // B
            imageData.data[idx + 3] = 255; // A
        }
    }

    return imageData;
}

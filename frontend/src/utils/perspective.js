
/**
 * Warps an image based on perspective transformation defined by source and destination points.
 * 
 * @param {HTMLImageElement | HTMLCanvasElement} image Source image or canvas
 * @param {Array<{x: number, y: number}>} srcPoints Array of 4 points defining the source region (corners)
 * @param {Array<{x: number, y: number}>} dstPoints Array of 4 points defining the destination region (perspective deformed)
 * @param {{width: number, height: number}} outputSize Size of the output canvas
 * @returns {HTMLCanvasElement} A new canvas containing the warped image
 */
export function warpImage(image, srcPoints, dstPoints, outputSize) {
    const { width, height } = outputSize;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw source image to a temp canvas to access pixel data
    const tempSrcCanvas = document.createElement('canvas');
    tempSrcCanvas.width = image.width;
    tempSrcCanvas.height = image.height;
    const tempSrcCtx = tempSrcCanvas.getContext('2d');
    tempSrcCtx.drawImage(image, 0, 0);
    const srcImageData = tempSrcCtx.getImageData(0, 0, image.width, image.height);
    const srcData = srcImageData.data;
    const srcWidth = srcImageData.width;
    const srcHeight = srcImageData.height;

    const dstImageData = ctx.createImageData(width, height);
    const dstData = dstImageData.data;

    // We need to map pixels FROM destination TO source to avoid holes (Inverse Mapping)
    // So we calculate the homography that maps: dstPoints -> srcPoints
    const h = solveHomography(dstPoints, srcPoints);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Apply homography to find coordinates in source image
            // x_src = (h0*x + h1*y + h2) / (h6*x + h7*y + h8)
            // y_src = (h3*x + h4*y + h5) / (h6*x + h7*y + h8)
            // h8 is normalized to 1

            const denominator = h[6] * x + h[7] * y + 1;
            const srcX = (h[0] * x + h[1] * y + h[2]) / denominator;
            const srcY = (h[3] * x + h[4] * y + h[5]) / denominator;

            // Check if sampling point is within source bounds
            if (srcX >= 0 && srcX < srcWidth - 1 && srcY >= 0 && srcY < srcHeight - 1) {
                // Bilinear Interpolation
                const x0 = Math.floor(srcX);
                const x1 = x0 + 1;
                const y0 = Math.floor(srcY);
                const y1 = y0 + 1;

                const dx = srcX - x0;
                const dy = srcY - y0;

                const i00 = (y0 * srcWidth + x0) * 4;
                const i10 = (y0 * srcWidth + x1) * 4;
                const i01 = (y1 * srcWidth + x0) * 4;
                const i11 = (y1 * srcWidth + x1) * 4;

                const dstIdx = (y * width + x) * 4;

                for (let c = 0; c < 4; c++) {
                    const top = srcData[i00 + c] * (1 - dx) + srcData[i10 + c] * dx;
                    const bottom = srcData[i01 + c] * (1 - dx) + srcData[i11 + c] * dx;
                    dstData[dstIdx + c] = top * (1 - dy) + bottom * dy;
                }
            }
        }
    }

    ctx.putImageData(dstImageData, 0, 0);
    return canvas;
}

/**
 * Solves for the homography matrix H that maps points 'src' to 'dst'.
 * H * src = dst
 * We use this to map destination screen coordinates BACK to source texture coordinates.
 * 
 * @param {Array<{x: number, y: number}>} src Source points
 * @param {Array<{x: number, y: number}>} dst Destination points
 * @returns {Array<number>} An array of 9 elements representing the 3x3 matrix (row-major), last element is 1.
 */
function solveHomography(src, dst) {
    // We start with 8 equations for 8 unknowns (h0...h7), assuming h8 = 1
    // For each point pair (u,v) -> (x,y):
    // x = (h0*u + h1*v + h2) / (h6*u + h7*v + 1)
    // y = (h3*u + h4*v + h5) / (h6*u + h7*v + 1)

    // Rearranging:
    // h0*u + h1*v + h2 - h6*u*x - h7*v*x = x
    // h3*u + h4*v + h5 - h6*u*y - h7*v*y = y

    const A = [];
    const B = [];

    for (let i = 0; i < 4; i++) {
        const u = src[i].x;
        const v = src[i].y;
        const x = dst[i].x;
        const y = dst[i].y;

        A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]);
        B.push(x);

        A.push([0, 0, 0, u, v, 1, -u * y, -v * y]);
        B.push(y);
    }

    const h = gaussianElimination(A, B);
    h.push(1); // h8 = 1
    return h;
}

/**
 * Solves Ax = b using Gaussian elimination.
 * @param {Array<Array<number>>} A Matrix A
 * @param {Array<number>} b Vector b
 * @returns {Array<number>} Solution vector x
 */
function gaussianElimination(A, b) {
    const n = A.length;

    // Forward elimination
    for (let i = 0; i < n; i++) {
        // Find pivot 
        let maxEl = Math.abs(A[i][i]);
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row
        for (let k = i; k < n; k++) {
            const tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
        }
        const tmp = b[maxRow];
        b[maxRow] = b[i];
        b[i] = tmp;

        // Make all rows below this one 0 in current column
        for (let k = i + 1; k < n; k++) {
            const c = -A[k][i] / A[i][i];
            for (let j = i; j < n; j++) {
                if (i === j) {
                    A[k][j] = 0;
                } else {
                    A[k][j] += c * A[i][j];
                }
            }
            b[k] += c * b[i];
        }
    }

    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += A[i][j] * x[j];
        }
        x[i] = (b[i] - sum) / A[i][i];
    }
    return x;
}

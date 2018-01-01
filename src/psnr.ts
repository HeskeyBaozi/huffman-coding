/**
 * 峰值信噪比
 */
export function PSNR(X: Uint8ClampedArray, Y: Uint8ClampedArray) {
    // 计算均方差
    const mse = MSE(X, Y);

    // 灰度级别 - 1
    const MAXI = 255;

    return 20 * Math.log10(MAXI / (Math.sqrt(mse)));
}


/**
 * 计算两幅图片矩阵之间的均方差
 */
function MSE(X: Uint8ClampedArray, Y: Uint8ClampedArray) {
    const len = X.length;
    let sum = 0;
    // 遍历整个图像
    for (let i = 0; i < len; i++) {
        sum += Math.pow(X[i] - Y[i], 2);
    }
    return sum / len;
}
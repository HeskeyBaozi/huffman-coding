import React, { Component, SyntheticEvent } from 'react';
import { Huffman } from './huffman';
import { PSNR } from './psnr';

export class App extends Component {
    canvas: HTMLCanvasElement;
    canvasOutput: HTMLCanvasElement;

    render() {
        return <div id="app">
            <h1>Input Picture</h1>
            <div>
                <input type="file" accept="image/*" onChange={ this.uploadInput }/>
            </div>
            <div>
                <h2>Input</h2>
                <canvas ref={ (canvas: HTMLCanvasElement) => this.canvas = canvas }/>
            </div>
            <div>
                <button onClick={ this.huffman }>Huffman!</button>
            </div>
            <div>
                <h2>Output</h2>
                <canvas ref={ (canvas: HTMLCanvasElement) => this.canvasOutput = canvas }/>
            </div>
        </div>;
    }

    uploadInput = (e: SyntheticEvent<HTMLInputElement>) => {
        e.preventDefault();
        const file = (e.currentTarget.files as FileList).item(0);
        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
            const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
            this.canvas.width = image.naturalWidth;
            this.canvas.height = image.naturalHeight;
            ctx.drawImage(image, 0, 0);
        };
    };

    getImageData = () => {
        const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        const { width, height, data } = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        return {
            width,
            height,
            data: data.filter((val, idx) => (idx + 1) % 4 !== 0)
        };
    };

    huffman = (e: SyntheticEvent<EventTarget>) => {
        e.preventDefault();
        const imageData = this.getImageData();
        const RGB = [
            imageData.data.filter((v, idx) => (idx + 1) % 3 === 1), // R
            imageData.data.filter((v, idx) => (idx + 1) % 3 === 2), // G
            imageData.data.filter((v, idx) => (idx + 1) % 3 === 0) // B
        ];


        const RGBHuffman = RGB.map(matrix => new Huffman(matrix));
        const encode = RGBHuffman.map(huffman => Huffman.encode(huffman.input, huffman.codes));


        const decode = RGBHuffman.map((huffman, index) => Huffman.decode(encode[index], huffman.codes));
        console.log('原始图像RGB', RGB);
        console.log('压缩后RGB', encode);
        console.log('哈夫曼实例（字典）', RGBHuffman);
        const B0 = RGB[0].length * 8 * 3; // 八位三个通道
        const B1 = encode
            .map(channel => channel
                .map(code => code.length)
                .reduce((sum, next) => sum + next, 0))
            .reduce((sum, next) => sum + next, 0); // 变长位三个通道
        console.log('压缩率（compression ratio）', B0 / B1);
        console.log('解压后RGB', decode);
        console.log('峰值信噪比（PSNR）', decode.map((channel, index) => PSNR(channel, RGB[index])));
        console.log('每个值是否和原始图像相等', decode.every((channel, i) => {
            return channel.every(((value, index) => RGB[i][index] === value));
        }));

        this.canvasOutput.width = imageData.width;
        this.canvasOutput.height = imageData.height;
        const buffer = [];
        for (let i = 0; i < this.canvasOutput.width * this.canvasOutput.height; i++) {
            buffer.push(...decode.map(channel => channel[i]), 255);
        }
        const decodeImageData = new ImageData(new Uint8ClampedArray(buffer), this.canvasOutput.width, this.canvasOutput.height);
        const ctx = this.canvasOutput.getContext('2d') as CanvasRenderingContext2D;
        ctx.putImageData(decodeImageData, 0, 0);

    };
}
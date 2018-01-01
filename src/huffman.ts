interface Frequency {
    symbol?: number;
    frequency: number;
    [0]?: Frequency;
    [1]?: Frequency;
}

interface Codes {
    [symbol: number]: string;

    mirror: {
        [code: string]: number;
    }
}

export class Huffman {
    input: Uint8ClampedArray; // 输入的灰度值数组
    frequencies: Frequency[] = []; // 哈夫曼频数树
    codes: Codes = { mirror: {} }; // 哈夫曼字典


    constructor(input: Uint8ClampedArray) {
        this.input = input; // 输入为灰度值数组，数组中的元素在[0, 255]区间内
        this.initialize(input); // 初始化
        this.loop(); // 哈夫曼迭代
        Huffman.traversal(this.frequencies[0], '', this.codes) // 遍历哈夫曼树生成字典
    }

    private initialize(input: Uint8ClampedArray) {
        const freqLabels: number[] = [];
        for (let i = 0; i < 256; i++) {
            freqLabels.push(0);
        }

        for (const val of input) {
            freqLabels[val]++;
        }

        this.frequencies = Object.keys(freqLabels)
            .map(key => ({
                symbol: Number.parseInt(key), // 符号[0, 255]
                frequency: freqLabels[Number.parseInt(key)] // 频数
            }))
            .sort((lhs, rhs) => rhs.frequency - lhs.frequency); // 最大频数在前有序排列
    }

    private loop() {

        // 重复迭代知道列表中只剩下一个符号
        while (this.frequencies.length > 1) {

            // 从列表中选出两个具有出现次数最少的符号
            const least1 = this.frequencies.pop() as Frequency;
            const least0 = this.frequencies.pop() as Frequency;

            // 将孩子结点的出现次数的综合作为父亲节点的出现次数
            const parent = {
                frequency: least0.frequency + least1.frequency,
                [0]: least0,
                [1]: least1
            };

            // 将父亲节点插入字符列表中，同时保持列表的有序性
            this.frequencies.push(parent);
            this.frequencies.sort((lhs, rhs) => rhs.frequency - lhs.frequency);
        }
    }

    // 前序遍历生成字典
    private static traversal(node: Frequency, track: string, codes: Codes) {
        if (node.symbol === 0 || node.symbol) {
            const code = track;
            codes[node.symbol] = code;

            // 字典镜像，用于解码
            codes.mirror[code] = node.symbol;
        }

        if (node[0]) {
            Huffman.traversal(node[0] as Frequency, track + '0', codes);
        }

        if (node[1]) {
            Huffman.traversal(node[1] as Frequency, track + '1', codes);
        }
    }

    static encode(input: Uint8ClampedArray, codes: Codes) {
        return [...input].map(symbol => codes[symbol]);
    }

    static decode(input: string[], codes: Codes) {
        const output: number[] = input.map(code => codes.mirror[code]);
        return new Uint8ClampedArray(output);
    }
}
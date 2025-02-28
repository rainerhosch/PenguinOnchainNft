import React from "react";

interface Accessory {
    bytePixel: string;
    forSale: boolean;
    lastPrice: bigint;
    owner: string;
    sellingPrice: bigint;
    trait_name: string;
    trait_type: string;
}

interface CardItemProps {
    accessoryData: Accessory;
}
const parseBytePixel = (bytePixel: string) => {
    const pixels = [];
    const regex = /([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{6})/g;

    let match;
    while ((match = regex.exec(bytePixel)) !== null) {
        const x = parseInt(match[1], 16);
        const y = parseInt(match[2], 16);
        const w = parseInt(match[3], 16);
        const h = parseInt(match[4], 16);
        const color = `#${match[5]}`;

        pixels.push({ x, y, w, h, color });
    }

    console.log(pixels);
    return pixels;
};
export default function CardItem({ accessoryData }: CardItemProps) {
    const pixels = parseBytePixel(accessoryData.bytePixel);
    return (
        <div className="border p-4 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-lg font-bold">{accessoryData.trait_name}</h2>
            <p className="text-sm text-gray-600">{accessoryData.trait_type}</p>

            {/* SVG untuk menampilkan pixel dalam bentuk rectangle */}
            <svg shapeRendering="crispEdges" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                {pixels.map((pixel, index) => (
                    <rect
                        key={index}
                        x={pixel.x}
                        y={pixel.y}
                        width={pixel.w}
                        height={pixel.h}
                        fill={pixel.color}
                    />
                ))}
            </svg>

            <p className="text-purple-950 font-mono">
                Price: {Number(accessoryData.sellingPrice) / 1e18} ETH
            </p>
            <button className="text-[8px] sm:text-xs font-mono sm:font-light border border-white py-1 px-2 bg-blue-500 rounded-sm hover:bg-black/30 hover:text-white my-2">
                Buy Now
            </button>
        </div>
    );
}

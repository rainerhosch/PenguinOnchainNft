"use client";

import { useState } from "react";
import {
    Sketch,
    // Github,
    Chrome
} from "@uiw/react-color";
import Canvas from "@/components/studio/Canvas2";

export default function Editor() {
    const [hex, setHex] = useState("#000000");
    const [usedColors, setUsedColors] = useState<string[]>([]);
    const hexBg = "#401e5c";
    // const hexBg = "#855da5";

    const handleColorChange = (color: { hex: string }) => {
        setHex(color.hex);
        setUsedColors((prevColors) => {
            if (!prevColors.includes(color.hex)) {
                return [color.hex, ...prevColors].slice(0, 10);
            }
            return prevColors;
        });
    };

    return (
        <div className="border border-transparent sm:border-purple-500 rounded flex flex-col md:flex-row md:p-2 md:w-full my-8 justify-center" id="editor">
            <div className="flex flex-col gap-4">
                <div className="text-sm font-mono text-purple-950 my-2 sm:text-left text-center bg-white/40 rounded-md hidden sm:block mx-2">
                    <p className="mx-auto px-8">Draw Instructions:</p>
                    <div className="flex flex-col gap-0 mx-auto px-8">
                        <span className="font-light">Ctrl + S or Ctrl + S + S <a className="text-xs">(Show Allowed Draw Area)</a></span>
                        <span className="font-light">Ctrl + Z <a className="text-xs">(Undo last pixel)</a></span>
                        <span className="font-light">Ctrl + X <a className="text-xs">(Redo last pixel)</a></span>
                        <span className="font-light">Ctrl + Shift + Z <a className="text-xs">(Undo last color change)</a></span>
                        <span className="font-light">Ctrl + Shift + X <a className="text-xs">(Redo last color change)</a></span>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:w-full">
                    <div className="flex flex-col gap-2 md:max-w-[420px]">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4 mt-4">
                                <div className="flex flex-col gap-2 bg-white/40 justify-center rounded-md">
                                    <p className="my-1 mx-auto text-sm">Used Collor</p>
                                    <div className="grid grid-cols-5 gap-1 mx-auto sm:max-w-[160px] max-w-full justify-center rounded-md">
                                        {usedColors.map((color, index) => (
                                            <div
                                                key={index}
                                                className="my-2 w-6 h-6 rounded-full cursor-pointer border border-black/40 border-double"
                                                style={{ backgroundColor: color }}
                                                onClick={() => setHex(color)}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex sm:flex-row flex-col gap-4 items-center sm:items-start">
                                    <div className="flex flex-row sm:flex-col gap-4">
                                        <Sketch
                                            style={{backgroundColor:hexBg}}
                                            color={hex}
                                            onChange={handleColorChange}
                                            className="m-1 sm:max-w-[160px] max-w-[120px]"
                                        />

                                        <Chrome
                                            style={{backgroundColor:hexBg}}
                                            color={hex}
                                            onChange={handleColorChange}
                                            className="m-1 sm:max-w-[160px] max-w-[120px] bg-slate-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <Canvas selectedColor={hex} />
                    </div>
                </div>
            </div>
        </div>
    );
}
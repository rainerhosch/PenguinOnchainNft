"use client";

import {
    // useRef, 
    useState,
} from "react";
import {
    // Slider, 
    Sketch,
    Github
} from '@uiw/react-color';
import Canvas from '@/components/studio/Canvas2';


export default function Editor() {
    const [hex, setHex] = useState("#000000");




    return (
        <div className="border border-transparent sm:border-purple-500 rounded flex flex-col md:flex-row  md:p-2 md:w-full my-8" id="editor">
            <div className="flex flex-col md:flex-row md:w-full">
                <div className="flex flex-col gap-2 md:max-w-[420px]">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex sm:flex-row flex-col gap-4 items-center sm:items-start">
                                <div className="flex flex-row sm:flex-col gap-4">
                                    <Sketch
                                        color={hex}
                                        onChange={(color) => {
                                            setHex(color.hex);
                                        }}
                                        className="m-1 sm:max-w-[160px] max-w-[120px]"
                                    />
                                    <Github
                                        color={hex}
                                        onChange={(color) => {
                                            setHex(color.hex);
                                        }}
                                        className="m-1 sm:max-w-[160px] max-w-[120px]"
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
    )
}
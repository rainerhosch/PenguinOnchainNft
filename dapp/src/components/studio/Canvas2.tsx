/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-key */
"use client";

import React, {
    useRef,
    useState,
    useEffect,
    MouseEvent,
    KeyboardEvent
} from "react";
import { Address } from "viem";
import toast, { Toaster } from 'react-hot-toast';
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
    type BaseError,
} from "wagmi";
import PengoContract from "../../constants/PengoContract.json";

const CANVAS_SIZE = 300 * 2;
const PIXEL_SIZE = 10 * 2;

interface CanvasProps {
    selectedColor: string;
}

function svgToBytecode(svgString: string) {
    const rectRegex = /<rect x='(\d+)' y='(\d+)' width='(\d+)' height='(\d+)' fill='(#[0-9A-Fa-f]{3,6})'\/>/g;
    let match;
    let bytecode = "";

    while ((match = rectRegex.exec(svgString)) !== null) {
        const x = parseInt(match[1], 10).toString(16).padStart(2, "0"); // X hex
        const y = parseInt(match[2], 10).toString(16).padStart(2, "0"); // Y hex
        const width = parseInt(match[3], 10).toString(16).padStart(2, "0"); // Width
        const height = parseInt(match[4], 10).toString(16).padStart(2, "0"); // Height

        // Check color must valid 6 char 
        let color = match[5].replace("#", "").toUpperCase();
        if (color.length === 3) {
            // Expand warna shorthand (#F00 -> #FF0000)
            color = color.split("").map(c => c + c).join("");
        }
        color = color.slice(-6);
        bytecode += `${x}${y}${width}${height}${color}`;
    }

    // console.log(bytecode);
    return bytecode;
}


export default function Canvas({ selectedColor }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [rects, setRects] = useState<{ x: number; y: number; color: string }[]>([]);
    const [history, setHistory] = useState<{ x: number; y: number; color: string }[][]>([]);

    // Stack to store color changes (undo/redo)
    const [colorHistory, setColorHistory] = useState<{ x: number; y: number; prevColor: string; newColor: string }[]>([]);
    const [colorRedoStack, setColorRedoStack] = useState<{ x: number; y: number; prevColor: string; newColor: string }[]>([]);

    const [svgCode, setSvgCode] = useState<string>("");
    const [accessoryCode, setAccessoryCode] = useState<string>("");
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const { address } = useAccount();
    const [loading, setLoading] = useState(true);

    const [selectedPengo, setSelectedPengo] = useState("");
    const [selectedAcc, setSelectedAccessory] = useState("");
    const [accName, setAccName] = useState("");
    // canvas config
    const [showOverlay, setShowOverlay] = useState(false);
    const contractAddress = PengoContract.address as Address;
    const abi = PengoContract.abi;
    const networkContract = PengoContract.networkDeployment[0];
    const [loadingToast, setLoadingToast] = React.useState<boolean | true>(true);

    // Read list of NFT token IDs owned by the user
    const { data: listOf } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "tokensOfOwner",
        args: [address],
    });
    const listOfAddress: string[] = (listOf as string[]) || [];

    const { data: allowedPart } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "getAllAllowedParts",
    });
    const allowedAccesories: string[] = (allowedPart as string[]) || [];

    const { data: pixelPart } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "getPixelPart",
        args: [selectedAcc],
    });
    const allowedPixelPart: string[] = (pixelPart as string[]) || [];
    
    
    useEffect(() => {
        console.log(allowedAccesories)
        console.log(allowedPixelPart)
        if (listOfAddress !== undefined) {
            setLoading(false);
        }
    }, [listOfAddress]);

    useEffect(() => {
        if (listOfAddress.length > 0) {
            setSelectedPengo(`${listOfAddress[0]}`);
        }
        if (allowedAccesories.length > 0) {
            setSelectedAccessory(allowedAccesories[0]);
        }
    }, [listOfAddress, allowedAccesories]);

    useEffect(() => {
        updateSVGCode();
        drawCanvas();
    }, [rects]);

    useEffect(() => {
        const handleUndo = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "z") {
                e.preventDefault();
                setRects((prev) => {
                    if (prev.length === 0) return prev;
                    const newHistory = [...history, prev];
                    setHistory(newHistory);
                    return prev.slice(0, -1);
                });
            }
        };

        const handleRedo = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "x") {
                e.preventDefault();
                setRects((prev) => {
                    if (history.length === 0) return prev;
                    const newRects = history[history.length - 1];
                    setHistory((h) => h.slice(0, -1));
                    return newRects;
                });
            }
        };

        document.addEventListener("keydown", handleUndo as unknown as EventListener);
        document.addEventListener("keydown", handleRedo as unknown as EventListener);
        return () => {
            document.removeEventListener("keydown", handleUndo as unknown as EventListener);
            document.removeEventListener("keydown", handleRedo as unknown as EventListener);
        };
    }, [history]);

    useEffect(() => {
        const handleUndoColor = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
                e.preventDefault();
                if (colorHistory.length === 0) return;

                const lastChange = colorHistory[colorHistory.length - 1];
                setColorHistory(colorHistory.slice(0, -1));
                setColorRedoStack([...colorRedoStack, lastChange]);

                setRects((prevRects) =>
                    prevRects.map((r) =>
                        r.x === lastChange.x && r.y === lastChange.y
                            ? { ...r, color: lastChange.prevColor }
                            : r
                    )
                );
            }
        };

        const handleRedoColor = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "x") {
                e.preventDefault();
                if (colorRedoStack.length === 0) return;

                const lastRedo = colorRedoStack[colorRedoStack.length - 1];
                setColorRedoStack(colorRedoStack.slice(0, -1));
                setColorHistory([...colorHistory, lastRedo]);

                setRects((prevRects) =>
                    prevRects.map((r) =>
                        r.x === lastRedo.x && r.y === lastRedo.y
                            ? { ...r, color: lastRedo.newColor }
                            : r
                    )
                );
            }
        };

        document.addEventListener("keydown", handleUndoColor as unknown as EventListener);
        document.addEventListener("keydown", handleRedoColor as unknown as EventListener);
        return () => {
            document.removeEventListener("keydown", handleUndoColor as unknown as EventListener);
            document.removeEventListener("keydown", handleRedoColor as unknown as EventListener);
        };
    }, [colorHistory, colorRedoStack]);


    const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        handleCanvasClick(e);
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        handleCanvasClick(e);
    };

    useEffect(() => {
        const handleKeyViewOverlay = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault(); // Hindari save file default di browser
                setShowOverlay((prev) => !prev); // Toggle overlay
            }
        };
    
        window.addEventListener("keydown", handleKeyViewOverlay as unknown as EventListener);
        return () => window.removeEventListener("keydown", handleKeyViewOverlay as unknown as EventListener);
    }, []);


    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
    
        // Clear the canvas before drawing the overlay
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCanvas()
    
        if (showOverlay && Array.isArray(allowedPixelPart) &&
            allowedPixelPart.length === 2 &&
            Array.isArray(allowedPixelPart[0]) &&
            Array.isArray(allowedPixelPart[1])
        ) {
            const xCoords = allowedPixelPart[0].map((val) => Number(val)); 
            const yCoords = allowedPixelPart[1].map((val) => Number(val));
    
            ctx.fillStyle = "rgba(0, 255, 0, 0.3)"; // transnparent color
    
            for (let i = 0; i < xCoords.length; i++) {
                const x = xCoords[i] * PIXEL_SIZE;
                const y = yCoords[i] * PIXEL_SIZE;
    
                // Draw shadow area only if the overlay is activated
                ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
            }
        }
    }, [showOverlay, allowedPixelPart]);
    

    const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        

        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX / PIXEL_SIZE);
        const y = Math.floor((e.clientY - rect.top) * scaleY / PIXEL_SIZE);
    
    
        // **Ensure that allowedPixelPart has the correct data structure**
        const allowedCoords = new Set<string>();

        if (
            Array.isArray(allowedPixelPart) && 
            allowedPixelPart.length === 2 &&
            Array.isArray(allowedPixelPart[0]) &&
            Array.isArray(allowedPixelPart[1])
        ) {
            const xCoords = allowedPixelPart[0].map((val) => BigInt(val));
            const yCoords = allowedPixelPart[1].map((val) => BigInt(val));

            for (let i = 0; i < xCoords.length; i++) {
                allowedCoords.add(`${xCoords[i].toString()},${yCoords[i].toString()}`);
            }
        }

        // Check if the coordinates are allowed
        if (!allowedCoords.has(`${x},${y}`)) {
            toast.error(`Coordinate (${x},${y}) out of range!`, { id: `coordinate-error`, style: { background: 'rgba(255, 0, 0, 0.5)', color: '#fff', fontFamily: 'monospace' } });
            return;
        }

        // Check if the pixel already exists
        const existingRectIndex = rects.findIndex((r) => r.x === x && r.y === y);
        if (existingRectIndex !== -1) {
            // Save color changes to history
            const prevColor = rects[existingRectIndex].color;
            if (prevColor !== selectedColor) {
                setColorHistory([...colorHistory, { x, y, prevColor, newColor: selectedColor }]);
                setColorRedoStack([]); // Reset redo stack due to new changes
            }

            // Update color pixel
            const updatedRects = [...rects];
            updatedRects[existingRectIndex].color = selectedColor;
            setRects(updatedRects);
        } else {
            // Add new pixel
            setRects([...rects, { x, y, color: selectedColor }]);
        }
    };

    const handleReset = () => {
        setRects([]);
        setHistory([]);
    };

    const drawCanvas = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.strokeStyle = "#ddd";
        for (let i = 0; i < CANVAS_SIZE; i += PIXEL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, CANVAS_SIZE);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(CANVAS_SIZE, i);
            ctx.stroke();
        }

        rects.forEach(({ x, y, color }) => {
            ctx.fillStyle = color;
            ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE); // Adjusted to draw at the correct position
        });
    };

    const updateSVGCode = () => {
        const svgRects = rects
            .map(
                (r) => `<rect x='${r.x}' y='${r.y}' width='1' height='1' fill='${r.color}'/>` // Updated width and height to 1
            )
            .join("\n");

        const templateSVG = `<svg shape-rendering="crispEdges" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="none"/>
            <!-- Pinguin Pixel Art -->
                <rect width="100%" height="100%" fill="#7556a8"/>
                <rect x='13' y='11' width='1' height='1' fill='#4B4C4F'/>
                <rect x='14' y='10' width='1' height='1' fill='#4B4C4F'/>
                <rect x='15' y='10' width='1' height='1' fill='#4B4C4F'/>
                <rect x='16' y='10' width='1' height='1' fill='#4B4C4F'/>
                <rect x='17' y='10' width='1' height='1' fill='#4B4C4F'/>
                <rect x='14' y='11' width='1' height='1' fill='#4B4C4F'/>
                <rect x='15' y='11' width='1' height='1' fill='#4B4C4F'/>
                <rect x='16' y='11' width='1' height='1' fill='#4B4C4F'/>
                <rect x='17' y='11' width='1' height='1' fill='#4B4C4F'/>
                <rect x='18' y='11' width='1' height='1' fill='#4B4C4F'/>
                <rect x='13' y='12' width='1' height='1' fill='#4B4C4F'/>
                <rect x='13' y='13' width='1' height='1' fill='#4B4C4F'/>
                <rect x='13' y='14' width='1' height='1' fill='#4B4C4F'/>
                <rect x='14' y='14' width='1' height='1' fill='#4B4C4F'/>
                <rect x='15' y='14' width='1' height='1' fill='#4B4C4F'/>
                <rect x='16' y='14' width='1' height='1' fill='#4B4C4F'/>
                <rect x='17' y='14' width='1' height='1' fill='#4B4C4F'/>
                <rect x='18' y='14' width='1' height='1' fill='#4B4C4F'/>
                <rect x='18' y='13' width='1' height='1' fill='#4B4C4F'/>
                <rect x='18' y='12' width='1' height='1' fill='#4B4C4F'/>
                <rect x='15' y='12' width='1' height='1' fill='#4B4C4F'/>
                <rect x='16' y='12' width='1' height='1' fill='#4B4C4F'/>
                <rect x='12' y='15' width='1' height='1' fill='#4B4C4F'/>
                <rect x='12' y='14' width='1' height='1' fill='#4B4C4F'/>
                <rect x='11' y='15' width='1' height='1' fill='#4B4C4F'/>
                <rect x='10' y='16' width='1' height='1' fill='#4B4C4F'/>
                <rect x='19' y='14' width='1' height='1' fill='#4B4C4F'/>
                <rect x='19' y='15' width='1' height='1' fill='#4B4C4F'/>
                <rect x='20' y='15' width='1' height='1' fill='#4B4C4F'/>
                <rect x='11' y='16' width='1' height='1' fill='#4B4C4F'/>
                <rect x='20' y='16' width='1' height='1' fill='#4B4C4F'/>
                <rect x='10' y='17' width='1' height='1' fill='#4B4C4F'/>
                <rect x='11' y='17' width='1' height='1' fill='#4B4C4F'/>
                <rect x='11' y='18' width='1' height='1' fill='#4B4C4F'/>
                <rect x='11' y='19' width='1' height='1' fill='#4B4C4F'/>
                <rect x='12' y='19' width='1' height='1' fill='#4B4C4F'/>
                <rect x='12' y='20' width='1' height='1' fill='#4B4C4F'/>
                <rect x='12' y='21' width='1' height='1' fill='#4B4C4F'/>
                <rect x='13' y='20' width='1' height='1' fill='#4B4C4F'/>
                <rect x='13' y='21' width='1' height='1' fill='#4B4C4F'/>
                <rect x='14' y='21' width='1' height='1' fill='#4B4C4F'/>
                <rect x='15' y='21' width='1' height='1' fill='#4B4C4F'/>
                <rect x='16' y='21' width='1' height='1' fill='#4B4C4F'/>
                <rect x='17' y='21' width='1' height='1' fill='#4B4C4F'/>
                <rect x='18' y='21' width='1' height='1' fill='#4B4C4F'/>
                <rect x='19' y='21' width='1' height='1' fill='#4B4C4F'/>
                <rect x='20' y='17' width='1' height='1' fill='#4B4C4F'/>
                <rect x='20' y='18' width='1' height='1' fill='#4B4C4F'/>
                <rect x='20' y='19' width='1' height='1' fill='#4B4C4F'/>
                <rect x='19' y='19' width='1' height='1' fill='#4B4C4F'/>
                <rect x='19' y='20' width='1' height='1' fill='#4B4C4F'/>
                <rect x='21' y='16' width='1' height='1' fill='#4B4C4F'/>
                <rect x='21' y='17' width='1' height='1' fill='#4B4C4F'/>
                <rect x='18' y='20' width='1' height='1' fill='#4B4C4F'/>
                <rect x='13' y='15' width='1' height='1' fill='#4B4C4F'/>
                <rect x='12' y='16' width='1' height='1' fill='#4B4C4F'/>
                <rect x='18' y='15' width='1' height='1' fill='#4B4C4F'/>
                <rect x='19' y='16' width='1' height='1' fill='#4B4C4F'/>
                <rect x='14' y='15' width='1' height='1' fill='#FFFFFF'/>
                <rect x='15' y='15' width='1' height='1' fill='#FFFFFF'/>
                <rect x='16' y='15' width='1' height='1' fill='#FFFFFF'/>
                <rect x='17' y='15' width='1' height='1' fill='#FFFFFF'/>
                <rect x='13' y='16' width='1' height='1' fill='#FFFFFF'/>
                <rect x='12' y='17' width='1' height='1' fill='#FFFFFF'/>
                <rect x='12' y='18' width='1' height='1' fill='#FFFFFF'/>
                <rect x='13' y='19' width='1' height='1' fill='#FFFFFF'/>
                <rect x='14' y='20' width='1' height='1' fill='#FFFFFF'/>
                <rect x='15' y='20' width='1' height='1' fill='#FFFFFF'/>
                <rect x='16' y='20' width='1' height='1' fill='#FFFFFF'/>
                <rect x='17' y='20' width='1' height='1' fill='#FFFFFF'/>
                <rect x='18' y='19' width='1' height='1' fill='#FFFFFF'/>
                <rect x='19' y='18' width='1' height='1' fill='#FFFFFF'/>
                <rect x='19' y='17' width='1' height='1' fill='#FFFFFF'/>
                <rect x='18' y='16' width='1' height='1' fill='#FFFFFF'/>
                <rect x='14' y='16' width='1' height='1' fill='#FFFFFF'/>
                <rect x='15' y='16' width='1' height='1' fill='#FFFFFF'/>
                <rect x='16' y='16' width='1' height='1' fill='#FFFFFF'/>
                <rect x='17' y='16' width='1' height='1' fill='#FFFFFF'/>
                <rect x='17' y='17' width='1' height='1' fill='#FFFFFF'/>
                <rect x='16' y='17' width='1' height='1' fill='#FFFFFF'/>
                <rect x='15' y='17' width='1' height='1' fill='#FFFFFF'/>
                <rect x='14' y='17' width='1' height='1' fill='#FFFFFF'/>
                <rect x='13' y='17' width='1' height='1' fill='#FFFFFF'/>
                <rect x='13' y='18' width='1' height='1' fill='#FFFFFF'/>
                <rect x='16' y='18' width='1' height='1' fill='#FFFFFF'/>
                <rect x='17' y='18' width='1' height='1' fill='#FFFFFF'/>
                <rect x='18' y='18' width='1' height='1' fill='#FFFFFF'/>
                <rect x='18' y='17' width='1' height='1' fill='#FFFFFF'/>
                <rect x='16' y='19' width='1' height='1' fill='#FFFFFF'/>
                <rect x='15' y='19' width='1' height='1' fill='#FFFFFF'/>
                <rect x='14' y='19' width='1' height='1' fill='#FFFFFF'/>
                <rect x='14' y='18' width='1' height='1' fill='#FFFFFF'/>
                <rect x='15' y='18' width='1' height='1' fill='#FFFFFF'/>
                <rect x='17' y='19' width='1' height='1' fill='#FFFFFF'/>
                <rect x='15' y='13' width='1' height='1' fill='#F5A623'/>
                <rect x='16' y='13' width='1' height='1' fill='#F5A623'/>
                <rect x='14' y='12' width='1' height='1' fill='#FFFFFF'/>
                <rect x='17' y='12' width='1' height='1' fill='#FFFFFF'/>
                <rect x='14' y='13' width='1' height='1' fill='#000000'/>
                <rect x='17' y='13' width='1' height='1' fill='#000000'/>
                <rect x='13' y='22' width='1' height='1' fill='#F5A623'/>
                <rect x='14' y='22' width='1' height='1' fill='#F5A623'/>
                <rect x='17' y='22' width='1' height='1' fill='#F5A623'/>
                <rect x='18' y='22' width='1' height='1' fill='#F5A623'/>
                \n${svgRects}\n
            </svg>`;
        setSvgCode(templateSVG);
        setAccessoryCode(svgRects);
    };

    // Hook minting transaction
    const { data: hash, error, writeContract } = useWriteContract();
    const { isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash });

    React.useEffect(() => {
        if (error) {
            toast.error(<p className="text-sm font-mono text-red-900">Error: {(error as BaseError).shortMessage || error.message}</p>)
        }
    }, [error]);


    React.useEffect(() => {
        if (isConfirmed) {
            if (loadingToast) {
                setLoadingToast(false);
            }
            toast.success(<p className="text-sm font-mono text-black/50 text-[#60ff00">Transaction confirmed!</p>)
        }
    }, [isConfirmed, loadingToast]);


    React.useEffect(() => {
        if (isConfirmed && hash && networkContract?.explore) {
            toast.success(
                <p className="text-sm font-mono text-black/30">
                    Transaction Hash:<br />
                    <a
                        href={`${networkContract.explore}/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#60ff00] underline"
                    >
                        {`${hash?.slice(0, 4)}...${hash?.slice(-10)}`}
                    </a>
                </p>
            );
            window.location.reload(); // Reload the page after showing the toast
        }
    }, [hash, networkContract?.explore]);

    async function handleMintAcc(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (accName == "") {
            toast.error(<p className="text-sm font-mono text-red-900">Error: Name accessory can't be null</p>)
        }
        if (svgToBytecode(accessoryCode) == "") {
            toast.error(<p className="text-sm font-mono text-red-900">Error: Pixel accessory can't be null</p>)
        }

        writeContract({
            address: contractAddress as Address,
            abi,
            functionName: "addAccessory",
            args: [
                selectedPengo,
                selectedAcc,
                accName,
                svgToBytecode(accessoryCode)
            ]
        });
    }

    return (
        <div className="flex sm:flex-row flex-col gap-4 items-center sm:items-start text-center px-2 mx-auto">
            <Toaster position="top-right" reverseOrder={true} />
            <div className="relative w-fit h-fit mx-auto my-4">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="border border-[rgba(219, 205, 205, 0.863)] cursor-crosshair w-full"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                />
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-[240px] my-4">
                {/* Display the template SVG below the canvas as a sketch base */}
                <div className="">
                    <button onClick={handleReset} className="text-xs sm:text-sm bg-black/60 border-purple-500 text-white py-1 px-2 rounded transition duration-200 ease-in-out hover:border-transparent border hover:bg-black/40 w-40">Reset Canvas</button>

                    <h3 className="text-md font-semibold">Sketch</h3>
                    <div dangerouslySetInnerHTML={{ __html: svgCode }} />
                    <form onSubmit={handleMintAcc} className="flex flex-col gap-2 justify-center">
                        <div className="flex flex-col gap-2 items-center my-4">
                            <input
                                type="text"
                                placeholder="Enter accessory name"
                                className="text-xs border font-mono bg-black/60 text-white border-purple-500 p-1 rounded w-40"
                                required
                                onChange={(e) => setAccName(e.target.value)}
                            />
                            <select
                                className='text-xs sm:text-sm bg-black/60 font-mono border-purple-500 text-white py-1 px-2 rounded transition duration-200 ease-in-out hover:border-white/30 border hover:bg-purple-500/80 w-40'
                                onChange={(e) => setSelectedPengo(e.target.value)}
                            >
                                {!loading && listOfAddress.map((tokenId, index) => (
                                    <option key={index} value={`${tokenId}`}>Pengo #{tokenId}</option>
                                ))}
                            </select>

                            <select
                                className='text-xs sm:text-sm bg-black/60 font-mono border-purple-500 text-white py-1 px-2 rounded transition duration-200 ease-in-out hover:border-white/30 border hover:bg-purple-500/80 w-40'
                                onChange={(e) => {
                                    setSelectedAccessory(e.target.value);
                                    handleReset();
                                }} // Store selected Accessory
                            >
                                {allowedAccesories.map((accessory, index) => (
                                    <option key={index} value={accessory}>
                                        {accessory}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 items-center">
                            {/* <button onClick={() => navigator.clipboard.writeText(svgToBytecode(accessoryCode))} className="text-xs sm:text-sm bg-black/60 border-purple-500 text-white py-1 px-2 rounded transition duration-200 ease-in-out hover:border-transparent border hover:bg-black/40 w-40">Copy Accessory Code</button> */}
                            <button
                                type="submit"
                                className='text-xs sm:text-sm bg-black/60 border-purple-500 text-white py-1 px-2 rounded transition duration-200 ease-in-out hover:border-transparent border hover:bg-black/40 w-40'
                            >Mint Accessory</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

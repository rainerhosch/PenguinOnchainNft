/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
    useMemo,
    useRef,
    useState,
    useEffect,
    MouseEvent,
} from "react";
import { Abi, Address } from "viem";
import { toast } from 'react-hot-toast';
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
    type BaseError,
} from "wagmi";
import PengoContract from "../../constants/PengoContract.json";
import SelectField from "@/components/ui/SelectField";
import {
    txToastError,
    txToastPending,
    txToastSuccess,
    txToastWallet,
} from "@/lib/txToast";

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
    const { address, chain } = useAccount();
    const [loading, setLoading] = useState(true);

    const [selectedPengo, setSelectedPengo] = useState("");
    const [selectedAcc, setSelectedAccessory] = useState("");
    const [accName, setAccName] = useState("");
    // canvas config
    const [showOverlay, setShowOverlay] = useState(false);


    const networkContract = chain?.id !== undefined
        ? PengoContract.networkDeployment.find(network => Number(network.chainId) === chain.id)
        : PengoContract.networkDeployment[1];
    const abi = networkContract?.abi;
    const abiFactory = networkContract?.abiFactory;
    const contractAddress = networkContract?.PengoAddress as Address;
    const factoryAddress = networkContract?.factoryAddress as Address;


    // Read list of NFT token IDs owned by the user
    const { data: listOf } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "tokensOfOwner",
        args: [address],
    });
    const listOfAddress: string[] = useMemo(() => (listOf as string[]) || [], [listOf]);

    const { data: allowedPart } = useReadContract({
        address: factoryAddress,
        abi: abiFactory as Abi,
        functionName: "getAllAllowedParts",
    });
    const allowedAccesories: string[] = useMemo(() => (allowedPart as string[]) || [], [allowedPart]);

    const { data: pixelPart } = useReadContract({
        address: factoryAddress,
        abi: abiFactory as Abi,
        functionName: "getPixelPart",
        args: [selectedAcc],
    });
    const allowedPixelPart: string[] = (pixelPart as string[]) || [];

    // Live preview: on-chain art for the selected Target Pengo
    const { data: selectedTokenURI, isLoading: isLoadingTokenURI } = useReadContract({
        address: contractAddress,
        abi: abi as Abi,
        functionName: "tokenURI",
        args: selectedPengo !== "" ? [BigInt(selectedPengo)] : undefined,
        query: {
            enabled: Boolean(contractAddress && selectedPengo !== ""),
        },
    });

    const [pengoPreviewSrc, setPengoPreviewSrc] = useState<string | null>(null);
    const [pengoPreviewName, setPengoPreviewName] = useState<string>("");

    useEffect(() => {
        setPengoPreviewSrc(null);
        setPengoPreviewName("");
        if (!selectedTokenURI || typeof selectedTokenURI !== "string") return;

        try {
            // data:application/json;base64,<payload>
            const raw = selectedTokenURI.includes(",")
                ? selectedTokenURI.split(",")[1]
                : selectedTokenURI;
            const metadata = JSON.parse(atob(raw)) as { name?: string; image?: string };
            setPengoPreviewSrc(metadata.image || null);
            setPengoPreviewName(metadata.name || `Pengo #${selectedPengo}`);
        } catch (err) {
            console.error("Failed to decode selected Pengo tokenURI", err);
            setPengoPreviewSrc(null);
        }
    }, [selectedTokenURI, selectedPengo]);

    // Accessory-only overlay SVG (drawn pixels), transparent bg — layered on selected Pengo
    const accessoryOverlaySvg = useMemo(() => {
        if (!rects.length) return "";
        const svgRects = rects
            .map((r) => `<rect x='${r.x}' y='${r.y}' width='1' height='1' fill='${r.color}'/>`)
            .join("");
        return `<svg shape-rendering="crispEdges" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">${svgRects}</svg>`;
    }, [rects]);

    useEffect(() => {
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
        redrawScene();
    }, [rects, showOverlay, allowedPixelPart]);

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

    // Draw-area overlay: toggle ONLY via user shortcut (Ctrl/Cmd+S) — never auto-hide on paint
    useEffect(() => {
        const handleKeyViewOverlay = (e: globalThis.KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "s") {
                e.preventDefault(); // block browser "Save page"
                setShowOverlay((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyViewOverlay);
        return () => window.removeEventListener("keydown", handleKeyViewOverlay);
    }, []);


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
            toast.error(`Coordinate (${x},${y}) out of range!`, { id: `coordinate-error`, style: { background: 'rgba(255, 0, 85, 0.404)', color: '#fff', fontFamily: 'monospace' } });
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

    /** Grid + painted pixels + optional allowed-draw overlay (if showOverlay is on). */
    const redrawScene = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Grid
        ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
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

        // Allowed draw area — stays visible while showOverlay is true (shortcut-controlled only)
        if (
            showOverlay &&
            Array.isArray(allowedPixelPart) &&
            allowedPixelPart.length === 2 &&
            Array.isArray(allowedPixelPart[0]) &&
            Array.isArray(allowedPixelPart[1])
        ) {
            const xCoords = (allowedPixelPart[0] as unknown[]).map((val) => Number(val));
            const yCoords = (allowedPixelPart[1] as unknown[]).map((val) => Number(val));
            ctx.fillStyle = "rgba(172, 255, 0, 0.28)";
            for (let i = 0; i < xCoords.length; i++) {
                ctx.fillRect(xCoords[i] * PIXEL_SIZE, yCoords[i] * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            }
        }

        // User pixels on top of overlay so drawing never “hides” the guide incorrectly
        rects.forEach(({ x, y, color }) => {
            ctx.fillStyle = color;
            ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
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

    // Hook minting transaction — single toast id for the whole lifecycle
    const ACC_TX_TOAST = "studio-mint-accessory";
    const {
        data: hash,
        error,
        isPending,
        writeContract,
        reset: resetWrite,
    } = useWriteContract();
    const {
        isSuccess: isConfirmed,
        isLoading: isConfirming,
        isError: isReceiptError,
        error: receiptError,
    } = useWaitForTransactionReceipt({ hash });

    const handledErrorRef = useRef<string | null>(null);
    const handledSuccessRef = useRef(false);
    const handledHashRef = useRef<string | null>(null);

    // 1) Wallet / write error
    useEffect(() => {
        if (!error) return;
        const key = error.message;
        if (handledErrorRef.current === key) return;
        handledErrorRef.current = key;
        const msg =
            (error as BaseError).shortMessage || error.message || "Transaction failed";
        txToastError(ACC_TX_TOAST, msg);
    }, [error]);

    // 2) Hash received → waiting for confirmation (replace loading toast)
    useEffect(() => {
        if (!hash) return;
        if (handledHashRef.current === hash) return;
        handledHashRef.current = hash;
        txToastPending(ACC_TX_TOAST, hash, networkContract?.explore);
    }, [hash, networkContract?.explore]);

    // 3) Confirmed → success with hash, then reload collection
    useEffect(() => {
        if (!isConfirmed || !hash || handledSuccessRef.current) return;
        handledSuccessRef.current = true;
        txToastSuccess(ACC_TX_TOAST, {
            title: "Accessory minted on-chain",
            hash,
            explorer: networkContract?.explore,
            reloadMs: 1800,
        });
    }, [isConfirmed, hash, networkContract?.explore]);

    // Receipt failure
    useEffect(() => {
        if (!isReceiptError || !receiptError) return;
        const msg =
            (receiptError as BaseError).shortMessage ||
            receiptError.message ||
            "Transaction reverted";
        txToastError(ACC_TX_TOAST, msg);
    }, [isReceiptError, receiptError]);

    async function handleMintAcc(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isPending || isConfirming) return;

        if (!selectedPengo) {
            toast.error("Select a Target Pengo first", { id: "acc-validation" });
            return;
        }
        if (accName.trim() === "") {
            toast.error("Enter an accessory name", { id: "acc-validation" });
            return;
        }
        if (svgToBytecode(accessoryCode) === "") {
            toast.error("Draw at least one pixel before minting", { id: "acc-validation" });
            return;
        }

        handledErrorRef.current = null;
        handledSuccessRef.current = false;
        handledHashRef.current = null;
        resetWrite();

        txToastWallet(ACC_TX_TOAST, "Confirm accessory mint in your wallet…");

        writeContract({
            address: contractAddress as Address,
            abi: abi as Abi,
            functionName: "addAccessory",
            args: [
                selectedPengo,
                selectedAcc || "",
                accName.trim(),
                svgToBytecode(accessoryCode),
            ],
        });
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-start">
            {/* Canvas stage */}
            <section className="studio-panel min-w-0">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h3 className="text-sm font-semibold text-white">Canvas</h3>
                        <p className="text-[11px] text-neutral-500">
                            30×30 pixel grid · paint with the active color
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-[11px] text-neutral-300"
                            title="Active brush color"
                        >
                            <span
                                className="h-3.5 w-3.5 rounded-full border border-white/30"
                                style={{ backgroundColor: selectedColor }}
                            />
                            Brush
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowOverlay((prev) => !prev)}
                            className={[
                                "rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                                showOverlay
                                    ? "border-primary-500/60 bg-primary-500/15 text-primary-400"
                                    : "border-white/10 bg-white/5 text-neutral-300 hover:border-primary-500/50 hover:text-primary-400",
                            ].join(" ")}
                            title="Toggle allowed draw area (Ctrl+S / Cmd+S)"
                        >
                            {showOverlay ? "Draw area: On" : "Draw area: Off"}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-neutral-300 transition-colors hover:border-primary-500/50 hover:text-primary-400"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                <div className="studio-canvas-stage mx-auto w-full max-w-[640px]">
                    <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]">
                        {/* subtle grid vibe behind canvas */}
                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.07]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(rgba(172,255,0,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(172,255,0,0.35) 1px, transparent 1px)",
                                backgroundSize: "20px 20px",
                            }}
                        />
                        <canvas
                            ref={canvasRef}
                            width={CANVAS_SIZE}
                            height={CANVAS_SIZE}
                            className="relative z-[1] h-full w-full cursor-crosshair touch-none"
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseUp}
                        />
                    </div>
                </div>
            </section>

            {/* Mint / publish panel */}
            <aside className="studio-panel overflow-visible relative z-10 lg:sticky lg:top-24">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">Mint accessory</h3>
                    <span className="rounded-md bg-primary-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-400">
                        On-chain
                    </span>
                </div>

                <div className="mb-4">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                            Live preview
                        </p>
                        {selectedPengo !== "" && (
                            <span className="truncate text-[10px] text-primary-400/90">
                                {pengoPreviewName || `Pengo #${selectedPengo}`}
                            </span>
                        )}
                    </div>
                    <div className="relative mx-auto flex aspect-square w-full max-w-[160px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/60 p-2">
                        {!selectedPengo ? (
                            <p className="px-2 text-center text-[10px] text-neutral-600">
                                Select a Target Pengo
                            </p>
                        ) : isLoadingTokenURI && !pengoPreviewSrc ? (
                            <p className="text-center text-[10px] text-neutral-500 animate-pulse">
                                Loading Pengo…
                            </p>
                        ) : pengoPreviewSrc ? (
                            <>
                                {/* On-chain art for selected Target Pengo */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={pengoPreviewSrc}
                                    alt={pengoPreviewName || `Pengo #${selectedPengo}`}
                                    className="absolute inset-0 h-full w-full object-contain"
                                />
                                {/* Live accessory strokes composited on top */}
                                {accessoryOverlaySvg ? (
                                    <div
                                        className="pointer-events-none absolute inset-0 [&_svg]:h-full [&_svg]:w-full"
                                        dangerouslySetInnerHTML={{ __html: accessoryOverlaySvg }}
                                    />
                                ) : null}
                            </>
                        ) : (
                            <p className="px-2 text-center text-[10px] text-neutral-600">
                                Could not load Pengo art
                            </p>
                        )}
                    </div>
                    <p className="mt-1.5 text-center text-[9px] text-neutral-600">
                        Updates when you change Target Pengo or paint
                    </p>
                </div>

                <form onSubmit={handleMintAcc} className="flex flex-col gap-3">
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                            Accessory name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Neon Visor"
                            className="input-field text-sm"
                            required
                            onChange={(e) => setAccName(e.target.value)}
                        />
                    </div>

                    <SelectField
                        size="sm"
                        label="Target Pengo"
                        value={selectedPengo}
                        onChange={(e) => setSelectedPengo(e.target.value)}
                        options={
                            !loading
                                ? listOfAddress.map((tokenId) => ({
                                    value: `${tokenId}`,
                                    label: `Pengo #${tokenId}`,
                                }))
                                : []
                        }
                        placeholder={loading ? "Loading…" : "Select Pengo"}
                        hint={
                            !loading && listOfAddress.length === 0
                                ? "No Pengos in this wallet"
                                : undefined
                        }
                    />

                    <SelectField
                        size="sm"
                        label="Accessory slot"
                        value={selectedAcc}
                        onChange={(e) => {
                            setSelectedAccessory(e.target.value);
                            handleReset();
                        }}
                        options={allowedAccesories.map((accessory) => ({
                            value: accessory,
                            label: accessory,
                        }))}
                        placeholder="Select slot"
                    />

                    <button
                        type="submit"
                        disabled={isPending || isConfirming}
                        className={`btn-primary mt-1 w-full py-2.5 text-sm ${
                            isPending || isConfirming ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                    >
                        {isPending
                            ? "Confirm in wallet…"
                            : isConfirming
                              ? "Confirming…"
                              : "Mint Accessory"}
                    </button>
                </form>
            </aside>
        </div>
    );
}

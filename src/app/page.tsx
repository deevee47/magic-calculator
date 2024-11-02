"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { SWATCHES } from "../../constants";
import toast from "react-hot-toast";

interface Response {
  expr: string;
  result: string;
  assigned: boolean;
}

interface GeneratedResponse {
  expr: string;
  result: string;
}

interface Variables {
  [key: string]: string | number;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("rgb(255,255,255)");
  const [reset, setReset] = useState(false);
  const [result, setResult] = useState<GeneratedResponse | null>(null);
  const [variables, setVariables] = useState<Variables>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reset) {
      resetCanvas();
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - canvas.offsetTop;
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
      }
    }
  }, []);

  const sendData = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const isEmpty = pixels.every((pixel, index) => {
      return index % 4 === 3 ? true : pixel === 0;
    });

    if (isEmpty) {
      toast.error("Please draw something first!");
      return;
    }

    setLoading(true);

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          },
          "image/jpeg",
          0.8
        );
      });

      const formData = new FormData();
      formData.append("image", blob, "drawing.jpg");
      formData.append("variables", JSON.stringify(variables));

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }

      if (data.results?.[0]) {
        setResult(data.results[0]);
        toast.success("Analysis complete!");
      } else {
        toast.error("No results found");
      }
    } catch (error) {
      console.error("Full error details:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze drawing");
    } finally {
      setLoading(false);
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setResult(null);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.background = "black";
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
      }
    }
  };

  const stopDrawing = () => setIsDrawing(false);

  const captureDrawing = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = selectedColor;
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="grid grid-cols-3 gap-2 p-4">
        <button
          onClick={() => resetCanvas()}
          className="z-10 font-bold rounded-xl py-3 px-6 bg-red-500 hover:bg-red-600"
          disabled={loading}
        >
          Reset
        </button>
        <div className="z-10 grid grid-cols-12 gap-2 font-bold rounded-xl py-3 px-6">
          {SWATCHES.map((color, index) => (
            <p
              key={index}
              onClick={() => setSelectedColor(color)}
              style={{ backgroundColor: color }}
              className="rounded-full w-8 h-8 cursor-pointer border-2 border-white"
            />
          ))}
        </div>
        <button
          onClick={() => sendData()}
          className="z-10 font-bold rounded-xl py-3 px-6 bg-green-500 hover:bg-green-600"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className="fixed top-4 right-4 left-4 z-20 flex justify-center">
          <div className="relative bg-gray-800 text-white p-6 rounded-xl shadow-lg border-2 border-green-500 max-w-lg w-full mx-auto">
            <button
              onClick={() => setResult(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 text-5xl mr-2"
            >
              &times;
            </button>
            <div className="text-xl font-bold mb-3 text-center">
              Expression:{" "}
              <span className="text-yellow-400">{result.expr}</span>
            </div>
            <div className="text-2xl font-bold text-center">
              Result: <span className="text-green-400">{result.result}</span>
            </div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={captureDrawing}
        onMouseOut={stopDrawing}
        onMouseUp={stopDrawing}
        className="flex-1 w-full"
      />
    </div>
  );
}

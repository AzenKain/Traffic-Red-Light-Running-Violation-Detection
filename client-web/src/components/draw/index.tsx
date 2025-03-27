import { LineType, VectorType } from "@/types";
import { useState, useRef, useEffect } from "react";

export default function AnnotateImage({ imageSrc, cameraId }: { imageSrc: string, cameraId: number }) {
  const [points, setPoints] = useState<VectorType[]>([]);
  const [lines, setLines] = useState<LineType[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number, height: number } | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const maxWidth = 800;
  const maxHeight = 600;

  // Load the image and set dimensions
  useEffect(() => {
    if (!imageSrc) return;
    
    // Create image reference
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const origWidth = img.width;
      const origHeight = img.height;
      setOriginalDimensions({ width: origWidth, height: origHeight });

      let newScale = 1;
      if (origWidth > maxWidth || origHeight > maxHeight) {
        const widthRatio = maxWidth / origWidth;
        const heightRatio = maxHeight / origHeight;
        newScale = Math.min(widthRatio, heightRatio);
      }
      setScale(newScale);

      if (canvasRef.current) {
        canvasRef.current.width = origWidth * newScale;
        canvasRef.current.height = origHeight * newScale;
      }
      
      // Store image reference and set loaded flag
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [imageSrc]);

  // Fetch lines data
  useEffect(() => {
    if (!cameraId) return;
    
    const fetchLines = async () => {
      try {
        const response = await fetch(`http://localhost:8000/line?camera_id=${cameraId}`);
        const data = await response.json();
        if (data.lines && data.ratio) {

          const transformedLines = data.lines.map((line: LineType) => ({
            start: { x: line.start.x * data.ratio * scale, y: line.start.y * data.ratio * scale },
            end: { x: line.end.x * data.ratio * scale, y: line.end.y * data.ratio * scale}
          }));
          console.log("Fetched lines:", data.lines);
          setLines(transformedLines);
        }
      } catch (error) {
        console.error("Error fetching lines:", error);
      }
    };

    fetchLines();
  }, [cameraId, scale]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageSrc) return;

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (!isDrawing) {
        setPoints([{ x, y }]);
        setIsDrawing(true);
      } else {
        const newPoint = { x, y };
        const startPoint = points[0];

        const newLine = { start: startPoint, end: newPoint };
        setLines([...lines, newLine]);

        setPoints([]);
        setIsDrawing(false);
      }
    }
  };

  // Draw canvas whenever relevant state changes or image is loaded
  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [points, lines, scale, imageLoaded]);

  const drawCanvas = () => {
    if (!canvasRef.current || !imageRef.current || !originalDimensions) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      imageRef.current, 
      0, 
      0, 
      originalDimensions.width * scale, 
      originalDimensions.height * scale
    );
    
    // Draw existing lines
    lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      ctx.strokeStyle = "#FF3B30";
      ctx.lineWidth = 2;
      ctx.stroke();
      drawPoint(ctx, line.start.x, line.start.y, "#FF3B30");
      drawPoint(ctx, line.end.x, line.end.y, "#FF3B30");
    });
    
    // Draw current point if drawing
    if (points.length === 1) {
      drawPoint(ctx, points[0].x, points[0].y, "#007AFF");
    }
  };

  const drawPoint = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const clearCanvas = () => {
    setPoints([]);
    setLines([]);
    console.log("Canvas cleared");
  };

  const saveLines = async () => {
    try {
      const transformedLines = lines.map(line => ({
        start: { x: line.start.x / scale, y: line.start.y / scale },
        end: { x: line.end.x / scale, y: line.end.y / scale }
      }));

      const response = await fetch("http://localhost:8000/line/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ camera_id: cameraId, lines: transformedLines, ratio: scale }),
      });

      const result = await response.json();
      console.log("Save result:", result);
    } catch (error) {
      console.error("Error saving lines:", error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 flex justify-center">
      <div className="bg-white rounded-xl shadow-md w-full max-w-4xl overflow-hidden">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold text-center text-gray-800">Image Annotation Tool</h1>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 m-2">
          <div className="flex gap-2">
            <button
              onClick={clearCanvas}
              className="btn btn-info hover:bg-gray-200 text-gray-700 text-sm py-1.5 px-3 rounded-md transition-colors"
            >
              Clear Lines
            </button>
            <button
              onClick={saveLines}
              className="btn btn-success hover:bg-gray-200 text-gray-700 text-sm py-1.5 px-3 rounded-md transition-colors"
            >
              Save Lines
            </button>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            {originalDimensions && (
              <p>
                {originalDimensions.width}×{originalDimensions.height}px
                {scale !== 1 && ` (scale: ${scale.toFixed(2)})`}
              </p>
            )}
          </div>
        </div>
        <div className="p-4">
          {imageSrc ? (
            <div className="relative mb-4">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="cursor-crosshair mx-auto border border-gray-200 rounded-lg shadow-sm"
              />
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                {isDrawing ? "Click to complete line" : "Click to start line"}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 w-full h-64 mb-4">
              <p className="text-gray-400 text-sm">
                Upload an image to begin annotating
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
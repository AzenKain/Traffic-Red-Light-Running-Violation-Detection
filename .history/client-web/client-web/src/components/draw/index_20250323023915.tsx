import { useState, useRef, useEffect } from "react";

export default function AnnotateImage({ imageSrc }: { imageSrc: string }) {
    const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
    const [lines, setLines] = useState<{ start: { x: number; y: number }, end: { x: number; y: number } }[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [originalDimensions, setOriginalDimensions] = useState<{ width: number, height: number } | null>(null);
    const [scale, setScale] = useState<number>(1);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const maxWidth = 800;
    const maxHeight = 600;
  
    useEffect(() => {
      if (!imageSrc) return;
  
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
          drawCanvas();
        }
      };
    }, [imageSrc]);
  
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
          setLines([...lines, { start: startPoint, end: newPoint }]);
          setPoints([]);
          setIsDrawing(false);
        }
      }
    };
  
    useEffect(() => {
      drawCanvas();
    }, [points, lines, scale]);
  
    const drawCanvas = () => {
      if (canvasRef.current && imageSrc && originalDimensions) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const img = new Image();
          img.src = imageSrc;
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, originalDimensions.width * scale, originalDimensions.height * scale);
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
            if (points.length === 1) {
              drawPoint(ctx, points[0].x, points[0].y, "#007AFF");
            }
          };
        }
      }
    };
  
    const drawPoint = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    };
  
    const clearLines = () => {
      setLines([]);
      setPoints([]);
      drawCanvas();
    };
  
    const saveLines = () => {
      console.log("Saved lines:", lines);
    };
  
    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Image Annotation Tool</h1>
          
          <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <label className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded cursor-pointer transition-colors">
              Upload Image
              <input 
                type="file" 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </label>
            
            <button 
              onClick={clearCanvas}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
              disabled={!image}
            >
              Clear Lines
            </button>
            
            <button 
              onClick={saveLines}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
              disabled={lines.length === 0}
            >
              Save Lines
            </button>
          </div>
          
          {originalDimensions && (
            <p className="text-sm text-gray-500 text-center mb-2">
              Original image: {originalDimensions.width}×{originalDimensions.height}px 
              {scale !== 1 && ` (scaled by ${scale.toFixed(2)})`}
            </p>
          )}
          

          {lines.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-medium mb-2">Lines ({lines.length})</h3>
              <div className="max-h-40 overflow-y-auto">
                {lines.map((line, index) => {
                  const origStart = {
                    x: Math.round(line.start.x / scale),
                    y: Math.round(line.start.y / scale)
                  };
                  const origEnd = {
                    x: Math.round(line.end.x / scale),
                    y: Math.round(line.end.y / scale)
                  };
                  
                  return (
                    <div key={index} className="text-sm text-gray-700 mb-1">
                      Line {index + 1}: 
                      <span className="text-gray-500"> Canvas: </span>
                      ({line.start.x.toFixed(0)}, {line.start.y.toFixed(0)}) → ({line.end.x.toFixed(0)}, {line.end.y.toFixed(0)})
                      <span className="text-gray-500"> Original: </span>
                      ({origStart.x}, {origStart.y}) → ({origEnd.x}, {origEnd.y})
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
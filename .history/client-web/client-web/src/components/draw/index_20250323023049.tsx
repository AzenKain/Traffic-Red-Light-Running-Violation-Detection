

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
  
    return (
      <div className="relative border-4 border-gray-200 rounded">
        <canvas ref={canvasRef} onClick={handleCanvasClick} className="cursor-crosshair" />
      </div>
    );
  }
  
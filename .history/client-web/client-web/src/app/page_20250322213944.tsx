"use client";
import { useState, useRef, useEffect } from "react";

export default function App() {


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
        
        <div className="flex justify-center mb-4" ref={containerRef}>
          {image ? (
            <div className="relative border-4 border-gray-200 rounded">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="cursor-crosshair"
              />
              
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded">
                {isDrawing ? "Click to complete line" : "Click to start line"}
              </div>
            </div>
          ) : (
            <div className="border-4 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 w-full h-96">
              <p className="text-gray-500 text-center p-4">
                Upload an image to begin annotating
              </p>
            </div>
          )}
        </div>
        
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
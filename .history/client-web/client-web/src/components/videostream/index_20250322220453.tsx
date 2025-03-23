"use client";
import { useEffect, useState } from "react";

export default function VideoStream() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onmessage = (event) => {
      setImageSrc(`data:image/jpeg;base64,${event.data}`);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">Live we</h2>
      {imageSrc ? (
        <img src={imageSrc} alt="Live Stream" className="rounded-lg shadow-lg" />
      ) : (
        <p>Loading video...</p>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function VideoStream() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:8000");

    socket.on("video_frame", (data: string) => {
      setImageSrc(`data:image/jpeg;base64,${data}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">Live Stream</h2>
      {imageSrc ? (
        <img src={imageSrc} alt="Live Stream" className="rounded-lg shadow-lg" />
      ) : (
        <p>Loading video...</p>
      )}
    </div>
  );
}

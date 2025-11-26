import React from "react";

export default function AudioPlayer({ file }) {
  if (!file) return null;

  const src = URL.createObjectURL(file);

  return (
    <div className="audio-player">
      <p className="audio-label">Preview audio</p>
      <audio controls src={src} className="audio-element">
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadAndTranscribe } from "../api.js";
import AudioPlayer from "../components/AudioPlayer.jsx";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setResult(null);
      setStatus("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    try {
      setLoading(true);
      setStatus("Uploading and transcribing…");
      const data = await uploadAndTranscribe(file);
      setResult(data);
      setStatus("Done!");
    } catch (err) {
      console.error(err);
      setStatus("Error during transcription.");
      alert(err.message || "Transcription failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">New Lecture</h1>
      <p className="page-subtitle">
        Upload an audio file and let Whisper create a transcript and summary.
      </p>

      <form onSubmit={handleSubmit} className="upload-form">
        <label className="file-drop">
          <span className="file-drop-label">
            {file ? file.name : "Click to choose an audio file"}
          </span>
          <span className="file-drop-hint">Supports most common audio types</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="file-input-hidden"
          />
        </label>

        <AudioPlayer file={file} />

        <button
          type="submit"
          className="primary-button"
          disabled={!file || loading}
        >
          {loading ? "Processing…" : "Transcribe lecture"}
        </button>

        {status && <p className="status-text">{status}</p>}
      </form>

      {result && (
        <div className="result-card">
          <h2 className="section-title">Summary</h2>
          <p className="summary-text">{result.summary}</p>

          <button
            className="secondary-button"
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

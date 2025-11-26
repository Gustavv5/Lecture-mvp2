import React, { useEffect, useState } from "react";
import { getHistory, deleteLecture } from "../api/api.js";
import LectureCard from "../components/LectureCard.jsx";

export default function Dashboard() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      const data = await getHistory();
      setLectures(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load lectures");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this lecture?")) return;
    try {
      await deleteLecture(id);
      setLectures((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert("Failed to delete lecture");
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Lecture Library</h1>
      <p className="page-subtitle">
        Upload lectures, transcribe them with Whisper, and get study-friendly
        summaries.
      </p>

      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-label">Total lectures</p>
          <p className="stat-value">{lectures.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Latest lecture</p>
          <p className="stat-value">
            {lectures[0]?.filename || "None yet"}
          </p>
        </div>
      </div>

      <h2 className="section-title">Your lectures</h2>

      {loading && <p>Loading lectures…</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && lectures.length === 0 && (
        <p className="muted-text">
          No lectures yet. Click “New Lecture” in the header to upload one.
        </p>
      )}

      <div className="lectures-grid">
        {lectures.map((lecture) => (
          <div key={lecture.id} className="lecture-card-wrapper">
            <LectureCard lecture={lecture} />
            <button
              className="delete-button"
              onClick={() => handleDelete(lecture.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

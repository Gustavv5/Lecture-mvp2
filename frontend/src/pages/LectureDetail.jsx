import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { extractKeyPoints, guessCategory } from "../utils/utils.js";

export default function LectureDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const lecture = location.state?.lecture;

  const [showFull, setShowFull] = useState(false);

  const keyPoints = useMemo(() => {
    if (!lecture?.transcript) return [];
    return extractKeyPoints(lecture.transcript, 5);
  }, [lecture]);

  if (!lecture) {
    // Simpler than re-fetching; good enough for MVP
    return (
      <div className="page">
        <h1 className="page-title">Lecture {id}</h1>
        <p className="error-text">
          No lecture data provided. Go back to the dashboard and open it again.
        </p>
        <button className="secondary-button" onClick={() => navigate("/")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const category = guessCategory(lecture.transcript || "");

  return (
    <div className="page">
      <button className="secondary-button small" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 className="page-title">
  {(lecture.filename || "Lecture").replace(/\.[^/.]+$/, "")}
</h1>

      <p className="page-subtitle">Category: {category}</p>

      <div className="result-card">
        <h2 className="section-title">Summary</h2>
        <p className="summary-text">{lecture.summary}</p>
      </div>

      <div className="result-card">
        <h2 className="section-title">Key points</h2>
        {keyPoints.length === 0 ? (
          <p className="muted-text">No key points could be extracted.</p>
        ) : (
          <ul className="keypoints-list">
            {keyPoints.map((kp, idx) => (
              <li key={idx}>{kp.point}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="result-card">
        <h2 className="section-title">Transcript</h2>
        {!showFull ? (
          <>
            <p className="transcript-preview">
              {lecture.transcript?.slice(0, 400) || "No transcript"}
              {lecture.transcript && lecture.transcript.length > 400 && "…"}
            </p>
            {lecture.transcript && lecture.transcript.length > 400 && (
              <button
                className="secondary-button small"
                onClick={() => setShowFull(true)}
              >
                Show full transcript
              </button>
            )}
          </>
        ) : (
          <>
            <p className="transcript-full">
              {lecture.transcript || "No transcript"}
            </p>
            <button
              className="secondary-button small"
              onClick={() => setShowFull(false)}
            >
              Show less
            </button>
          </>
        )}
      </div>
    </div>
  );
}

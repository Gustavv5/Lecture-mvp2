import React from "react";
import { Link } from "react-router-dom";
import { guessCategory } from "../utils.js";

export default function LectureCard({ lecture }) {
  const category = guessCategory(lecture.transcript || "");

  return (
    <Link to={withCode(`/lecture/${lecture.id}`)}
          state={{ lecture }}
    >
      <div className="lecture-card">
        <div className="lecture-card-top-bar" />
        <div className="lecture-card-body">
          <div className="lecture-card-header">
            <div>
              <h3 className="lecture-title">
                {lecture.filename || "Untitled lecture"}
              </h3>
              <p className="lecture-category">{category}</p>
            </div>
            <span className="lecture-chip">{category}</span>
          </div>
          <p className="lecture-summary">
            {lecture.summary || "No summary available"}
          </p>
        </div>
      </div>
    </Link>
  );
}

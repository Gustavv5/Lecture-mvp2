import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Upload from "./pages/Upload.jsx";
import LectureDetail from "./pages/LectureDetail.jsx";
import { ACCESS_CODE } from "./api/api";
import { withCode } from "./utils/urlTools"; // <-- You MUST create this helper

export default function App() {
  // Block UI unless ?code=SECRET is present
  if (!ACCESS_CODE) {
    return (
      <div style={{ padding: 20, fontSize: "18px" }}>
        ❌ <strong>Access code missing</strong><br />
        Add <code>?code=YOURCODE</code> to the URL.
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-root">
        <header className="app-header">
          <Link to={withCode("/")} className="logo">
            Lecture Library
          </Link>

          <nav className="nav-links">
            <Link to={withCode("/")}>Dashboard</Link>
            <Link to={withCode("/upload")}>New Lecture</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/lecture/:id" element={<LectureDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

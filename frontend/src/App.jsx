import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import Upload from "./pages/Upload.jsx";
import LectureDetail from "./pages/LectureDetail.jsx";

import AccessGate from "./components/AccessGate.jsx";  // <-- YOU have AccessGate here
import { ACCESS_CODE } from "./api/api.js"; // <-- Your actual path
import { withCode } from "./utils/urlTools.js"; // <-- Your actual path

export default function App() {

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
      <AccessGate>
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
      </AccessGate>
    </BrowserRouter>
  );
}

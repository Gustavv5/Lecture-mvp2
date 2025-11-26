import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Upload from "./pages/Upload.jsx";
import LectureDetail from "./pages/LectureDetail.jsx";
import { ACCESS_CODE } from "./api/api";

if (!ACCESS_CODE) {
  return <div style={{ padding: 20 }}>❌ Access code missing in URL.<br/>
  Add ?code=YOURCODE to the address bar.</div>;
}


export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <Link to="/" className="logo">
          <span className="logo-dot" />
          Lecture Library
        </Link>
        <nav className="nav-links">
          <Link to="/">Dashboard</Link>
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
  );
}


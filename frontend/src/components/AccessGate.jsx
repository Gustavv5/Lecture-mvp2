import React from "react";
import { ACCESS_CODE } from "./api/api.js";

export default function AccessGate({ children }) {
  if (!ACCESS_CODE) {
    return (
      <div style={{ padding: 20 }}>
        ❌ Access code missing.  
        Add <code>?code=CODE</code> to the URL.
      </div>
    );
  }

  return children;
}

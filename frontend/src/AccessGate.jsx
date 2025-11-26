import { useState } from "react";

export default function AccessGate({ children }) {
  const [code, setCode] = useState("");

  function submit() {
    localStorage.setItem("ACCESS_CODE", code);
    window.location.reload();
  }

  if (!localStorage.getItem("ACCESS_CODE")) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Enter access code</h2>
        <input value={code} onChange={e => setCode(e.target.value)} />
        <button onClick={submit}>Enter</button>
      </div>
    );
  }

  return children;
}

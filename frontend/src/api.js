const API_BASE = "https://lecture-mvp2-1.onrender.com";

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) {
    throw new Error("Failed to load history");
  }
  return await res.json();
}

export async function uploadAndTranscribe(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Transcription failed");
  }

  return await res.json();
}

export async function deleteLecture(id) {
  const res = await fetch(`${API_BASE}/lecture/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete lecture");
  }
  return await res.json();
}

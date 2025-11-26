// Read ?code=SECRET from URL
const urlParams = new URLSearchParams(window.location.search);
export const ACCESS_CODE = urlParams.get("code") || null;

const API_BASE = "https://lecture-mvp2-1.onrender.com";

export async function uploadAudio(file) {
  const formData = new FormData();
  formData.append("file", file);

  return fetch(`${API_BASE}/transcribe`, {
    method: "POST",
    headers: {
      "X-ACCESS-CODE": ACCESS_CODE,
    },
    body: formData,
  }).then((r) => r.json());
}

export async function getHistory() {
  return fetch(`${API_BASE}/history`, {
    headers: {
      "X-ACCESS-CODE": ACCESS_CODE,
    },
  }).then((r) => r.json());
}

export async function getLecture(id) {
  return fetch(`${API_BASE}/lecture/${id}`, {
    headers: {
      "X-ACCESS-CODE": ACCESS_CODE,
    },
  }).then((r) => r.json());
}
